"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const uploads_service_1 = require("../services/uploads.service");
exports.uploadsRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB per file
exports.uploadsRouter.post('/uploads/pet-image', auth_middleware_1.requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }
        const ownerId = req.user?.uid ?? 'anonymous';
        const url = await (0, uploads_service_1.uploadPetImageFromBuffer)(file.buffer, file.mimetype, ownerId);
        res.status(201).json({ data: { url } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = exports.uploadsRouter;
