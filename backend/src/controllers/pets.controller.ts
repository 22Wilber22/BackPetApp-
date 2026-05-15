import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { petsService } from "../services/pets.service";
import { firestoreDb } from "../config/firebase";
import { nowIso } from "../utils/time";

/**
 * Verifica que el caller tiene acceso de escritura/lectura sobre la mascota.
 * Roles permitidos: dueño, veterinario asignado, asistente del vet asignado, admin.
 * Lanza ApiError 403 si no tiene acceso.
 */
async function assertPetWriteAccess(petId: string, req: Request): Promise<NonNullable<Awaited<ReturnType<typeof petsService.getById>>>> {
  const pet = await petsService.getById(petId);
  if (!pet) throw new ApiError(404, "NOT_FOUND", "Pet not found");

  const uid = req.user?.uid;
  const role = req.user?.role;
  const supervisorVetId = (req.user as any)?.supervisorVetId as string | null | undefined;

  const isOwner = pet.ownerId === uid;
  const isAdmin = role === "admin";
  const isAssignedVet = role === "veterinario" && pet.vetId === uid;
  const isAssistant = role === "asistente" && pet.vetId === supervisorVetId;

  if (!(isOwner || isAdmin || isAssignedVet || isAssistant)) {
    throw new ApiError(403, "FORBIDDEN", "No tienes acceso a esta mascota");
  }

  return pet;
}

