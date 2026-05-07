"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindersService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const remindersCollection = firebase_1.firestoreDb.collection("reminders");
const withDoseRecords = async (doc) => {
    const data = doc.data();
    const dosesSnapshot = await remindersCollection.doc(doc.id).collection("dose_records").get();
    const doseRecords = dosesSnapshot.docs.map((doseDoc) => doseDoc.data());
    return { ...data, doseRecords };
};
exports.remindersService = {
    async create(payload) {
        const doc = remindersCollection.doc();
        const data = { id: doc.id, ...payload, createdAt: (0, time_1.nowIso)(), updatedAt: (0, time_1.nowIso)() };
        await doc.set(data);
        return data;
    },
    async getById(id) {
        const doc = await remindersCollection.doc(id).get();
        if (!doc.exists)
            return null;
        return doc.data();
    },
    async listByPet(petId) {
        const snapshot = await remindersCollection.where("petId", "==", petId).get();
        const reminders = await Promise.all(snapshot.docs.map(withDoseRecords));
        return reminders;
    },
    async listByPetIds(petIds) {
        if (petIds.length === 0) {
            return [];
        }
        const snapshots = await Promise.all(petIds.map((petId) => remindersCollection.where("petId", "==", petId).get()));
        const allDocs = snapshots.flatMap((snapshot) => snapshot.docs);
        const reminders = await Promise.all(allDocs.map(withDoseRecords));
        return reminders;
    },
    async update(id, patch) {
        await remindersCollection.doc(id).set({ ...patch, updatedAt: (0, time_1.nowIso)() }, { merge: true });
        const doc = await remindersCollection.doc(id).get();
        return doc.data();
    },
    async remove(id) {
        await remindersCollection.doc(id).delete();
    },
    async addDoseRecord(id, payload) {
        const doc = remindersCollection.doc(id).collection("dose_records").doc();
        const data = { recordId: doc.id, ...payload, createdAt: (0, time_1.nowIso)() };
        await doc.set(data);
        return data;
    },
    async listDoseRecords(id) {
        const snapshot = await remindersCollection.doc(id).collection("dose_records").get();
        return snapshot.docs.map((doc) => doc.data());
    }
};
