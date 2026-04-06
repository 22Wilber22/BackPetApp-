"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const firebase_1 = require("../config/firebase");
const users_service_1 = require("./users.service");
const buildDefaultUser = (uid, email, nombres, apellidos) => ({
    uid,
    email,
    nombres,
    apellidos,
    telefono: null,
    role: "usuario",
    clinicId: null,
    supervisorVetId: null,
    tieneMascota: false,
    activo: true
});
exports.authService = {
    async syncClaims(uid) {
        const user = await users_service_1.usersService.getByUid(uid);
        if (!user) {
            return;
        }
        await firebase_1.adminAuth.setCustomUserClaims(uid, {
            role: user.role,
            clinicId: user.clinicId,
            supervisorVetId: user.supervisorVetId
        });
    },
    async registerWithEmail(payload) {
        const userRecord = await firebase_1.adminAuth.createUser({
            email: payload.email,
            password: payload.password,
            displayName: `${payload.nombres} ${payload.apellidos}`
        });
        await firebase_1.adminAuth.setCustomUserClaims(userRecord.uid, {
            role: "usuario",
            clinicId: null,
            supervisorVetId: null
        });
        const user = await users_service_1.usersService.create({
            ...buildDefaultUser(userRecord.uid, payload.email, payload.nombres, payload.apellidos),
            telefono: payload.telefono ?? null
        });
        return user;
    },
    async upsertProviderUser(idToken) {
        const decoded = await firebase_1.adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;
        const email = decoded.email ?? "";
        const names = (decoded.name ?? "").split(" ");
        const nombres = names[0] ?? "Usuario";
        const apellidos = names.slice(1).join(" ") || "PetApp";
        const existing = await users_service_1.usersService.getByUid(uid);
        if (!existing) {
            await users_service_1.usersService.create(buildDefaultUser(uid, email, nombres, apellidos));
            await firebase_1.adminAuth.setCustomUserClaims(uid, {
                role: "usuario",
                clinicId: null,
                supervisorVetId: null
            });
        }
        return users_service_1.usersService.getByUid(uid);
    },
    async me(uid) {
        return users_service_1.usersService.getByUid(uid);
    },
    async logout(uid) {
        await firebase_1.adminAuth.revokeRefreshTokens(uid);
    },
    async setRole(uid, role, clinicId) {
        await users_service_1.usersService.updateRole(uid, role, clinicId);
        await this.syncClaims(uid);
    }
};
