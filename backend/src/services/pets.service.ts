import { firestoreDb } from "../config/firebase";
import { PetModel } from "../models/pet.model";
import { nowIso } from "../utils/time";
import { usersService } from "./users.service";

const petsCollection = firestoreDb.collection("pets");

type CreatePetInput = Omit<PetModel, "id" | "createdAt" | "updatedAt" | "archivedAt" | "deleteAfterAt" | "activo">;
type CreatePetPayload = Omit<CreatePetInput, "ownerId">;

const mapDoc = (doc: FirebaseFirestore.DocumentSnapshot): PetModel => ({
  id: doc.id,
  ...(doc.data() as Omit<PetModel, "id">)
});

export const petsService = {
  async create(ownerId: string, data: CreatePetPayload): Promise<PetModel> {
    const now = nowIso();
    const petRef = petsCollection.doc();
    const pet: PetModel = {
      id: petRef.id,
      ownerId,
      ...data,
      activo: true,
      archivedAt: null,
      deleteAfterAt: null,
      createdAt: now,
      updatedAt: now
    };

    const { id: _id, ...petDoc } = pet;
    await petRef.set(petDoc);
    await usersService.setHasPet(ownerId, true);
    return pet;
  },

  async listByOwner(ownerId: string): Promise<PetModel[]> {
    const query = await petsCollection.where("ownerId", "==", ownerId).where("activo", "==", true).get();
    return query.docs.map(mapDoc);
  },

  async getById(id: string): Promise<PetModel | null> {
    const doc = await petsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return mapDoc(doc);
  },

  async deactivate(id: string): Promise<PetModel | null> {
    const pet = await this.getById(id);
    if (!pet) {
      return null;
    }

    const archivedAt = nowIso();
    const deleteAfter = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

    await petsCollection.doc(id).set(
      {
        activo: false,
        archivedAt,
        deleteAfterAt: deleteAfter,
        updatedAt: nowIso()
      },
      { merge: true }
    );

    const ownerPets = await petsCollection.where("ownerId", "==", pet.ownerId).where("activo", "==", true).get();
    if (ownerPets.empty) {
      await usersService.setHasPet(pet.ownerId, false);
    }

    return this.getById(id);
  },

  async assignVet(id: string, vetId: string, clinicId: string | null): Promise<PetModel | null> {
    await petsCollection.doc(id).set(
      {
        usaVeterinaria: true,
        vetId,
        clinicId: clinicId ?? null,
        updatedAt: nowIso()
      },
      { merge: true }
    );
    return this.getById(id);
  },

  async unassignVet(id: string): Promise<PetModel | null> {
    await petsCollection.doc(id).set(
      {
        usaVeterinaria: false,
        vetId: null,
        clinicId: null,
        updatedAt: nowIso()
      },
      { merge: true }
    );
    return this.getById(id);
  },

  async listArchivedByOwner(ownerId: string): Promise<PetModel[]> {
    const query = await petsCollection
      .where("ownerId", "==", ownerId)
      .where("activo", "==", false)
      .get();
    return query.docs.map(mapDoc);
  },

  async reactivate(id: string): Promise<PetModel | null> {
    const pet = await this.getById(id);
    if (!pet) return null;

    await petsCollection.doc(id).set(
      {
        activo: true,
        archivedAt: null,
        deleteAfterAt: null,
        updatedAt: nowIso()
      },
      { merge: true }
    );

    await usersService.setHasPet(pet.ownerId, true);
    return this.getById(id);
  }
};
