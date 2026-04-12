"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentsService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const appointmentsCollection = firebase_1.firestoreDb.collection("appointments");
exports.appointmentsService = {
    async create(payload) {
        const doc = appointmentsCollection.doc();
        const now = (0, time_1.nowIso)();
        const appointment = {
            appointmentId: doc.id,
            ...payload,
            status: "pending",
            createdAt: now,
            updatedAt: now
        };
        await doc.set(appointment);
        return appointment;
    },
    async listByActor(uid, role, clinicId) {
        let query = appointmentsCollection;
        if (role === "admin") {
            query = appointmentsCollection;
        }
        else if (role === "usuario") {
            query = query.where("ownerId", "==", uid);
        }
        else if (role === "veterinario") {
            query = query.where("vetId", "==", uid);
        }
        else if (role === "jefe" || role === "recepcionista" || role === "asistente") {
            if (!clinicId) {
                return [];
            }
            query = query.where("clinicId", "==", clinicId);
        }
        const snapshot = await query.get();
        const results = snapshot.docs
            .map((doc) => doc.data())
            .sort((a, b) => {
            const aTime = Date.parse(a.schedule);
            const bTime = Date.parse(b.schedule);
            return bTime - aTime;
        })
            .slice(0, 100);
        // DEBUG LOG
        console.log(`[APPOINTMENTS LIST] uid=${uid} role=${role} clinicId=${clinicId} returned=${results.length} items`);
        results.slice(0, 3).forEach((item, i) => {
            console.log(`  [${i}] petId=${item.petId} ownerId=${item.ownerId} vetId=${item.vetId} clinicId=${item.clinicId} schedule=${item.schedule}`);
        });
        return results;
    },
    async updateStatus(id, status) {
        const ref = appointmentsCollection.doc(id);
        const current = await ref.get();
        if (!current.exists) {
            return null;
        }
        await ref.set({ status, updatedAt: (0, time_1.nowIso)() }, { merge: true });
        return (await ref.get()).data();
    },
    async listVetPatients(vetId) {
        const snapshot = await appointmentsCollection.where("vetId", "==", vetId).get();
        const unique = new Map();
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            unique.set(`${data.ownerId}_${data.petId}`, {
                ownerId: data.ownerId,
                ownerName: data.ownerName,
                petId: data.petId,
                petName: data.petName
            });
        });
        return Array.from(unique.values());
    }
};
