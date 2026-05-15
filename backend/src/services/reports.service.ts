import { firestoreDb } from "../config/firebase";

const appointmentsCollection = firestoreDb.collection("appointments");
const petsCollection = firestoreDb.collection("pets");

export const reportsService = {
  async appointmentsByPeriod(clinicId: string | null, from?: string, to?: string) {
    // where("clinicId") + where("schedule", range) + orderBy("schedule") requires a composite
    // index that may not be deployed. Apply range and sort in memory to avoid FAILED_PRECONDITION.
    let query: FirebaseFirestore.Query = clinicId
      ? appointmentsCollection.where("clinicId", "==", clinicId)
      : appointmentsCollection.limit(500);

    const snapshot = await query.get();
    let results = snapshot.docs.map((doc) => doc.data() as Record<string, unknown>);

    if (from) results = results.filter((r) => String(r.schedule ?? "") >= from);
    if (to)   results = results.filter((r) => String(r.schedule ?? "") <= to);

    results.sort((a, b) => (String(b.schedule ?? "") > String(a.schedule ?? "") ? 1 : -1));
    return results.slice(0, 500);
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
