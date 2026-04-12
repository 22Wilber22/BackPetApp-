# Prompt Maestro - Backend Node.js + Firebase Seguro para PetApp
> v3 — Incluye modelos Flutter de referencia + correcciones de seguridad

## Contexto
Tengo una app Flutter llamada **PetApp** y quiero separar la arquitectura en:
- **Frontend**: Flutter (cliente)
- **Backend**: Node.js + TypeScript + Express (API)

Quiero que implementes un backend profesional, seguro y listo para producción inicial, con autenticación, roles, control de acceso, y buenas prácticas para proteger datos sensibles de usuarios, mascotas, veterinarios y citas.

---

## Objetivo principal
Generar un backend completo en carpeta `backend/` con:
1. Autenticación segura
2. Autorización por roles
3. Integración con Firebase (Admin SDK + Firestore)
4. Endpoints REST para usuarios, mascotas, veterinarios, veterinarias y citas
5. Seguridad robusta para evitar robo de información o accesos indebidos
6. Documentación clara para ejecutar y desplegar

---

## Stack obligatorio
- Node.js LTS
- TypeScript
- Express
- Firebase Admin SDK
- Firestore
- Zod (validación)
- Helmet (headers de seguridad)
- CORS con lista blanca
- Rate limiting (`express-rate-limit`)
- pino o winston (logging)
- dotenv
- tsup o tsc para build
- vitest + supertest (testing)

> ❌ NO incluir `csurf`: esta es una API REST consumida por Flutter (mobile/desktop), no por un navegador con cookies. La protección CSRF no aplica en este contexto y su inclusión puede causar bugs.
> ❌ NO incluir `express-mongo-sanitize`: no aplica para Firestore.

---

## Arquitectura de carpetas obligatoria
Crea esta estructura:

```
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
      firebase.ts
    routes/
      auth.routes.ts
      users.routes.ts
      pets.routes.ts
      vets.routes.ts
      clinics.routes.ts
      appointments.routes.ts
      health.routes.ts
    controllers/
      auth.controller.ts
      users.controller.ts
      pets.controller.ts
      vets.controller.ts
      clinics.controller.ts
      appointments.controller.ts
    services/
      auth.service.ts
      users.service.ts
      pets.service.ts
      vets.service.ts
      clinics.service.ts
      appointments.service.ts
      role.service.ts
    middlewares/
      auth.middleware.ts
      role.middleware.ts
      validate.middleware.ts
      error.middleware.ts
      rate-limit.middleware.ts
    models/
      user.model.ts
      pet.model.ts
      vet.model.ts
      clinic.model.ts
      appointment.model.ts
    schemas/
      auth.schemas.ts
      users.schemas.ts
      pets.schemas.ts
      vets.schemas.ts
      clinics.schemas.ts
      appointments.schemas.ts
    utils/
      api-error.ts
      logger.ts
      time.ts
      request-id.ts        ← genera X-Request-ID por request para trazabilidad
  package.json
  tsconfig.json
  .env.example
  README.md
```

---

## Seguridad obligatoria (muy importante)
Implementa y explica cada punto:

1. **No guardar contraseñas en Firestore**
   - Las contraseñas se gestionan con Firebase Authentication.
   - En Firestore solo se guarda perfil y metadata.

2. **Verificación de token en backend**
   - El cliente Flutter obtiene ID Token de Firebase Auth.
   - Backend recibe `Authorization: Bearer <idToken>`.
   - Backend valida token con `admin.auth().verifyIdToken()`.

3. **Autorización por roles — Custom Claims como fuente principal**
   - Roles permitidos: `admin`, `veterinario`, `asistente`, `usuario`.
   - **El rol se almacena principalmente en Firebase Custom Claims**, no solo en Firestore.
   - Esto evita una lectura extra a Firestore en cada request para verificar el rol.
   - El middleware de autorización lee el rol directamente del token decodificado:
     ```ts
     const role = decodedToken.role; // sin leer Firestore
     ```
   - Firestore (`users/{uid}.role`) se usa como fuente de verdad para UI y sincronización, pero **no** para decisiones de autorización en el middleware.
   - Al cambiar el rol de un usuario, actualizar tanto Firestore como los custom claims:
     ```ts
     await admin.auth().setCustomUserClaims(uid, { role: nuevoRol });
     ```
   - Middleware `requireRole(...)` para endpoints sensibles.
   - Regla clave: `admin` ve todos los pacientes; `veterinario` y `asistente` solo pacientes del veterinario asignado.

