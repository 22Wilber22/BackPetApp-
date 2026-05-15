import { firestoreDb } from "../config/firebase";
import { ApiError } from "../utils/api-error";
import { nowIso } from "../utils/time";
import { PetModel } from "../models/pet.model";
import { UserRole } from "../models/user.model";

const petsCollection = firestoreDb.collection("pets");
const historyCollection = firestoreDb.collection("pet_health_records");
const treatmentsCollection = firestoreDb.collection("pet_medication_notes");

const mapPetDoc = (doc: FirebaseFirestore.DocumentSnapshot): PetModel => ({
  id: doc.id,
  ...(doc.data() as Omit<PetModel, "id">)
});

type ActorContext = {
  uid: string;
  role: UserRole;
  clinicId: string | null;
};

export const patientsService = {
  async listByActor(actor: ActorContext): Promise<PetModel[]> {
    let query: FirebaseFirestore.Query = petsCollection.where("activo", "==", true);

    if (actor.role === "usuario") {
      throw new ApiError(403, "FORBIDDEN", "Usuario role cannot access /patients");
    }

    if (actor.role === "admin") {
      const snapshot = await query.get();
      return snapshot.docs.map(mapPetDoc);
    }

    if (actor.role === "veterinario") {
      query = query.where("vetId", "==", actor.uid);
      const snapshot = await query.get();
      return snapshot.docs.map(mapPetDoc);
    }

    const clinicId = actor.clinicId;
    if (!clinicId) {
      throw new ApiError(403, "FORBIDDEN", "Clinic context required");
    }

    query = query.where("clinicId", "==", clinicId);
    const snapshot = await query.get();
    return snapshot.docs.map(mapPetDoc);
  },

  async getByIdForActor(actor: ActorContext, petId: string): Promise<PetModel> {
    const doc = await petsCollection.doc(petId).get();
    if (!doc.exists) {
      throw new ApiError(404, "NOT_FOUND", "Patient not found");
    }

    const pet = mapPetDoc(doc);

    if (actor.role === "admin") {
      return pet;
    }

    if (actor.role === "usuario") {
      throw new ApiError(403, "FORBIDDEN", "Usuario role cannot access /patients");
    }

    if (actor.role === "veterinario") {
      if (pet.vetId !== actor.uid) {
        throw new ApiError(403, "FORBIDDEN", "No access to patient from another vet");
      }
      return pet;
    }

    if (!actor.clinicId || pet.clinicId !== actor.clinicId) {
      throw new ApiError(403, "FORBIDDEN", "No access to patient from another clinic");
    }

    return pet;
  },

  async addHistoryEntry(actor: ActorContext, petId: string, payload: Record<string, unknown>) {
    const ref = historyCollection.doc();
    await ref.set({
      id: ref.id,
      petId,
      clinicId: actor.clinicId,
      vetId: actor.role === "veterinario" ? actor.uid : (payload.vetId ?? null),
      tipo: payload.tipo ?? "nota",
      fecha: payload.fecha ?? nowIso(),
      detalle: payload.detalle ?? null,
      observaciones: payload.observaciones ?? null,
      creadoPorRole: actor.role,
      createdBy: actor.uid,
      createdAt: nowIso(),
      archived: false
    });

    return { id: ref.id };
  },

  async listHistory(petId: string) {
    // orderBy("fecha") + where("petId") across different fields requires a composite index.
    // Sort in memory to avoid FAILED_PRECONDITION errors.
    const snapshot = await historyCollection.where("petId", "==", petId).get();
    return snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => {
        const fa = String(a.fecha ?? "");
        const fb = String(b.fecha ?? "");
        return fb > fa ? 1 : -1;
      });
  },

  async addHistoryRevision(actor: ActorContext, recordId: string, payload: Record<string, unknown>) {
    const revisionRef = historyCollection.doc(recordId).collection("revisions").doc();
    await revisionRef.set({
      revisionId: revisionRef.id,
      payload,
      createdAt: nowIso(),
      createdBy: actor.uid,
      createdByRole: actor.role
    });

    return { revisionId: revisionRef.id };
  },

  async createTreatment(actor: ActorContext, petId: string, payload: Record<string, unknown>) {
    const ref = treatmentsCollection.doc();
    await ref.set({
      id: ref.id,
      petId,
      ownerId: payload.ownerId ?? null,
      clinicId: actor.clinicId,
      vetId: actor.role === "veterinario" ? actor.uid : (payload.vetId ?? null),
      nombreMedicamento: payload.nombreMedicamento,
      indicacion: payload.indicacion,
      dosis: payload.dosis,
      frecuenciaHoras: payload.frecuenciaHoras,
      horaPreferida: payload.horaPreferida ?? null,
      fechaInicio: payload.fechaInicio ?? nowIso(),
      fechaFin: payload.fechaFin ?? null,
      activo: true,
      visibilidad: payload.visibilidad ?? "owner_visible",
      createdAt: nowIso(),
      updatedAt: nowIso()
    });

    return { id: ref.id };
  },

  async patchTreatment(treatmentId: string, patch: Record<string, unknown>) {
    await treatmentsCollection.doc(treatmentId).set({ ...patch, updatedAt: nowIso() }, { merge: true });
    return { id: treatmentId };
  },

  async listTreatments(petId: string) {
    const snapshot = await treatmentsCollection.where("petId", "==", petId).get();
    return snapshot.docs.map((doc) => doc.data());
  }
};
