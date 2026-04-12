# PetApp Backend (Node.js + Firebase)

Backend API seguro para PetApp con TypeScript, Express y Firebase Admin SDK.

## Stack

- Node.js LTS
- TypeScript
- Express
- Firebase Admin SDK + Firestore
- Zod
- Helmet
- CORS con whitelist
- express-rate-limit
- pino
- vitest + supertest

## Seguridad implementada

- Passwords nunca se guardan en Firestore, solo en Firebase Auth.
- Validacion de ID token Firebase en backend (`Authorization: Bearer <idToken>`).
- Autorizacion por roles leyendo custom claims (`decodedToken.role`).
- Cambio de rol sincroniza Firestore + custom claims.
- Helmet + CORS estricto por `.env`.
- Rate limiting para auth y endpoints sensibles.
- Validacion con Zod en body/params/query.
- Logs sin secretos y con `X-Request-ID` para trazabilidad.
- Manejo centralizado de errores con formato consistente.
- Límite de payload de 50kb en JSON.
- Logout forzado con revocacion de refresh tokens (`POST /auth/logout`).

## Flujo Flutter y refresh token

Los ID tokens de Firebase expiran cada ~60 min. Flutter debe refrescar al recibir 401.

Flujo recomendado con Dio:

1. Enviar token en `Authorization: Bearer <idToken>`.
2. Si llega 401, llamar `getIdToken(true)`.
3. Reintentar request con token nuevo.
4. Si vuelve a fallar, cerrar sesion y redirigir a login.

## Instalacion y ejecucion

1. `npm install`
2. Crear `.env` desde `.env.example`
3. `npm run dev`
4. `npm run dev:test-server` (alternativa con nodemon para servidor de prueba)
5. `npm run build`
6. `npm start`
7. `npm test`

## Endpoints principales

- Health: `GET /health`
- Auth: `POST /auth/register-email`, `POST /auth/google`, `POST /auth/apple`, `GET /auth/me`, `POST /auth/logout`
- Users: `GET /users/me`, `PATCH /users/me`, `PATCH /users/:uid/role`, `PATCH /users/:uid/assign-assistant`
- Pets: CRUD base, asignacion de vet, health records, events, medication notes
- Vets: alta/listado/edicion y asignacion de asistentes
- Clinics: alta/listado/edicion
- Appointments: crear, listar, actualizar estado, pacientes por vet
- Reminders: CRUD y dose records

## Ejemplos curl

### Health

```bash
curl -X GET http://localhost:4000/health
```

### Register email

```bash
curl -X POST http://localhost:4000/auth/register-email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"demo@petapp.com",
    "password":"StrongPass123",
    "nombres":"Ana",
    "apellidos":"Perez"
  }'
```

### Logout forzado

```bash
curl -X POST http://localhost:4000/auth/logout \
  -H "Authorization: Bearer <ID_TOKEN>"
```

## Decisiones clave

- **Custom Claims vs Firestore para roles**: el middleware usa `decodedToken.role` para evitar lectura Firestore por request. Firestore conserva `role` para UI y sincronizacion.
- **Append-only en historial clinico**: revisiones en subcolecciones (`revisions`) para evitar sobrescritura y mantener auditoria.
- **Revocacion de tokens**: `POST /auth/logout` revoca refresh tokens para cortar sesiones comprometidas.
- **Refresh en Flutter**: requerido por expiracion de 60 minutos de los ID tokens.
