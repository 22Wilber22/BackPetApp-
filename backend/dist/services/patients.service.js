"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsService = void 0;
const firebase_1 = require("../config/firebase");
const api_error_1 = require("../utils/api-error");
const time_1 = require("../utils/time");
const petsCollection = firebase_1.firestoreDb.collection("pets");
const historyCollection = firebase_1.firestoreDb.collection("pet_health_records");
const treatmentsCollection = firebase_1.firestoreDb.collection("pet_medication_notes");
const mapPetDoc = (doc) => ({
    id: doc.id,
    ...doc.data()
});
exports.patientsService = {
    async listByActor(actor) {
        let query = petsCollection.where("activo", "==", true);
        if (actor.role === "usuario") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Usuario role cannot access /patients");
        }
        if (actor.role === "admin") {
            const snapshot = await query.get();
            return snapshot.docs.map(mapPetDoc);
        }
        if (actor.role === "veterinario") {
            query = query.where("vetId", "==", actor.uid);
            const snapshot = await query.get();
            return snapshot.docs.map(mapPetDoc);
        }
        const clinicId = actor.clinicId;
        if (!clinicId) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Clinic context required");
        }
        query = query.where("clinicId", "==", clinicId);
        const snapshot = await query.get();
        return snapshot.docs.map(mapPetDoc);
    },
    async getByIdForActor(actor, petId) {
        const doc = await petsCollection.doc(petId).get();
        if (!doc.exists) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Patient not found");
        }
        const pet = mapPetDoc(doc);
        if (actor.role === "admin") {
            return pet;
        }
        if (actor.role === "usuario") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Usuario role cannot access /patients");
        }
        if (actor.role === "veterinario") {
            if (pet.vetId !== actor.uid) {
                throw new api_error_1.ApiError(403, "FORBIDDEN", "No access to patient from another vet");
            }
            return pet;
        }
        if (!actor.clinicId || pet.clinicId !== actor.clinicId) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "No access to patient from another clinic");
        }
        return pet;
    },
    async addHistoryEntry(actor, petId, payload) {
        const ref = historyCollection.doc();
        await ref.set({
            id: ref.id,
            petId,
            clinicId: actor.clinicId,
            vetId: actor.role === "veterinario" ? actor.uid : (payload.vetId ?? null),
            tipo: payload.tipo ?? "nota",
            fecha: payload.fecha ?? (0, time_1.nowIso)(),
            detalle: payload.detalle ?? null,
            observaciones: payload.observaciones ?? null,
            creadoPorRole: actor.role,
            createdBy: actor.uid,
            createdAt: (0, time_1.nowIso)(),
            archived: false
        });
        return { id: ref.id };
    },
    async listHistory(petId) {
        const snapshot = await historyCollection.where("petId", "==", petId).orderBy("fecha", "desc").get();
        return snapshot.docs.map((doc) => doc.data());
    },
    async addHistoryRevision(actor, recordId, payload) {
        const revisionRef = historyCollection.doc(recordId).collection("revisions").doc();
        await revisionRef.set({
            revisionId: revisionRef.id,
            payload,
            createdAt: (0, time_1.nowIso)(),
            createdBy: actor.uid,
            createdByRole: actor.role
        });
        return { revisionId: revisionRef.id };
    },
    async createTreatment(actor, petId, payload) {
        const ref = treatmentsCollection.doc();
        await ref.set({
            id: ref.id,
            petId,
            ownerId: payload.ownerId ?? null,
            clinicId: actor.clinicId,
            vetId: actor.role === "veterinario" ? actor.uid : (payload.vetId ?? null),
            nombreMedicamento: payload.nombreMedicamento,
            indicacion: payload.indicacion,
            dosis: payload.dosis,
            frecuenciaHoras: payload.frecuenciaHoras,
            horaPreferida: payload.horaPreferida ?? null,
            fechaInicio: payload.fechaInicio ?? (0, time_1.nowIso)(),
            fechaFin: payload.fechaFin ?? null,
            activo: true,
            visibilidad: payload.visibilidad ?? "owner_visible",
            createdAt: (0, time_1.nowIso)(),
            updatedAt: (0, time_1.nowIso)()
        });
        return { id: ref.id };
    },
    async patchTreatment(treatmentId, patch) {
        await treatmentsCollection.doc(treatmentId).set({ ...patch, updatedAt: (0, time_1.nowIso)() }, { merge: true });
        return { id: treatmentId };
    },
    async listTreatments(petId) {
        const snapshot = await treatmentsCollection.where("petId", "==", petId).get();
        return snapshot.docs.map((doc) => doc.data());
    }
};
