"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessVetPatients = exports.isAdmin = void 0;
const isAdmin = (role) => role === "admin";
exports.isAdmin = isAdmin;
const canAccessVetPatients = (actorRole, actorUid, vetId, supervisorVetId) => {
    if (actorRole === "admin") {
        return true;
    }
    if (actorRole === "veterinario") {
        return actorUid === vetId;
    }
    if (actorRole === "asistente") {
        return supervisorVetId === vetId;
    }
    return false;
};
exports.canAccessVetPatients = canAccessVetPatients;
