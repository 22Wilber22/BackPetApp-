"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vetsController = void 0;
const api_error_1 = require("../utils/api-error");
const vets_service_1 = require("../services/vets.service");
exports.vetsController = {
    create: async (req, res) => {
        const actorRole = req.user?.role;
        const actorClinicId = req.user?.clinicId ?? null;
        if (actorRole === "jefe") {
            if (!actorClinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Jefe has no clinic assigned");
            }
            if (req.body.clinicId && req.body.clinicId !== actorClinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot create vet for another clinic");
            }
            req.body.clinicId = actorClinicId;
        }
        const vet = await vets_service_1.vetsService.create(req.body);
        res.status(201).json({ data: vet });
    },
    list: async (req, res) => {
        const actorRole = req.user?.role;
        const actorClinicId = req.user?.clinicId ?? null;
        const vets = actorRole === "admin"
            ? await vets_service_1.vetsService.list()
            : actorClinicId
                ? await vets_service_1.vetsService.listByClinic(actorClinicId)
                : [];
        res.status(200).json({ data: vets });
    },
    update: async (req, res) => {
        const id = String(req.params.id);
        const actorRole = req.user?.role;
        const actorClinicId = req.user?.clinicId ?? null;
        if (actorRole === "jefe") {
            const current = await vets_service_1.vetsService.getByVetId(id);
            if (!current || current.clinicId !== actorClinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot edit vet from another clinic");
            }
            if (req.body.clinicId && req.body.clinicId !== actorClinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot move vet to another clinic");
            }
        }
        const vet = await vets_service_1.vetsService.update(id, req.body);
        if (!vet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Vet not found");
        }
        res.status(200).json({ data: vet });
    },
    addAssistant: async (req, res) => {
        const id = String(req.params.id);
        const actorRole = req.user?.role;
        const actorClinicId = req.user?.clinicId ?? null;
        if (actorRole === "jefe") {
            const vet = await vets_service_1.vetsService.getByVetId(id);
            if (!vet || vet.clinicId !== actorClinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot manage assistants in another clinic");
            }
        }
        await vets_service_1.vetsService.addAssistant(id, req.body.assistantUserId);
        res.status(201).json({ data: { vetId: id, assistantUserId: req.body.assistantUserId } });
    },
    removeAssistant: async (req, res) => {
        const id = String(req.params.id);
        const assistantUserId = String(req.params.assistantUserId);
        if (req.user?.role === "jefe") {
            const vet = await vets_service_1.vetsService.getByVetId(id);
            if (!vet || vet.clinicId !== req.user?.clinicId) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot manage assistants in another clinic");
            }
        }
        await vets_service_1.vetsService.removeAssistant(id, assistantUserId);
        res.status(200).json({ data: { removed: true } });
    }
};
