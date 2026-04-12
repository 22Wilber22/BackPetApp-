"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = void 0;
const node_crypto_1 = require("node:crypto");
const requestIdMiddleware = (req, res, next) => {
    const requestId = (0, node_crypto_1.randomUUID)();
    req.id = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
