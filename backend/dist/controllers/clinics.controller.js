"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicsController = void 0;
const api_error_1 = require("../utils/api-error");
const clinics_service_1 = require("../services/clinics.service");
exports.clinicsController = {
    create: async (req, res) => {
        const clinic = await clinics_service_1.clinicsService.create(req.body);
        res.status(201).json({ data: clinic });
    },
    list: async (_req, res) => {
        const clinics = await clinics_service_1.clinicsService.list();
        res.status(200).json({ data: clinics });
    },
    update: async (req, res) => {
        const id = String(req.params.id);
        const clinic = await clinics_service_1.clinicsService.update(id, req.body);
        if (!clinic) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Clinic not found");
        }
        res.status(200).json({ data: clinic });
    }
};
