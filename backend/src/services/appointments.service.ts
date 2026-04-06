import { firestoreDb } from "../config/firebase";
import { AppointmentModel, AppointmentStatus } from "../models/appointment.model";
import { nowIso } from "../utils/time";

const appointmentsCollection = firestoreDb.collection("appointments");

export const appointmentsService = {
  async create(payload: Omit<AppointmentModel, "appointmentId" | "status" | "createdAt" | "updatedAt">): Promise<AppointmentModel> {
    const doc = appointmentsCollection.doc();
    const now = nowIso();
    const appointment: AppointmentModel = {
      appointmentId: doc.id,
      ...payload,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };
    await doc.set(appointment);
    return appointment;
  },

  async listByActor(uid: string, role: string, clinicId: string | null): Promise<AppointmentModel[]> {
    let query: FirebaseFirestore.Query = appointmentsCollection;
    if (role === "admin") {
      query = appointmentsCollection;
    } else if (role === "usuario") {
      query = query.where("ownerId", "==", uid);
    } else if (role === "veterinario") {
      query = query.where("vetId", "==", uid);
    } else if (role === "jefe" || role === "recepcionista" || role === "asistente") {
      if (!clinicId) {
        return [];
      }
      query = query.where("clinicId", "==", clinicId);
    }

    const snapshot = await query.get();
    const results = snapshot.docs
      .map((doc) => doc.data() as AppointmentModel)
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

  async updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentModel | null> {
    const ref = appointmentsCollection.doc(id);
    const current = await ref.get();
    if (!current.exists) {
      return null;
    }

    await ref.set({ status, updatedAt: nowIso() }, { merge: true });
    return (await ref.get()).data() as AppointmentModel;
  },

  async listVetPatients(vetId: string): Promise<Array<{ ownerId: string; ownerName: string; petId: string; petName: string }>> {
    const snapshot = await appointmentsCollection.where("vetId", "==", vetId).get();
    const unique = new Map<string, { ownerId: string; ownerName: string; petId: string; petName: string }>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as AppointmentModel;
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