4. **Rate limiting**
   - Límite por IP para `/auth/*` y endpoints sensibles.

5. **CORS estricto**
   - Solo permitir orígenes definidos en `.env`.

6. **Helmet**
   - Configurar cabeceras seguras.

7. **Sanitización y validación**
   - Validar body/query/params con Zod.
   - Rechazar payloads inválidos con mensajes claros.

8. **Logs sin datos sensibles**
   - Nunca loggear tokens, contraseñas, ni PII completa.
   - Incluir `X-Request-ID` en cada log para trazabilidad por request:
     ```ts
     req.id = crypto.randomUUID();
     res.setHeader('X-Request-ID', req.id);
     logger.info({ requestId: req.id, method: req.method, path: req.path });
     ```

9. **Manejo centralizado de errores**
   - Respuestas consistentes `{ error, code, message }`.

10. **Principio de mínimo privilegio**
    - Usuarios solo leen/escriben lo suyo.
    - Veterinarios solo lo asignado.
    - Asistentes solo lo asignado al veterinario que asisten.
    - Admin gestiona catálogos y roles.

11. **Límite de tamaño de payload**
    - Configurar `express.json({ limit: '50kb' })` para evitar ataques de payload masivo.
    - Ajustar el límite según el endpoint (ej: subida de fotos puede tener límite mayor por separado).

12. **Revocación de sesión y logout forzado**
    - Implementar `POST /auth/logout` que revoque los refresh tokens del usuario:
      ```ts
      await admin.auth().revokeRefreshTokens(uid);
      ```
    - Útil ante cierre de sesión forzado por admin, robo de cuenta, o cambio de rol.
    - Tras la revocación, el ID token sigue siendo válido hasta su expiración (~1h), pero el refresh token queda invalidado.

---

## Manejo de tokens en Flutter — refresh obligatorio
Documentar y advertir este comportamiento:

- Los ID tokens de Firebase **expiran cada 60 minutos**.
- Flutter debe usar un interceptor (Dio) que ante un `401 Unauthorized` llame:
  ```dart
  final token = await FirebaseAuth.instance.currentUser!.getIdToken(true); // forceRefresh: true
  ```
- Sin este manejo, usuarios activos verán errores inesperados al cabo de una hora.

Flujo recomendado con Dio:
1. Adjuntar `idToken` en cada request con `Authorization: Bearer <token>`.
2. Interceptar respuestas `401`.
3. Llamar `getIdToken(forceRefresh: true)` para obtener token renovado.
4. Reintentar la request original con el nuevo token.
5. Si falla de nuevo, cerrar sesión y redirigir a login.

---

## Modelo de datos en Firestore
Usar base Firestore y estas colecciones:

### users
- uid: string
- email: string
- nombres: string
- apellidos: string
- telefono: string | null
- role: 'admin' | 'veterinario' | 'asistente' | 'usuario'
- supervisorVetId: string | null (obligatorio cuando role='asistente')
- tieneMascota: boolean
- activo: boolean
- createdAt: Timestamp
- updatedAt: Timestamp

Regla:
- Al registrar cuenta: `role='usuario'`, `tieneMascota=false`.
- Al cambiar `role`, sincronizar también con Custom Claims en Firebase Auth.

> Mapeo con Flutter: el frontend usa `rol` en español; el backend puede usar `role` en inglés y mapear al serializar. Ver Anexo §1.

### pets
- id: string
- ownerId: string (uid del usuario)
- usaVeterinaria: boolean
- vetId: string | null
- clinicId: string | null
- nombre: string → `name` en Flutter
- especie: string → `species` en Flutter
- raza: string → `breed` en Flutter
- sexo: string → `gender` en Flutter
- fechaNacimiento: Timestamp | null → `birthDate` en Flutter
- alergias: string | null → `allergies` en Flutter
- condicionesCronicas: string | null → `chronicConditions` en Flutter
- fotoUrl: string | null → `imageUrl` en Flutter
- activo: boolean → `active` en Flutter
- archivedAt: Timestamp | null (archivado lógico — ya usado en Flutter)
- deleteAfterAt: Timestamp | null (eliminación diferida 180 días — ya usado en Flutter)
- createdAt: Timestamp
- updatedAt: Timestamp

