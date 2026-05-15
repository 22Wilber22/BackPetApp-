import { firestoreDb } from "../config/firebase";
import { AppointmentModel, AppointmentStatus } from "../models/appointment.model";
import { nowIso } from "../utils/time";
import { logger } from "../utils/logger";

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
    // NOTE: Combining where("field") + orderBy("otherField") requires a composite Firestore
    // index that may not exist. Sort in memory instead to avoid FAILED_PRECONDITION errors.
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

    if (role === "admin") {
      query = appointmentsCollection.limit(200);
    } else if (role === "usuario") {
      query = appointmentsCollection.where("ownerId", "==", uid);
    } else if (role === "veterinario") {
      query = appointmentsCollection.where("vetId", "==", uid);
    } else if (role === "jefe" || role === "recepcionista" || role === "asistente") {
      if (!clinicId) return [];
      query = appointmentsCollection.where("clinicId", "==", clinicId);
    } else {
      return [];
    }

    const snapshot = await query.get();
    const results = snapshot.docs
      .map((doc) => doc.data() as AppointmentModel)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
      .slice(0, 100);

    logger.debug({ uid, role, clinicId, count: results.length }, "appointments listed");
    return results;
  },

  async getById(id: string): Promise<AppointmentModel | null> {
    const ref = appointmentsCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    return doc.data() as AppointmentModel;
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
