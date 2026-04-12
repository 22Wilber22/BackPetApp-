"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const usersCollection = firebase_1.firestoreDb.collection("users");
exports.usersService = {
    async getByUid(uid) {
        const snapshot = await usersCollection.doc(uid).get();
        if (!snapshot.exists) {
            return null;
        }
        return snapshot.data();
    },
    async create(data) {
        const now = (0, time_1.nowIso)();
        const payload = { ...data, createdAt: now, updatedAt: now };
        await usersCollection.doc(data.uid).set(payload);
        return payload;
    },
    async update(uid, patch) {
        const current = await this.getByUid(uid);
        if (!current) {
            throw new Error("User not found");
        }
        const updated = {
            ...current,
            ...patch,
            updatedAt: (0, time_1.nowIso)()
        };
        await usersCollection.doc(uid).set(updated);
        return updated;
    },
    async updateRole(uid, role, clinicId) {
        const patch = { role, updatedAt: (0, time_1.nowIso)() };
        if (clinicId !== undefined) {
            patch.clinicId = clinicId;
        }
        await usersCollection.doc(uid).set(patch, { merge: true });
    },
    async setHasPet(uid, tieneMascota) {
        await usersCollection.doc(uid).set({ tieneMascota, updatedAt: (0, time_1.nowIso)() }, { merge: true });
    }
};
