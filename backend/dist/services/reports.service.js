"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = void 0;
const firebase_1 = require("../config/firebase");
const appointmentsCollection = firebase_1.firestoreDb.collection("appointments");
const petsCollection = firebase_1.firestoreDb.collection("pets");
exports.reportsService = {
    async appointmentsByPeriod(clinicId, from, to) {
        let query = appointmentsCollection;
        if (clinicId) {
            query = query.where("clinicId", "==", clinicId);
        }
        const snapshot = await query.get();
        const all = snapshot.docs.map((doc) => doc.data());
        return all.filter((item) => {
            const scheduleRaw = item.schedule;
            if (typeof scheduleRaw !== "string") {
                return false;
            }
            const schedule = Date.parse(scheduleRaw);
            if (Number.isNaN(schedule)) {
                return false;
            }
            if (from && schedule < Date.parse(from)) {
                return false;
            }
            if (to && schedule > Date.parse(to)) {
                return false;
            }
            return true;
        });
    },
    async patientsSummaryByVet(clinicId) {
        let query = petsCollection.where("activo", "==", true);
        if (clinicId) {
            query = query.where("clinicId", "==", clinicId);
        }
        const snapshot = await query.get();
        const counters = new Map();
        snapshot.docs.forEach((doc) => {
            const row = doc.data();
            const vetId = row.vetId ?? "unassigned";
            counters.set(vetId, (counters.get(vetId) ?? 0) + 1);
        });
        return Array.from(counters.entries()).map(([vetId, totalPatients]) => ({ vetId, totalPatients }));
    }
};
