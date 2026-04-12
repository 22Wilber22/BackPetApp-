# API PetApp - Rutas y Datos de Prueba

Base URL:

- http://localhost:4000

## Variables sugeridas

- TOKEN: ID Token de Firebase (`Authorization: Bearer TOKEN`)
- OWNER_UID: uid del usuario owner
- VET_UID: uid del veterinario
- PET_ID: id de mascota
- CLINIC_ID: id de clinica
- APPOINTMENT_ID: id de cita
- REMINDER_ID: id de recordatorio
- RECORD_ID: id de historial clinico
- MED_ID: id de medicacion

## Health

### GET /health

URL:

- http://localhost:4000/health

## Auth

### POST /auth/register-email

URL:

- http://localhost:4000/auth/register-email

Body:

```json
{
  "email": "owner1@petapp.com",
  "password": "PetApp1234",
  "nombres": "Carlos",
  "apellidos": "Lopez",
  "telefono": "5551112222"
}
```

### POST /auth/login-email

URL:

- http://localhost:4000/auth/login-email

Nota: en este backend el login real debe hacerse con Firebase Auth en cliente.

### POST /auth/google

URL:

- http://localhost:4000/auth/google

Body:

```json
{
  "idToken": "GOOGLE_OR_FIREBASE_ID_TOKEN"
}
```

### POST /auth/apple

URL:

- http://localhost:4000/auth/apple

Body:

```json
{
  "idToken": "APPLE_OR_FIREBASE_ID_TOKEN"
}
```

### GET /auth/me

URL:

- http://localhost:4000/auth/me

Headers:

- Authorization: Bearer TOKEN

### POST /auth/logout

URL:

- http://localhost:4000/auth/logout

Headers:

- Authorization: Bearer TOKEN

## Users

### GET /users/me

- http://localhost:4000/users/me

### PATCH /users/me

- http://localhost:4000/users/me

Body:

```json
{
  "nombres": "Carlos",
  "apellidos": "Lopez",
  "telefono": "5552223333"
}
```

### PATCH /users/:uid/role (admin)

- http://localhost:4000/users/OWNER_UID/role

Body:

```json
{
  "role": "usuario"
}
```

Valores validos de role:

- admin
- veterinario
- asistente
- usuario

### PATCH /users/:uid/assign-assistant (admin)

- http://localhost:4000/users/OWNER_UID/assign-assistant

Body:

```json
{
  "supervisorVetId": "VET_UID"
}
```

## Pets

### POST /pets

- http://localhost:4000/pets

Body:

```json
{
  "usaVeterinaria": false,
  "vetId": null,
  "clinicId": null,
  "nombre": "Milo",
  "especie": "Perro",
  "raza": "Mestizo",
  "sexo": "M",
  "fechaNacimiento": "2022-06-01T10:00:00.000Z",
  "alergias": null,
  "condicionesCronicas": null,
  "fotoUrl": null
}
```

### GET /pets/my

- http://localhost:4000/pets/my

### PATCH /pets/:id/deactivate

- http://localhost:4000/pets/PET_ID/deactivate

### GET /pets/:id

- http://localhost:4000/pets/PET_ID

### PATCH /pets/:id/assign-vet

- http://localhost:4000/pets/PET_ID/assign-vet

Body:

```json
{
  "vetId": "VET_UID",
  "clinicId": "CLINIC_ID"
}
```

### PATCH /pets/:id/unassign-vet

- http://localhost:4000/pets/PET_ID/unassign-vet

### POST /pets/:id/health-records

- http://localhost:4000/pets/PET_ID/health-records

Body:

```json
{
  "tipo": "peso",
  "fecha": "2026-03-17T18:00:00.000Z",
  "pesoKg": 12.4,
  "observaciones": "Peso estable"
}
```

### GET /pets/:id/health-records

- http://localhost:4000/pets/PET_ID/health-records

### POST /pets/:id/health-records/:recordId/revisions

- http://localhost:4000/pets/PET_ID/health-records/RECORD_ID/revisions

Body:

```json
{
  "observaciones": "Correccion de nota",
  "version": 2
}
```

### PATCH /pets/:id/health-records/:recordId/archive (admin)

- http://localhost:4000/pets/PET_ID/health-records/RECORD_ID/archive

### GET /pets/:id/last-weight

- http://localhost:4000/pets/PET_ID/last-weight

### POST /pets/:id/events

- http://localhost:4000/pets/PET_ID/events

Body:

```json
{
  "tipo": "consulta",
  "titulo": "Consulta general",
  "detalle": "Sin hallazgos relevantes",
  "visibilidad": "clinical_team",
  "fechaEvento": "2026-03-17T18:00:00.000Z"
}
```

### GET /pets/:id/events

- http://localhost:4000/pets/PET_ID/events

### GET /pets/:id/events/timeline

- http://localhost:4000/pets/PET_ID/events/timeline

### POST /pets/:id/medications

- http://localhost:4000/pets/PET_ID/medications

Body:

```json
{
  "nombreMedicamento": "Amoxicilina",
  "indicacion": "Cada 12 horas",
  "dosis": "5ml",
  "frecuenciaHoras": 12,
  "horaPreferida": "08:00",
  "fechaInicio": "2026-03-18T08:00:00.000Z",
  "fechaFin": "2026-03-25T08:00:00.000Z",
  "visibilidad": "owner_only"
}
```

