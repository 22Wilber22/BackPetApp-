"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vetsService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const vetsCollection = firebase_1.firestoreDb.collection("vets");
const assistantsCollection = firebase_1.firestoreDb.collection("vet_assistants");
exports.vetsService = {
    async create(payload) {
        const doc = vetsCollection.doc();
        const vet = {
            vetId: doc.id,
            ...payload,
            activo: true,
            createdAt: (0, time_1.nowIso)()
        };
        await doc.set(vet);
        return vet;
    },
    async list() {
        const snapshot = await vetsCollection.where("activo", "==", true).get();
        return snapshot.docs.map((doc) => doc.data());
    },
    async listByClinic(clinicId) {
        const snapshot = await vetsCollection.where("activo", "==", true).where("clinicId", "==", clinicId).get();
        return snapshot.docs.map((doc) => doc.data());
    },
    async getByUserId(userId) {
        const snapshot = await vetsCollection.where("userId", "==", userId).limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data();
    },
    async getByVetId(vetId) {
        const doc = await vetsCollection.doc(vetId).get();
        if (!doc.exists) {
            return null;
        }
        return doc.data();
    },
    async update(id, patch) {
        const ref = vetsCollection.doc(id);
        const current = await ref.get();
        if (!current.exists) {
            return null;
        }
        await ref.set(patch, { merge: true });
        return (await ref.get()).data();
    },
    async addAssistant(vetId, assistantUserId) {
        const doc = assistantsCollection.doc(`${vetId}_${assistantUserId}`);
        await doc.set({ id: doc.id, vetId, assistantUserId, activo: true, createdAt: (0, time_1.nowIso)() });
    },
    async removeAssistant(vetId, assistantUserId) {
        await assistantsCollection.doc(`${vetId}_${assistantUserId}`).delete();
    }
};
