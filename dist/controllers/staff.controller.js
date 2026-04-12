"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffController = void 0;
const api_error_1 = require("../utils/api-error");
const staff_service_1 = require("../services/staff.service");
exports.staffController = {
    listTeam: async (req, res) => {
        const role = req.user?.role;
        if (!(role === "admin" || role === "jefe")) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Only admin/jefe can list staff team");
        }
        const clinicId = req.user?.clinicId ?? null;
        if (role === "jefe" && !clinicId) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Jefe has no clinic assigned");
        }
        const data = role === "admin"
            ? { veterinarios: [], recepcionistas: [] }
            : await staff_service_1.staffService.listTeamByClinic(clinicId);
        res.status(200).json({ data });
    },
    patientsByVet: async (req, res) => {
        const role = req.user?.role;
        const clinicId = req.user?.clinicId ?? null;
        if (!(role === "admin" || role === "jefe")) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Only admin/jefe can inspect vet patients");
        }
        const vetUid = String(req.params.uid);
        const data = role === "admin"
            ? await staff_service_1.staffService.listPatientsByVet(String(req.query.clinicId ?? ""), vetUid)
            : await staff_service_1.staffService.listPatientsByVet(clinicId, vetUid);
        res.status(200).json({ data });
    }
};
