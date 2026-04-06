import { firestoreDb } from "../config/firebase";
import { PetModel } from "../models/pet.model";
import { UserModel } from "../models/user.model";

const usersCollection = firestoreDb.collection("users");
const petsCollection = firestoreDb.collection("pets");

const mapPetDoc = (doc: FirebaseFirestore.DocumentSnapshot): PetModel => ({
  id: doc.id,
  ...(doc.data() as Omit<PetModel, "id">)
});

export const staffService = {
  async listTeamByClinic(clinicId: string): Promise<{ veterinarios: UserModel[]; recepcionistas: UserModel[] }> {
    const vetsSnapshot = await usersCollection.where("clinicId", "==", clinicId).where("role", "==", "veterinario").where("activo", "==", true).get();
    const recepSnapshot = await usersCollection.where("clinicId", "==", clinicId).where("role", "==", "recepcionista").where("activo", "==", true).get();

    return {
      veterinarios: vetsSnapshot.docs.map((doc) => doc.data() as UserModel),
      recepcionistas: recepSnapshot.docs.map((doc) => doc.data() as UserModel)
    };
  },

  async listPatientsByVet(clinicId: string, vetUid: string): Promise<PetModel[]> {
    const snapshot = await petsCollection
      .where("clinicId", "==", clinicId)
      .where("vetId", "==", vetUid)
      .where("activo", "==", true)
      .get();

    return snapshot.docs.map(mapPetDoc);
  }
};
