"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffService = void 0;
const firebase_1 = require("../config/firebase");
const usersCollection = firebase_1.firestoreDb.collection("users");
const petsCollection = firebase_1.firestoreDb.collection("pets");
const mapPetDoc = (doc) => ({
    id: doc.id,
    ...doc.data()
});
exports.staffService = {
    async listTeamByClinic(clinicId) {
        const vetsSnapshot = await usersCollection.where("clinicId", "==", clinicId).where("role", "==", "veterinario").where("activo", "==", true).get();
        const recepSnapshot = await usersCollection.where("clinicId", "==", clinicId).where("role", "==", "recepcionista").where("activo", "==", true).get();
        return {
            veterinarios: vetsSnapshot.docs.map((doc) => doc.data()),
            recepcionistas: recepSnapshot.docs.map((doc) => doc.data())
        };
    },
    async listPatientsByVet(clinicId, vetUid) {
        const snapshot = await petsCollection
            .where("clinicId", "==", clinicId)
            .where("vetId", "==", vetUid)
            .where("activo", "==", true)
            .get();
        return snapshot.docs.map(mapPetDoc);
    }
};