### GET /pets/:id/medications

- http://localhost:4000/pets/PET_ID/medications

### PATCH /pets/:id/medications/:medId

- http://localhost:4000/pets/PET_ID/medications/MED_ID

Body:

```json
{
  "dosis": "7ml"
}
```

### PATCH /pets/:id/medications/:medId/deactivate

- http://localhost:4000/pets/PET_ID/medications/MED_ID/deactivate

### POST /pets/:id/medications/:medId/logs

- http://localhost:4000/pets/PET_ID/medications/MED_ID/logs

Body:

```json
{
  "fechaProgramada": "2026-03-18T20:00:00.000Z",
  "fechaAplicada": "2026-03-18T20:03:00.000Z",
  "estado": "aplicado",
  "nota": "Sin reaccion adversa"
}
```

### GET /pets/:id/medications/:medId/logs

- http://localhost:4000/pets/PET_ID/medications/MED_ID/logs

### GET /pets/:id/medications/due

- http://localhost:4000/pets/PET_ID/medications/due

## Vets

### POST /vets (admin)

- http://localhost:4000/vets

Body:

```json
{
  "userId": "VET_UID",
  "nombres": "Laura",
  "apellidos": "Ramirez",
  "especialidad": "Pequenas especies",
  "licencia": "VET-3321",
  "clinicId": "CLINIC_ID",
  "telefono": "5553334444",
  "email": "vet1@petapp.com"
}
```

### GET /vets

- http://localhost:4000/vets

### PATCH /vets/:id (admin)

- http://localhost:4000/vets/VET_UID

Body:

```json
{
  "especialidad": "Dermatologia"
}
```

### POST /vets/:id/assistants (admin)

- http://localhost:4000/vets/VET_UID/assistants

Body:

```json
{
  "assistantUserId": "ASSISTANT_UID"
}
```

### DELETE /vets/:id/assistants/:assistantUserId (admin)

- http://localhost:4000/vets/VET_UID/assistants/ASSISTANT_UID

## Clinics

### POST /clinics (admin)

- http://localhost:4000/clinics

Body:

```json
{
  "nombre": "Clinica Centro",
  "direccion": "Av. Principal 123",
  "ciudad": "Monterrey",
  "telefono": "5559990000",
  "geo": {
    "lat": 25.6866,
    "lng": -100.3161
  }
}
```

### GET /clinics

- http://localhost:4000/clinics

### PATCH /clinics/:id (admin)

- http://localhost:4000/clinics/CLINIC_ID

Body:

```json
{
  "telefono": "5558887777"
}
```

## Appointments

### POST /appointments

- http://localhost:4000/appointments

Body:

```json
{
  "ownerId": "OWNER_UID",
  "petId": "PET_ID",
  "petName": "Milo",
  "ownerName": "Carlos Lopez",
  "vetName": "Laura Ramirez",
  "vetId": "VET_UID",
  "assistantIds": [],
  "clinicId": "CLINIC_ID",
  "type": "control",
  "schedule": "2026-03-20T16:00:00.000Z",
  "reason": "Chequeo general",
  "symptoms": null,
  "notes": "Primera consulta",
  "channel": "push",
  "sendReminder": true
}
```

### GET /appointments/my

- http://localhost:4000/appointments/my

### PATCH /appointments/:id/status

- http://localhost:4000/appointments/APPOINTMENT_ID/status

Body:

```json
{
  "status": "confirmed"
}
```

Estados validos:

- pending
- confirmed
- completed
- cancelled

### GET /appointments/vet/:vetId/patients

- http://localhost:4000/appointments/vet/VET_UID/patients

## Reminders

### POST /reminders

- http://localhost:4000/reminders

Body:

```json
{
  "petId": "PET_ID",
  "title": "Antibiotico",
  "description": "Dar despues de comida",
  "frequency": "daily",
  "customHours": null,
  "startDate": "2026-03-18T08:00:00.000Z",
  "endDate": "2026-03-25T08:00:00.000Z",
  "dosesCompleted": 0,
  "status": "active",
  "extendedUntil": null
}
```

### GET /reminders/pet/:petId

- http://localhost:4000/reminders/pet/PET_ID

### PATCH /reminders/:id

- http://localhost:4000/reminders/REMINDER_ID

Body:

```json
{
  "status": "paused"
}
```

### DELETE /reminders/:id

- http://localhost:4000/reminders/REMINDER_ID

### POST /reminders/:id/dose-records

- http://localhost:4000/reminders/REMINDER_ID/dose-records

Body:

```json
{
  "scheduledAt": "2026-03-19T08:00:00.000Z",
  "takenAt": "2026-03-19T08:02:00.000Z",
  "status": "taken"
}
```

### GET /reminders/:id/dose-records

- http://localhost:4000/reminders/REMINDER_ID/dose-records

## Header de autenticacion

Para todas las rutas protegidas, agrega:

- Authorization: Bearer TOKEN

## Nota Firestore

No necesitas crear colecciones manualmente. Firestore las crea automaticamente al primer documento que guardas desde estas APIs.