Regla:
- Al crear mascota activa: actualizar `users/{ownerId}.tieneMascota=true`.
- Al desactivar/eliminar mascota: recalcular si quedan mascotas activas del owner; si no quedan, `tieneMascota=false`.
- `usaVeterinaria=false` debe permitir mascota sin vet ni clínica (campos null).
- `usaVeterinaria=true` debe requerir `vetId` y opcionalmente `clinicId`.
- Usar `archivedAt` y `deleteAfterAt` para soft delete consistente con el frontend Flutter actual.

### pet_health_records
- id: string
- petId: string
- ownerId: string
- vetId: string | null
- tipo: 'peso' | 'vacuna' | 'tratamiento' | 'padecimiento' | 'nota'
- fecha: Timestamp
- pesoKg: number | null
- nombreVacuna: string | null
- dosis: string | null
- tratamiento: string | null
- diagnostico: string | null
- observaciones: string | null
- creadoPorRole: 'admin' | 'veterinario' | 'asistente' | 'usuario'
- createdAt: Timestamp

Regla:
- Owner puede crear notas personales y peso.
- Veterinario/asistente asignado puede agregar registros clínicos.
- Admin puede ver/editar todo.

### vets
- vetId: string
- userId: string (si veterinario también autentica)
- nombres: string
- apellidos: string
- especialidad: string
- licencia: string
- clinicId: string
- telefono: string
- email: string
- activo: boolean
- createdAt: Timestamp

### vet_assistants
- id: string
- vetId: string
- assistantUserId: string
- activo: boolean
- createdAt: Timestamp

Regla:
- Un asistente puede estar asignado a uno o varios veterinarios (según negocio).
- Si solo permites uno, validar unicidad por `assistantUserId`.

### clinics
- clinicId: string
- nombre: string
- direccion: string
- ciudad: string
- telefono: string
- geo: GeoPoint | null
- activo: boolean
- createdAt: Timestamp

### appointments
- appointmentId: string
- ownerId: string
- petId: string
- petName: string (desnormalizado para lectura rápida — ya usado en Flutter)
- ownerName: string (desnormalizado — ya usado en Flutter)
- vetName: string (desnormalizado — ya usado en Flutter)
- vetId: string
- assistantIds: string[]
- clinicId: string
- type: string (tipo de cita — alineado con Flutter: `type`)
- schedule: Timestamp (fecha y hora — alineado con Flutter: `schedule`)
- reason: string (motivo — alineado con Flutter: `reason`)
- symptoms: string | null (alineado con Flutter: `symptoms`)
- notes: string | null (alineado con Flutter: `notes`)
- channel: string | null (canal recordatorio — alineado con Flutter: `channel`)
- sendReminder: boolean (alineado con Flutter: `sendReminder`)
- status: 'pending' | 'confirmed' | 'completed' | 'cancelled' (alineado con Flutter)
- createdAt: Timestamp
- updatedAt: Timestamp

### reminders (recordatorios de medicación)
Alineado con el modelo `Reminder` ya existente en Flutter:

- id: string
- petId: string
- title: string
- description: string | null
- frequency: ReminderFrequency ('daily' | 'every_x_hours' | 'weekly' | etc.)
- customHours: number | null
- startDate: Timestamp
- endDate: Timestamp | null
- dosesCompleted: number
- status: ReminderStatus ('active' | 'paused' | 'completed' | 'expired')
- extendedUntil: Timestamp | null
- createdAt: Timestamp
- updatedAt: Timestamp

Subcolección:
- `reminders/{id}/dose_records/{recordId}` → DoseRecord

---

## Endpoints REST mínimos

### Health
- GET `/health`

### Auth
- POST `/auth/register-email`
  - Crea usuario en Firebase Auth con email/password
  - Crea documento `users/{uid}` con role usuario y tieneMascota false
  - Asigna Custom Claim `{ role: 'usuario' }` en Firebase Auth
