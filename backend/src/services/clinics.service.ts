import { firestoreDb } from "../config/firebase";
import { ClinicModel } from "../models/clinic.model";
import { nowIso } from "../utils/time";

const clinicsCollection = firestoreDb.collection("clinics");

export const clinicsService = {
  async create(payload: Omit<ClinicModel, "clinicId" | "activo" | "createdAt">): Promise<ClinicModel> {
    const doc = clinicsCollection.doc();
    const clinic: ClinicModel = {
      clinicId: doc.id,
      ...payload,
      activo: true,
      createdAt: nowIso()
    };
    await doc.set(clinic);
    return clinic;
  },

  async list(): Promise<ClinicModel[]> {
    const snapshot = await clinicsCollection.where("activo", "==", true).get();
    return snapshot.docs.map((doc) => doc.data() as ClinicModel);
  },

  async update(id: string, patch: Partial<ClinicModel>): Promise<ClinicModel | null> {
    const ref = clinicsCollection.doc(id);
    const current = await ref.get();
    if (!current.exists) {
      return null;
    }
    await ref.set(patch, { merge: true });
    return (await ref.get()).data() as ClinicModel;
  }
};
