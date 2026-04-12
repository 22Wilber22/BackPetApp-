"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicsService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const clinicsCollection = firebase_1.firestoreDb.collection("clinics");
exports.clinicsService = {
    async create(payload) {
        const doc = clinicsCollection.doc();
        const clinic = {
            clinicId: doc.id,
            ...payload,
            activo: true,
            createdAt: (0, time_1.nowIso)()
        };
        await doc.set(clinic);
        return clinic;
    },
    async list() {
        const snapshot = await clinicsCollection.where("activo", "==", true).get();
        return snapshot.docs.map((doc) => doc.data());
    },
    async update(id, patch) {
        const ref = clinicsCollection.doc(id);
        const current = await ref.get();
        if (!current.exists) {
            return null;
        }
        await ref.set(patch, { merge: true });
        return (await ref.get()).data();
    }
};
