import { firestoreDb } from "../config/firebase";
import { VetModel } from "../models/vet.model";
import { nowIso } from "../utils/time";

const vetsCollection = firestoreDb.collection("vets");
const assistantsCollection = firestoreDb.collection("vet_assistants");

export const vetsService = {
  async create(payload: Omit<VetModel, "vetId" | "activo" | "createdAt">): Promise<VetModel> {
    const doc = vetsCollection.doc();
    const vet: VetModel = {
      vetId: doc.id,
      ...payload,
      activo: true,
      createdAt: nowIso()
    };

    await doc.set(vet);
    return vet;
  },

  async list(): Promise<VetModel[]> {
    const snapshot = await vetsCollection.where("activo", "==", true).get();
    return snapshot.docs.map((doc) => doc.data() as VetModel);
  },

  async listByClinic(clinicId: string): Promise<VetModel[]> {
    const snapshot = await vetsCollection.where("activo", "==", true).where("clinicId", "==", clinicId).get();
    return snapshot.docs.map((doc) => doc.data() as VetModel);
  },

  async getByUserId(userId: string): Promise<VetModel | null> {
    const snapshot = await vetsCollection.where("userId", "==", userId).limit(1).get();
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as VetModel;
  },

  async getByVetId(vetId: string): Promise<VetModel | null> {
    const doc = await vetsCollection.doc(vetId).get();
    if (!doc.exists) {
      return null;
    }

    return doc.data() as VetModel;
  },

  async update(id: string, patch: Partial<VetModel>): Promise<VetModel | null> {
    const ref = vetsCollection.doc(id);
    const current = await ref.get();
    if (!current.exists) {
      return null;
    }
    await ref.set(patch, { merge: true });
    return (await ref.get()).data() as VetModel;
  },

  async addAssistant(vetId: string, assistantUserId: string): Promise<void> {
    const doc = assistantsCollection.doc(`${vetId}_${assistantUserId}`);
    await doc.set({ id: doc.id, vetId, assistantUserId, activo: true, createdAt: nowIso() });
  },

  async removeAssistant(vetId: string, assistantUserId: string): Promise<void> {
    await assistantsCollection.doc(`${vetId}_${assistantUserId}`).delete();
  }
};
