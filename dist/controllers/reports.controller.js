"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const api_error_1 = require("../utils/api-error");
const reports_service_1 = require("../services/reports.service");
const ensureRole = (req) => {
    const role = req.user?.role;
    if (role !== "admin" && role !== "jefe") {
        throw new api_error_1.ApiError(403, "FORBIDDEN", "Only admin/jefe can access reports");
    }
    return role;
};
exports.reportsController = {
    appointments: async (req, res) => {
        const role = ensureRole(req);
        const clinicId = role === "admin"
            ? req.query.clinicId ?? null
            : req.user?.clinicId ?? null;
        const from = req.query.from;
        const to = req.query.to;
        const data = await reports_service_1.reportsService.appointmentsByPeriod(clinicId, from, to);
        res.status(200).json({ data });
    },
    patients: async (req, res) => {
        const role = ensureRole(req);
        const clinicId = role === "admin"
            ? req.query.clinicId ?? null
            : req.user?.clinicId ?? null;
        const data = await reports_service_1.reportsService.patientsSummaryByVet(clinicId);
        res.status(200).json({ data });
    }
};
