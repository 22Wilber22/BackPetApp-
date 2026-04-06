"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const request_id_1 = require("./utils/request-id");
const logger_1 = require("./utils/logger");
const health_routes_1 = require("./routes/health.routes");
const auth_routes_1 = require("./routes/auth.routes");
const users_routes_1 = require("./routes/users.routes");
const pets_routes_1 = require("./routes/pets.routes");
const vets_routes_1 = require("./routes/vets.routes");
const clinics_routes_1 = require("./routes/clinics.routes");
const appointments_routes_1 = require("./routes/appointments.routes");
const reminders_routes_1 = require("./routes/reminders.routes");
const staff_routes_1 = require("./routes/staff.routes");
const patients_routes_1 = require("./routes/patients.routes");
const reports_routes_1 = require("./routes/reports.routes");
exports.app = (0, express_1.default)();
exports.app.use(request_id_1.requestIdMiddleware);
exports.app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
    serializers: {
        req(req) {
            return { id: req.id, method: req.method, url: req.url };
        }
    }
}));
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || env_1.env.FRONTEND_ORIGIN_LIST.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("CORS origin denied"));
    }
}));
exports.app.use(express_1.default.json({ limit: "50kb" }));
exports.app.use(health_routes_1.healthRouter);
exports.app.use(auth_routes_1.authRouter);
exports.app.use(users_routes_1.usersRouter);
exports.app.use(pets_routes_1.petsRouter);
exports.app.use(vets_routes_1.vetsRouter);
exports.app.use(clinics_routes_1.clinicsRouter);
exports.app.use(appointments_routes_1.appointmentsRouter);
exports.app.use(reminders_routes_1.remindersRouter);
exports.app.use(staff_routes_1.staffRouter);
exports.app.use(patients_routes_1.patientsRouter);
exports.app.use(reports_routes_1.reportsRouter);
exports.app.use(error_middleware_1.errorHandler);
