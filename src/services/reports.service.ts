import { firestoreDb } from "../config/firebase";

const appointmentsCollection = firestoreDb.collection("appointments");
const petsCollection = firestoreDb.collection("pets");

export const reportsService = {
  async appointmentsByPeriod(clinicId: string | null, from?: string, to?: string) {
    let query: FirebaseFirestore.Query = appointmentsCollection;

    if (clinicId) {
      query = query.where("clinicId", "==", clinicId);
    }

    const snapshot = await query.get();
    const all = snapshot.docs.map((doc) => doc.data() as Record<string, unknown>);

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

  async patientsSummaryByVet(clinicId: string | null) {
    let query: FirebaseFirestore.Query = petsCollection.where("activo", "==", true);

    if (clinicId) {
      query = query.where("clinicId", "==", clinicId);
    }

    const snapshot = await query.get();
    const counters = new Map<string, number>();

    snapshot.docs.forEach((doc) => {
      const row = doc.data() as { vetId?: string | null };
      const vetId = row.vetId ?? "unassigned";
      counters.set(vetId, (counters.get(vetId) ?? 0) + 1);
    });

    return Array.from(counters.entries()).map(([vetId, totalPatients]) => ({ vetId, totalPatients }));
  }
};
