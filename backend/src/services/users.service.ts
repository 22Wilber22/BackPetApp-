import { firestoreDb } from "../config/firebase";
import { UserModel, UserRole } from "../models/user.model";
import { nowIso } from "../utils/time";

const usersCollection = firestoreDb.collection("users");

export const usersService = {
  async getByUid(uid: string): Promise<UserModel | null> {
    const snapshot = await usersCollection.doc(uid).get();
    if (!snapshot.exists) {
      return null;
    }
    return snapshot.data() as UserModel;
  },

  async create(data: Omit<UserModel, "createdAt" | "updatedAt">): Promise<UserModel> {
    const now = nowIso();
    const payload: UserModel = { ...data, createdAt: now, updatedAt: now };
    await usersCollection.doc(data.uid).set(payload);
    return payload;
  },

  async update(uid: string, patch: Partial<UserModel>): Promise<UserModel> {
    const current = await this.getByUid(uid);
    if (!current) {
      throw new Error("User not found");
    }

    const updated: UserModel = {
      ...current,
      ...patch,
      updatedAt: nowIso()
    };

    await usersCollection.doc(uid).set(updated);
    return updated;
  },

  async updateRole(uid: string, role: UserRole, clinicId?: string | null): Promise<void> {
    const patch: Record<string, unknown> = { role, updatedAt: nowIso() };
    if (clinicId !== undefined) {
      patch.clinicId = clinicId;
    }

    await usersCollection.doc(uid).set(patch, { merge: true });
  },

  async setHasPet(uid: string, tieneMascota: boolean): Promise<void> {
    await usersCollection.doc(uid).set({ tieneMascota, updatedAt: nowIso() }, { merge: true });
  }
};
