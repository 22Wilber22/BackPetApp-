"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsController = void 0;
const api_error_1 = require("../utils/api-error");
const patients_service_1 = require("../services/patients.service");
const getActor = (req) => {
    const uid = req.user?.uid;
    const role = req.user?.role;
    if (!uid || !role) {
        throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    return {
        uid,
        role,
        clinicId: req.user?.clinicId ?? null
    };
};
exports.patientsController = {
    list: async (req, res) => {
        const actor = getActor(req);
        const data = await patients_service_1.patientsService.listByActor(actor);
        res.status(200).json({ data });
    },
    getById: async (req, res) => {
        const actor = getActor(req);
        const petId = String(req.params.petId);
        const data = await patients_service_1.patientsService.getByIdForActor(actor, petId);
        res.status(200).json({ data });
    },
    addHistory: async (req, res) => {
        const actor = getActor(req);
        const petId = String(req.params.petId);
        await patients_service_1.patientsService.getByIdForActor(actor, petId);
        const data = await patients_service_1.patientsService.addHistoryEntry(actor, petId, req.body);
        res.status(201).json({ data });
    },
    listHistory: async (req, res) => {
        const actor = getActor(req);
        const petId = String(req.params.petId);
        await patients_service_1.patientsService.getByIdForActor(actor, petId);
        const data = await patients_service_1.patientsService.listHistory(petId);
        res.status(200).json({ data });
    },
    addHistoryRevision: async (req, res) => {
        const actor = getActor(req);
        const petId = String(req.params.petId);
        await patients_service_1.patientsService.getByIdForActor(actor, petId);
        const recordId = String(req.params.recordId);
        const data = await patients_service_1.patientsService.addHistoryRevision(actor, recordId, req.body);
        res.status(201).json({ data });
    },
    createTreatment: async (req, res) => {
        const actor = getActor(req);
        if (!(actor.role === "admin" || actor.role === "jefe" || actor.role === "veterinario")) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Only clinical roles can create treatments");
        }
        const petId = String(req.params.petId);
        await patients_service_1.patientsService.getByIdForActor(actor, petId);
        const data = await patients_service_1.patientsService.createTreatment(actor, petId, req.body);
        res.status(201).json({ data });
    },
    patchTreatment: async (req, res) => {
        const actor = getActor(req);
        if (!(actor.role === "admin" || actor.role === "jefe" || actor.role === "veterinario")) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Only clinical roles can patch treatments");
        }
        const petId = String(req.params.petId);
        await patients_service_1.patientsService.getByIdForActor(actor, petId);
        const treatmentId = String(req.params.id);
        const data = await patients_service_1.patientsService.patchTreatment(treatmentId, req.body);
        res.status(200).json({ data });
    },
    listTreatments: async (req, res) => {
        const actor = getActor(req);
        const petId = String(req.params.petId);
        await patients_service_1.patientsService.getByIdForActor(actor, petId);
        const data = await patients_service_1.patientsService.listTreatments(petId);
        res.status(200).json({ data });
    }
};