- POST `/auth/login-email`
  - Nota: con Firebase normalmente login ocurre en cliente.
  - Si decides manejar sesión backend, documentar flujo claramente.
- POST `/auth/google`
  - Recibe `idToken` de Google/Firebase del cliente
  - Verifica token y crea/actualiza perfil en `users`
- POST `/auth/apple`
  - Recibe `idToken` de Apple/Firebase del cliente
  - Verifica y crea/actualiza perfil
- GET `/auth/me`
  - Requiere token
  - Devuelve perfil y rol
- POST `/auth/logout`
  - Requiere token
  - Revoca refresh tokens con `admin.auth().revokeRefreshTokens(uid)`

### Users
- GET `/users/me`
- PATCH `/users/me`
- PATCH `/users/:uid/role` (solo admin) → actualiza Firestore Y Custom Claims
- PATCH `/users/:uid/assign-assistant` (solo admin, asigna `supervisorVetId`)

### Pets
- POST `/pets` (usuario autenticado)
- GET `/pets/my` (usuario autenticado)
- PATCH `/pets/:id/deactivate` (owner o admin)
- GET `/pets/:id` (owner, vet asignado o admin)
- PATCH `/pets/:id/assign-vet` (owner o admin)
- PATCH `/pets/:id/unassign-vet` (owner o admin)

### Pet Health Records
- POST `/pets/:id/health-records` (owner, vet asignado, asistente asignado, admin)
- GET `/pets/:id/health-records` (owner, vet asignado, asistente asignado, admin)
- POST `/pets/:id/health-records/:recordId/revisions` (append-only, sin sobrescribir)
- PATCH `/pets/:id/health-records/:recordId/archive` (soft delete solo admin)
- GET `/pets/:id/last-weight` (owner, vet asignado, asistente asignado, admin)

### Historial de consultas y eventos clínicos
- POST `/pets/:id/events`
- GET `/pets/:id/events`
- GET `/pets/:id/events/timeline` (ordenado por fecha desc, paginado)

### Notas y recordatorios de medicación
- POST `/pets/:id/medications`
- GET `/pets/:id/medications`
- PATCH `/pets/:id/medications/:medId`
- PATCH `/pets/:id/medications/:medId/deactivate`
- POST `/pets/:id/medications/:medId/logs`
- GET `/pets/:id/medications/:medId/logs`
- GET `/pets/:id/medications/due`

### Vets
- POST `/vets` (solo admin)
- GET `/vets` (admin, veterinario, asistente)
- PATCH `/vets/:id` (solo admin)
- POST `/vets/:id/assistants` (solo admin)
- DELETE `/vets/:id/assistants/:assistantUserId` (solo admin)

### Clinics
- POST `/clinics` (solo admin)
- GET `/clinics` (autenticado)
- PATCH `/clinics/:id` (solo admin)

### Appointments
- POST `/appointments` (usuario o admin)
- GET `/appointments/my` (por owner, vet o asistente)
- PATCH `/appointments/:id/status` (vet, asistente asignado o admin)
- GET `/appointments/vet/:vetId/patients`

### Reminders
- POST `/reminders` (owner o admin)
- GET `/reminders/pet/:petId` (owner, vet asignado, admin)
- PATCH `/reminders/:id` (owner o admin)
- DELETE `/reminders/:id` (owner o admin)
- POST `/reminders/:id/dose-records` (owner, vet asignado, asistente, admin)
- GET `/reminders/:id/dose-records`

---

## Colecciones adicionales de eventos y notas

### pet_events
- eventId, petId, ownerId, vetId, assistantId
- tipo: 'consulta' | 'vacuna' | 'control_peso' | 'tratamiento' | 'padecimiento' | 'observacion'
- titulo, detalle
- visibilidad: 'owner_only' | 'clinical_team' | 'admin'
- fechaEvento, proximoControl, pesoKg
- archivado, version, createdAt, createdBy

Subcolección: `pet_events/{eventId}/revisions/{revisionId}`

### pet_private_notes
- id, petId, ownerId, titulo, detalle
- visibilidad: 'owner_only'
- createdAt, updatedAt

### pet_medication_notes
- id, petId, ownerId, nombreMedicamento, indicacion, dosis
- frecuenciaHoras, horaPreferida, fechaInicio, fechaFin
- activo, visibilidad: 'owner_only' | 'clinical_team'
- createdAt, updatedAt

