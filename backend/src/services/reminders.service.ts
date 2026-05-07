import { firestoreDb } from "../config/firebase";
import { nowIso } from "../utils/time";

const remindersCollection = firestoreDb.collection("reminders");

const withDoseRecords = async (doc: FirebaseFirestore.QueryDocumentSnapshot): Promise<Record<string, unknown>> => {
  const data = doc.data();
  const dosesSnapshot = await remindersCollection.doc(doc.id).collection("dose_records").get();
  const doseRecords = dosesSnapshot.docs.map((doseDoc) => doseDoc.data());
  return { ...data, doseRecords };
};

export const remindersService = {
  async create(payload: Record<string, unknown>) {
    const doc = remindersCollection.doc();
    const data = { id: doc.id, ...payload, createdAt: nowIso(), updatedAt: nowIso() };
    await doc.set(data);
    return data;
  },

  async getById(id: string) {
    const doc = await remindersCollection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data();
  },

  async listByPet(petId: string) {
    const snapshot = await remindersCollection.where("petId", "==", petId).get();
    const reminders = await Promise.all(snapshot.docs.map(withDoseRecords));
    return reminders;
  },

  async listByPetIds(petIds: string[]) {
    if (petIds.length === 0) {
      return [];
    }

    const snapshots = await Promise.all(
      petIds.map((petId) => remindersCollection.where("petId", "==", petId).get())
    );
    const allDocs = snapshots.flatMap((snapshot) => snapshot.docs);
    const reminders = await Promise.all(allDocs.map(withDoseRecords));
    return reminders;
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
