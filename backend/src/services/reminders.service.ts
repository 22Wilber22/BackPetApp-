import { firestoreDb } from "../config/firebase";
import { nowIso } from "../utils/time";

const remindersCollection = firestoreDb.collection("reminders");

export const remindersService = {
  async create(payload: Record<string, unknown>) {
    const doc = remindersCollection.doc();
    const data = { id: doc.id, ...payload, createdAt: nowIso(), updatedAt: nowIso() };
    await doc.set(data);
    return data;
  },

  async listByPet(petId: string) {
    const snapshot = await remindersCollection.where("petId", "==", petId).get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async update(id: string, patch: Record<string, unknown>) {
    await remindersCollection.doc(id).set({ ...patch, updatedAt: nowIso() }, { merge: true });
    const doc = await remindersCollection.doc(id).get();
    return doc.data();
  },

  async remove(id: string) {
    await remindersCollection.doc(id).delete();
  },

  async addDoseRecord(id: string, payload: Record<string, unknown>) {
    const doc = remindersCollection.doc(id).collection("dose_records").doc();
    const data = { recordId: doc.id, ...payload, createdAt: nowIso() };
    await doc.set(data);
    return data;
  },

  async listDoseRecords(id: string) {
    const snapshot = await remindersCollection.doc(id).collection("dose_records").get();
    return snapshot.docs.map((doc) => doc.data());
  }
};