Subcolección: `pet_medication_notes/{id}/logs/{logId}`
- fechaProgramada, fechaAplicada, estado: 'pendiente' | 'aplicado' | 'omitido'
- nota, registradoPor, createdAt

Reglas:
- Historial append-only: no sobrescribir ni borrar físicamente eventos clínicos.
- Toda acción clínica crea un `pet_event` para auditoría.

---

## Optimización de consultas y costo (Firestore)

1. **Índices compuestos obligatorios:**
   - `appointments`: `(vetId, schedule desc)`, `(ownerId, schedule desc)`, `(status, schedule desc)`
   - `pets`: `(ownerId, active)`, `(vetId, active)`
   - `pet_events`: `(petId, fechaEvento desc)`, `(vetId, fechaEvento desc)`
   - `reminders`: `(petId, status)`, `(petId, endDate)`

2. **Paginación por cursor (no offset):**
   - `orderBy + limit + startAfter(lastDoc)`

3. **Consultas paralelas independientes:**
   - `Promise.all` para lecturas independientes.

4. **Vistas desnormalizadas para dashboard:**
   - `pets_summary`, `appointments_summary`

5. **Escrituras atómicas:**
   - `runTransaction` o `WriteBatch` para cambios relacionados.

6. **Cache de catálogos:**
   - Cachear vets/clinics por segundos/minutos.
   - No cachear datos clínicos sensibles.

7. **Auditoría:**
   - `createdBy`, `updatedBy`, `source` en eventos clínicos.

8. **Versionado append-only:**
   - Cada corrección crea nueva revisión en `revisions`.
   - Mantener `version` incremental.

---

## Reglas de Firestore sugeridas (base)

> ⚠️ Las reglas de Firestore son la **segunda línea de defensa**. Toda la lógica de autorización crítica vive en el backend Node.js. Las reglas protegen contra acceso directo al SDK cliente.

1. `users/{uid}` — usuario lee/edita lo suyo; solo admin cambia role.
2. `pets/{petId}` — owner CRUD; vet/asistente solo si asignado; admin total.
3. `pet_health_records/{recordId}` — append-only para clínicos; admin total.
4. `pet_private_notes/{noteId}` — solo owner y admin.
5. `pet_medication_notes/{medId}` — owner/admin; vet/asistente si `clinical_team`.
6. `pet_medication_notes/{medId}/logs/{logId}` — no eliminar físicamente.
7. `appointments/{id}` — owner crea; vet/asistente/admin actualiza estado.
8. Denegar por defecto lo no permitido.

---

## Variables de entorno
Genera `.env.example` con:

```env
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:8092

# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
# ⚠️ Entre comillas dobles para preservar saltos de línea \n
# Ejemplo: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_ID=petapp

LOG_LEVEL=info

# Opcional: JWT propio
# JWT_SECRET=
# JWT_EXPIRES_IN=15m
# REFRESH_TOKEN_EXPIRES_IN=7d
```

> En `firebase.ts` usar siempre:
> ```ts
> privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
> ```

---

## Conexión Firebase
Implementa `src/config/firebase.ts` usando Admin SDK con credenciales por env.

Debe exportar:
- `adminAuth`
- `firestoreDb` (con soporte para `databaseId` si aplica)

---

## Tokens y seguridad en Flutter

1. Flutter autentica con Firebase Auth (email, Google, Apple).
2. Flutter obtiene `idToken` con `currentUser.getIdToken()`.
3. Flutter llama backend con `Authorization: Bearer <idToken>`.
4. Backend valida token en cada request protegida.
5. Flutter maneja expiración cada 60 min con interceptor Dio y `getIdToken(forceRefresh: true)`.

---

## Pruebas mínimas
Framework: **vitest + supertest**

- Validación de schemas Zod (casos válidos e inválidos)
- Middleware auth (token inválido / válido / expirado)
- Middleware de roles (acceso permitido / denegado)
- `GET /health`
- `POST /pets` → crear mascota y verificar recálculo de `tieneMascota`
- `POST /auth/logout` → verificar revocación de token

---

