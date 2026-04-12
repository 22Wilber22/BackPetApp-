import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { petsService } from "../services/pets.service";
import { firestoreDb } from "../config/firebase";
import { nowIso } from "../utils/time";

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
    const doc = firestoreDb.collection("pet_health_records").doc();
    await doc.set({
      id: doc.id,
      petId: req.params.id,
      ownerId: req.body.ownerId ?? null,
      vetId: req.body.vetId ?? null,
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
    const snapshot = await firestoreDb.collection("pet_health_records").where("petId", "==", req.params.id).get();
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
    const snapshot = await firestoreDb
      .collection("pet_health_records")
      .where("petId", "==", req.params.id)
      .where("tipo", "==", "peso")
      .orderBy("fecha", "desc")
      .limit(1)
      .get();

    const record = snapshot.empty ? null : snapshot.docs[0].data();
    res.status(200).json({ data: record });
  },

  createEvent: async (req: Request, res: Response): Promise<void> => {
    const eventRef = firestoreDb.collection("pet_events").doc();
    await eventRef.set({
      eventId: eventRef.id,
      petId: req.params.id,
      ownerId: req.body.ownerId ?? null,
      vetId: req.body.vetId ?? null,
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
    const snapshot = await firestoreDb.collection("pet_events").where("petId", "==", req.params.id).get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  },

  timelineEvents: async (req: Request, res: Response): Promise<void> => {
    const snapshot = await firestoreDb
      .collection("pet_events")
      .where("petId", "==", req.params.id)
      .orderBy("fechaEvento", "desc")
      .limit(50)
      .get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  },

  createMedication: async (req: Request, res: Response): Promise<void> => {
    const medRef = firestoreDb.collection("pet_medication_notes").doc();
    await medRef.set({
      id: medRef.id,
      petId: req.params.id,
      ownerId: req.user?.uid ?? null,
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

  dueMedications: async (_req: Request, res: Response): Promise<void> => {
    const snapshot = await firestoreDb.collection("pet_medication_notes").where("activo", "==", true).get();
    res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
  }
};
