"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const api_error_1 = require("../utils/api-error");
const auth_service_1 = require("../services/auth.service");
exports.authController = {
    registerEmail: async (req, res) => {
        const user = await auth_service_1.authService.registerWithEmail(req.body);
        res.status(201).json({ data: user });
    },
    loginEmail: async (_req, _res) => {
        throw new api_error_1.ApiError(400, "CLIENT_LOGIN_REQUIRED", "Use Firebase Auth login in Flutter and send ID token to backend");
    },
    google: async (req, res) => {
        const user = await auth_service_1.authService.upsertProviderUser(req.body.idToken);
        res.status(200).json({ data: user });
    },
    apple: async (req, res) => {
        const user = await auth_service_1.authService.upsertProviderUser(req.body.idToken);
        res.status(200).json({ data: user });
    },
    me: async (req, res) => {
        if (!req.user) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const user = await auth_service_1.authService.me(req.user.uid);
        res.status(200).json({ data: user, role: req.user.role ?? user?.role ?? "usuario" });
    },
    logout: async (req, res) => {
        if (!req.user) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        await auth_service_1.authService.logout(req.user.uid);
        res.status(200).json({ data: { revoked: true } });
    }
};