## Calidad de entrega
- Código compilable sin errores TypeScript
- Sin TODOs críticos pendientes
- README con pasos exactos:
  1. `npm install`
  2. Configurar `.env`
  3. `npm run dev`
  4. `npm run build`
  5. `npm start`
  6. `npm test`
  7. Ejemplos curl/Postman por endpoint

---

## Resultado esperado
Entrega todos los archivos completos con contenido real, listos para ejecutar, sin pseudocódigo.
Explica brevemente las decisiones clave: Custom Claims vs Firestore para roles, append-only en historial clínico, revocación de tokens, y manejo de refresh en Flutter.

---

## Anexo - Modelos y servicio ya implementados en Flutter (referencia para backend)

Esta sección documenta lo que ya existe en el frontend para que el backend sea consistente y no requiera refactors grandes.

### 1) Modelo de usuario (AppUser)

Archivo fuente: `lib/models/app_user.dart`

Campos:
- id, nombres, apellidos, correo, telefono
- rol (`admin`, `veterinario`, `usuario`)
- estado, tieneMascota, createdAt, updatedAt

Métodos: `toJson()`, `fromJson()`, `copyWith()`

> El backend puede usar `role` en inglés internamente y mapearlo a `rol` al serializar para Flutter.

### 2) Modelo de mascota (Pet)

Archivo fuente: `lib/models/pet.dart`

Campos:
- id, ownerId, name, species, breed, gender, birthDate
- allergies, chronicConditions, active
- archivedAt, deleteAfterAt (eliminación lógica a 180 días)
- createdAt, updatedAt, imageUrl

Métodos: `toJson()`, `fromJson()`, `copyWith()`

> El backend debe respetar `archivedAt` y `deleteAfterAt` para no romper la lógica de archivado ya implementada en UI.

### 3) Modelo de cita (Appointment)

Archivo fuente: `lib/models/appointment.dart`

Campos:
- id, ownerId, petId, petName, ownerName, vetName
- type, schedule, reason, symptoms, notes
- channel, sendReminder
- status: `pending` | `confirmed` | `completed` | `cancelled`
- createdAt, updatedAt

Métodos: `toMap()`, `fromMap()`, `copyWith()`

### 4) Modelo de recordatorio (Reminder)

Archivo fuente: `lib/models/reminder.dart`

Incluye: `ReminderFrequency`, `ReminderStatus`, `DoseRecord`, `Reminder`

Campos clave:
- id, petId, title, description, frequency, customHours
- startDate, endDate, dosesCompleted, status, extendedUntil

Métodos: `toMap()`, `fromMap()`, `copyWith()`, helpers (`getProgress`, `isExpired`, `isOverdue`)

### 5) Servicio Firestore actual (lado Flutter)

Archivo fuente: `lib/services/firestore_service.dart`

Colecciones usadas actualmente:
- `usuarios`, `pets`, `citas`, `recordatorios`

Métodos implementados:

**Usuarios:** `createOrUpdateUser`, `updateUserProfile`, `getUserById`, `setUserHasPet`

**Mascotas:** `addPetForOwner`, `addPet`, `updatePet`, `softDeletePet`, `archivePet`, `restorePet`, `getPetsByOwner`

**Citas:** `saveAppointment`, `deleteAppointment`, `getAppointmentsByOwner`

**Recordatorios:** `saveReminder`, `deleteReminder`, `getRemindersByPet`

### 6) Contrato recomendado Flutter ↔ Backend

- Mantener IDs estables y devolverlos siempre en la respuesta.
- Fechas en ISO-8601 o Timestamp consistente — no mezclar formatos por endpoint.
- En respuestas de listas, incluir siempre `id` al nivel raíz del documento.
- Mantener alineados nombres de campos: `ownerId`, `petId`, `schedule`, `active`, `archivedAt`, `deleteAfterAt`, `sendReminder`, `channel`.

### 7) Checklist para migrar de Firestore directo a API Node

1. Sustituir llamadas directas en `FirestoreService` por cliente HTTP al backend.
2. Mantener los modelos Flutter actuales como DTO local para no romper UI.
3. Reutilizar la misma semántica de estados en citas/recordatorios.
4. Preservar lógica de archivado de mascotas y recálculo de `tieneMascota` en backend.
5. Implementar validación de ownership/roles en backend, no en cliente.
