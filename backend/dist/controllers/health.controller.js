"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
exports.healthController = {
    check: (_req, res) => {
        res.status(200).json({ ok: true, service: "petapp-backend", timestamp: new Date().toISOString() });
    }
};
