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

  async getById(id: string): Promise<Record<string, unknown> | null> {
    const doc = await remindersCollection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Record<string, unknown>;
  },

  async listByPet(petId: string, uid: string, role: string) {
    const snapshot = await remindersCollection.where("petId", "==", petId).get();
    const all = snapshot.docs.map((doc) => doc.data() as Record<string, unknown>);

    // Admins ven todos; usuarios solo ven los suyos propios
    if (role === "admin") return all;
    return all.filter((r) => r.userId === uid);
  },

  async update(id: string, patch: Record<string, unknown>) {
    // Nunca permitir sobrescribir userId desde un patch del cliente
    const { userId: _drop, ...safePatch } = patch as Record<string, unknown>;
    await remindersCollection.doc(id).set({ ...safePatch, updatedAt: nowIso() }, { merge: true });
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