export const petsController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const pet = await petsService.create(uid, req.body);
    res.status(201).json({ data: pet });
  },

  listMine: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const pets = await petsService.listByOwner(uid);
    res.status(200).json({ data: pets });
  },

  deactivate: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const pet = await petsService.getById(id);
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }

    const actorRole = req.user?.role;
    if (pet.ownerId !== req.user?.uid && actorRole !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "Cannot deactivate this pet");
    }

    const updated = await petsService.deactivate(id);
    res.status(200).json({ data: updated });
  },

  listMineArchived: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    const pets = await petsService.listArchivedByOwner(uid);
    res.status(200).json({ data: pets });
  },

  reactivate: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const pet = await petsService.getById(id);
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }
    if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "Cannot reactivate this pet");
    }
    const updated = await petsService.reactivate(id);
    res.status(200).json({ data: updated });
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const pet = await petsService.getById(id);
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }
    if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "Cannot update this pet");
    }
    const updated = await petsService.update(id, req.body);
    res.status(200).json({ data: updated });
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const pet = await petsService.getById(id);
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }

    const role = req.user?.role;
    const uid = req.user?.uid;
    const supervisorVetId = (req.user as Request["user"] & { supervisorVetId?: string | null } | undefined)?.supervisorVetId;

    const isOwner = pet.ownerId === uid;
    const isAdmin = role === "admin";
    const isAssignedVet = role === "veterinario" && pet.vetId === uid;
    const isAssistant = role === "asistente" && pet.vetId === supervisorVetId;

    if (!(isOwner || isAdmin || isAssignedVet || isAssistant)) {
      throw new ApiError(403, "FORBIDDEN", "No access to this pet");
    }

    res.status(200).json({ data: pet });
  },

  assignVet: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const pet = await petsService.getById(id);
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }

    if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "No permissions to assign vet");
    }

    const updated = await petsService.assignVet(id, req.body.vetId, req.body.clinicId ?? null);
    res.status(200).json({ data: updated });
  },

  unassignVet: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const pet = await petsService.getById(id);
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }

    if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "No permissions to unassign vet");
    }

    const updated = await petsService.unassignVet(id);
    res.status(200).json({ data: updated });
  },

  createHealthRecord: async (req: Request, res: Response): Promise<void> => {
    const pet = await assertPetWriteAccess(String(req.params.id), req);

    const doc = firestoreDb.collection("pet_health_records").doc();
    await doc.set({
      id: doc.id,
      petId: pet.id,
      // ownerId y vetId se infieren del token — no del body del cliente
      ownerId: pet.ownerId,
      vetId: pet.vetId ?? null,
      tipo: req.body.tipo,
      fecha: req.body.fecha ?? nowIso(),
      pesoKg: req.body.pesoKg ?? null,
      nombreVacuna: req.body.nombreVacuna ?? null,
      dosis: req.body.dosis ?? null,
      tratamiento: req.body.tratamiento ?? null,
      diagnostico: req.body.diagnostico ?? null,
      observaciones: req.body.observaciones ?? null,
      creadoPorRole: req.user?.role ?? "usuario",
      createdAt: nowIso(),
      archived: false
    });

    res.status(201).json({ data: { id: doc.id } });
  },

  listHealthRecords: async (req: Request, res: Response): Promise<void> => {
    const snapshot = await firestoreDb
      .collection("pet_health_records")
      .where("petId", "==", req.params.id)
      .where("archived", "==", false)
      .get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  },

  addHealthRecordRevision: async (req: Request, res: Response): Promise<void> => {
    const recordId = String(req.params.recordId);
    const revisionRef = firestoreDb
      .collection("pet_health_records")
      .doc(recordId)
      .collection("revisions")
      .doc();

    await revisionRef.set({
      revisionId: revisionRef.id,
      payload: req.body,
      createdAt: nowIso(),
      createdBy: req.user?.uid ?? null
    });

    res.status(201).json({ data: { revisionId: revisionRef.id } });
  },

  archiveHealthRecord: async (req: Request, res: Response): Promise<void> => {
    const recordId = String(req.params.recordId);
    await firestoreDb.collection("pet_health_records").doc(recordId).set({ archived: true, archivedAt: nowIso() }, { merge: true });
    res.status(200).json({ data: { archived: true } });
  },

  lastWeight: async (req: Request, res: Response): Promise<void> => {
    // where("petId") + where("tipo") + orderBy("fecha") requires composite index. Sort in memory.
    const snapshot = await firestoreDb
      .collection("pet_health_records")
      .where("petId", "==", req.params.id)
      .where("tipo", "==", "peso")
      .get();

    const sorted = snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => (String(b.fecha ?? "") > String(a.fecha ?? "") ? 1 : -1));
    const record = sorted.length > 0 ? sorted[0] : null;
    res.status(200).json({ data: record });
  },

  createEvent: async (req: Request, res: Response): Promise<void> => {
    const pet = await assertPetWriteAccess(String(req.params.id), req);

    const eventRef = firestoreDb.collection("pet_events").doc();
    await eventRef.set({
      eventId: eventRef.id,
      petId: pet.id,
      // ownerId y vetId se infieren de la mascota — no del body del cliente
      ownerId: pet.ownerId,
      vetId: pet.vetId ?? null,
      assistantId: req.body.assistantId ?? null,
      tipo: req.body.tipo,
      titulo: req.body.titulo,
      detalle: req.body.detalle,
      visibilidad: req.body.visibilidad ?? "clinical_team",
      fechaEvento: req.body.fechaEvento ?? nowIso(),
      proximoControl: req.body.proximoControl ?? null,
      pesoKg: req.body.pesoKg ?? null,
      archivado: false,
      version: 1,
      createdBy: req.user?.uid ?? null,
      createdAt: nowIso()
    });
    res.status(201).json({ data: { eventId: eventRef.id } });
  },

  listEvents: async (req: Request, res: Response): Promise<void> => {
    const petId = String(req.params.id);
    await assertPetWriteAccess(petId, req);

    const snapshot = await firestoreDb
      .collection("pet_events")
      .where("petId", "==", petId)
      .where("archivado", "==", false)
      .get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  },

  timelineEvents: async (req: Request, res: Response): Promise<void> => {
    // where("petId") + orderBy("fechaEvento") requires a composite Firestore index.
    // Sort in memory to avoid FAILED_PRECONDITION errors.
    const snapshot = await firestoreDb
      .collection("pet_events")
      .where("petId", "==", req.params.id)
      .get();
    const data = snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => {
        const fa = String(a.fechaEvento ?? "");
        const fb = String(b.fechaEvento ?? "");
        return fb > fa ? 1 : -1;
      })
      .slice(0, 50);
    res.status(200).json({ data });
  },

  createMedication: async (req: Request, res: Response): Promise<void> => {
    const pet = await assertPetWriteAccess(String(req.params.id), req);

    const medRef = firestoreDb.collection("pet_medication_notes").doc();
    await medRef.set({
      id: medRef.id,
      petId: pet.id,
      ownerId: pet.ownerId,
      nombreMedicamento: req.body.nombreMedicamento,
      indicacion: req.body.indicacion,
      dosis: req.body.dosis,
      frecuenciaHoras: req.body.frecuenciaHoras,
      horaPreferida: req.body.horaPreferida ?? null,
      fechaInicio: req.body.fechaInicio,
      fechaFin: req.body.fechaFin ?? null,
      activo: true,
      visibilidad: req.body.visibilidad ?? "owner_only",
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
    res.status(201).json({ data: { id: medRef.id } });
  },

  listMedications: async (req: Request, res: Response): Promise<void> => {
    const snapshot = await firestoreDb.collection("pet_medication_notes").where("petId", "==", req.params.id).get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  },

  patchMedication: async (req: Request, res: Response): Promise<void> => {
    const medId = String(req.params.medId);
    await firestoreDb.collection("pet_medication_notes").doc(medId).set({ ...req.body, updatedAt: nowIso() }, { merge: true });
    res.status(200).json({ data: { id: medId } });
  },

  deactivateMedication: async (req: Request, res: Response): Promise<void> => {
    const medId = String(req.params.medId);
    await firestoreDb.collection("pet_medication_notes").doc(medId).set({ activo: false, updatedAt: nowIso() }, { merge: true });
    res.status(200).json({ data: { id: medId, activo: false } });
  },

  addMedicationLog: async (req: Request, res: Response): Promise<void> => {
    const medId = String(req.params.medId);
    const logRef = firestoreDb.collection("pet_medication_notes").doc(medId).collection("logs").doc();
    await logRef.set({
      logId: logRef.id,
      fechaProgramada: req.body.fechaProgramada,
      fechaAplicada: req.body.fechaAplicada ?? null,
      estado: req.body.estado,
      nota: req.body.nota ?? null,
      registradoPor: req.user?.uid ?? null,
      createdAt: nowIso()
    });
    res.status(201).json({ data: { logId: logRef.id } });
  },

  listMedicationLogs: async (req: Request, res: Response): Promise<void> => {
    const medId = String(req.params.medId);
    const snapshot = await firestoreDb.collection("pet_medication_notes").doc(medId).collection("logs").get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  },

  dueMedications: async (req: Request, res: Response): Promise<void> => {
    const snapshot = await firestoreDb
      .collection("pet_medication_notes")
      .where("petId", "==", req.params.id)
      .where("activo", "==", true)
      .get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  }
};
