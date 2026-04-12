"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentsController = void 0;
const api_error_1 = require("../utils/api-error");
const appointments_service_1 = require("../services/appointments.service");
const pets_service_1 = require("../services/pets.service");
const users_service_1 = require("../services/users.service");
exports.appointmentsController = {
    create: async (req, res) => {
        const role = req.user?.role;
        const uid = req.user?.uid;
        const clinicId = req.user?.clinicId ?? null;
        if (!uid || !role) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const canCreate = ["admin", "jefe", "veterinario", "recepcionista", "asistente", "usuario"].includes(role);
        if (!canCreate) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Role cannot create appointments");
        }
        const pet = await pets_service_1.petsService.getById(String(req.body.petId));
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        // DEBUG LOG
        console.log(`[APPOINTMENT CREATE] User ${uid} (${role}) creating appointment for pet ${pet.id} (clinicId: ${pet.clinicId})`);
        const payload = {
            ownerId: String(req.body.ownerId ?? pet.ownerId),
            petId: String(req.body.petId),
            petName: String(req.body.petName ?? pet.nombre),
            ownerName: String(req.body.ownerName ?? ""),
            vetName: String(req.body.vetName ?? ""),
            vetId: String(req.body.vetId ?? ""),
            assistantIds: req.body.assistantIds ?? [],
            clinicId: String(req.body.clinicId ?? pet.clinicId ?? ""),
            type: String(req.body.type),
            schedule: String(req.body.schedule),
            reason: String(req.body.reason),
            symptoms: req.body.symptoms ?? null,
            notes: req.body.notes ?? null,
            channel: req.body.channel ?? null,
            sendReminder: Boolean(req.body.sendReminder)
        };
        if (role === "usuario") {
            payload.ownerId = uid;
        }
        if (role === "veterinario") {
            payload.vetId = uid;
            payload.clinicId = clinicId ?? payload.clinicId;
        }
        if (role === "recepcionista" || role === "asistente") {
            if (!clinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Missing clinic context");
            }
            if (!payload.vetId) {
                throw new api_error_1.ApiError(400, "INVALID_REQUEST", "vetId is required for recepcionista scheduling");
            }
            const vetUser = await users_service_1.usersService.getByUid(payload.vetId);
            if (!vetUser || vetUser.role !== "veterinario" || vetUser.clinicId !== clinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "vetId is not part of caller clinic");
            }
            payload.clinicId = clinicId;
        }
        if (role === "jefe") {
            if (!clinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Missing clinic context");
            }
            payload.clinicId = clinicId;
        }
        if (!payload.vetId) {
            throw new api_error_1.ApiError(400, "INVALID_REQUEST", "vetId is required to create appointment");
        }
        if (!payload.clinicId) {
            throw new api_error_1.ApiError(400, "INVALID_REQUEST", "clinicId is required to create appointment");
        }
        const appointment = await appointments_service_1.appointmentsService.create(payload);
        res.status(201).json({ data: appointment });
    },
    my: async (req, res) => {
        if (!req.user) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const list = await appointments_service_1.appointmentsService.listByActor(req.user.uid, String(req.user.role ?? "usuario"), req.user.clinicId ?? null);
        res.status(200).json({ data: list });
    },
    updateStatus: async (req, res) => {
        const id = String(req.params.id);
        const updated = await appointments_service_1.appointmentsService.updateStatus(id, req.body.status);
        if (!updated) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Appointment not found");
        }
        const role = req.user?.role;
        const uid = req.user?.uid ?? "";
        const actorClinicId = req.user?.clinicId ?? null;
        const isAssigned = updated.assistantIds.includes(uid) || updated.vetId === uid;
        const isClinicLead = (role === "jefe" || role === "recepcionista" || role === "asistente") && actorClinicId === updated.clinicId;
        if (!(role === "admin" || isAssigned || isClinicLead)) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "No permissions to update this appointment");
        }
        res.status(200).json({ data: updated });
    },
    vetPatients: async (req, res) => {
        const vetId = String(req.params.vetId);
        if (req.user?.role === "veterinario" && req.user.uid !== vetId) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Vet can only list own patients");
        }
        const data = await appointments_service_1.appointmentsService.listVetPatients(vetId);
        res.status(200).json({ data });
    }
};
