"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const reports_controller_1 = require("../controllers/reports.controller");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.get("/reports/appointments", auth_middleware_1.requireAuth, reports_controller_1.reportsController.appointments);
exports.reportsRouter.get("/reports/patients", auth_middleware_1.requireAuth, reports_controller_1.reportsController.patients);
