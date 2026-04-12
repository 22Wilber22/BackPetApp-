"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const api_error_1 = require("../utils/api-error");
const users_service_1 = require("../services/users.service");
const auth_service_1 = require("../services/auth.service");
const vets_service_1 = require("../services/vets.service");
exports.usersController = {
    getMe: async (req, res) => {
        const uid = req.user?.uid;
        if (!uid) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const user = await users_service_1.usersService.getByUid(uid);
        res.status(200).json({ data: user });
    },
    patchMe: async (req, res) => {
        const uid = req.user?.uid;
        if (!uid) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const updated = await users_service_1.usersService.update(uid, req.body);
        res.status(200).json({ data: updated });
    },
    patchRole: async (req, res) => {
        const uid = String(req.params.uid);
        const clinicId = req.body.clinicId ?? undefined;
        await auth_service_1.authService.setRole(uid, req.body.role, clinicId);
        res.status(200).json({ data: { uid, role: req.body.role, clinicId: clinicId ?? null } });
    },
    assignAssistant: async (req, res) => {
        const uid = String(req.params.uid);
        const supervisorVetId = req.body.supervisorVetId;
        const supervisorVet = await vets_service_1.vetsService.getByUserId(supervisorVetId);
        if (!supervisorVet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Supervisor vet not found");
        }
        const updated = await users_service_1.usersService.update(uid, {
            role: "recepcionista",
            clinicId: supervisorVet.clinicId,
            supervisorVetId
        });
        await auth_service_1.authService.syncClaims(uid);
        res.status(200).json({ data: updated });
    }
};
