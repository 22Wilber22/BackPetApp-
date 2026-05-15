"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.petsController = void 0;
const api_error_1 = require("../utils/api-error");
const pets_service_1 = require("../services/pets.service");
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
exports.petsController = {
    create: async (req, res) => {
        const uid = req.user?.uid;
        if (!uid) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const pet = await pets_service_1.petsService.create(uid, req.body);
        res.status(201).json({ data: pet });
    },
    listMine: async (req, res) => {
        const uid = req.user?.uid;
        if (!uid) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const pets = await pets_service_1.petsService.listByOwner(uid);
        res.status(200).json({ data: pets });
    },
    deactivate: async (req, res) => {
        const id = String(req.params.id);
        const pet = await pets_service_1.petsService.getById(id);
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        const actorRole = req.user?.role;
        if (pet.ownerId !== req.user?.uid && actorRole !== "admin") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot deactivate this pet");
        }
        const updated = await pets_service_1.petsService.deactivate(id);
        res.status(200).json({ data: updated });
    },
    listMineArchived: async (req, res) => {
        const uid = req.user?.uid;
        if (!uid) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const pets = await pets_service_1.petsService.listArchivedByOwner(uid);
        res.status(200).json({ data: pets });
    },
    reactivate: async (req, res) => {
        const id = String(req.params.id);
        const pet = await pets_service_1.petsService.getById(id);
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot reactivate this pet");
        }
        const updated = await pets_service_1.petsService.reactivate(id);
        res.status(200).json({ data: updated });
    },
    update: async (req, res) => {
        const id = String(req.params.id);
        const pet = await pets_service_1.petsService.getById(id);
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "Cannot update this pet");
        }
        const updated = await pets_service_1.petsService.update(id, req.body);
        res.status(200).json({ data: updated });
    },
    getById: async (req, res) => {
        const id = String(req.params.id);
        const pet = await pets_service_1.petsService.getById(id);
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        const role = req.user?.role;
        const uid = req.user?.uid;
        const supervisorVetId = req.user?.supervisorVetId;
        const isOwner = pet.ownerId === uid;
        const isAdmin = role === "admin";
        const isAssignedVet = role === "veterinario" && pet.vetId === uid;
        const isAssistant = role === "asistente" && pet.vetId === supervisorVetId;
        if (!(isOwner || isAdmin || isAssignedVet || isAssistant)) {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "No access to this pet");
        }
        res.status(200).json({ data: pet });
    },
    assignVet: async (req, res) => {
        const id = String(req.params.id);
        const pet = await pets_service_1.petsService.getById(id);
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "No permissions to assign vet");
        }
        const updated = await pets_service_1.petsService.assignVet(id, req.body.vetId, req.body.clinicId ?? null);
        res.status(200).json({ data: updated });
    },
    unassignVet: async (req, res) => {
        const id = String(req.params.id);
        const pet = await pets_service_1.petsService.getById(id);
        if (!pet) {
            throw new api_error_1.ApiError(404, "NOT_FOUND", "Pet not found");
        }
        if (pet.ownerId !== req.user?.uid && req.user?.role !== "admin") {
            throw new api_error_1.ApiError(403, "FORBIDDEN", "No permissions to unassign vet");
        }
        const updated = await pets_service_1.petsService.unassignVet(id);
        res.status(200).json({ data: updated });
    },
    createHealthRecord: async (req, res) => {
        const doc = firebase_1.firestoreDb.collection("pet_health_records").doc();
        await doc.set({
            id: doc.id,
            petId: req.params.id,
            ownerId: req.body.ownerId ?? null,
            vetId: req.body.vetId ?? null,
            tipo: req.body.tipo,
            fecha: req.body.fecha ?? (0, time_1.nowIso)(),
            pesoKg: req.body.pesoKg ?? null,
            nombreVacuna: req.body.nombreVacuna ?? null,
            dosis: req.body.dosis ?? null,
            tratamiento: req.body.tratamiento ?? null,
            diagnostico: req.body.diagnostico ?? null,
            observaciones: req.body.observaciones ?? null,
            creadoPorRole: req.user?.role ?? "usuario",
            createdAt: (0, time_1.nowIso)(),
            archived: false
        });
        res.status(201).json({ data: { id: doc.id } });
    },
    listHealthRecords: async (req, res) => {
        const snapshot = await firebase_1.firestoreDb
            .collection("pet_health_records")
            .where("petId", "==", req.params.id)
            .where("archived", "==", false)
            .get();
        res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
    },
    addHealthRecordRevision: async (req, res) => {
        const recordId = String(req.params.recordId);
        const revisionRef = firebase_1.firestoreDb
            .collection("pet_health_records")
            .doc(recordId)
            .collection("revisions")
            .doc();
        await revisionRef.set({
            revisionId: revisionRef.id,
            payload: req.body,
            createdAt: (0, time_1.nowIso)(),
            createdBy: req.user?.uid ?? null
        });
        res.status(201).json({ data: { revisionId: revisionRef.id } });
    },
    archiveHealthRecord: async (req, res) => {
        const recordId = String(req.params.recordId);
        await firebase_1.firestoreDb.collection("pet_health_records").doc(recordId).set({ archived: true, archivedAt: (0, time_1.nowIso)() }, { merge: true });
        res.status(200).json({ data: { archived: true } });
    },
    lastWeight: async (req, res) => {
        const snapshot = await firebase_1.firestoreDb
            .collection("pet_health_records")
            .where("petId", "==", req.params.id)
            .where("tipo", "==", "peso")
            .orderBy("fecha", "desc")
            .limit(1)
            .get();
        const record = snapshot.empty ? null : snapshot.docs[0].data();
        res.status(200).json({ data: record });
    },
    createEvent: async (req, res) => {
        const eventRef = firebase_1.firestoreDb.collection("pet_events").doc();
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
            fechaEvento: req.body.fechaEvento ?? (0, time_1.nowIso)(),
            proximoControl: req.body.proximoControl ?? null,
            pesoKg: req.body.pesoKg ?? null,
            archivado: false,
            version: 1,
            createdBy: req.user?.uid ?? null,
            createdAt: (0, time_1.nowIso)()
        });
        res.status(201).json({ data: { eventId: eventRef.id } });
    },
    listEvents: async (req, res) => {
        const snapshot = await firebase_1.firestoreDb.collection("pet_events").where("petId", "==", req.params.id).get();
        res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
    },
    timelineEvents: async (req, res) => {
        const snapshot = await firebase_1.firestoreDb
            .collection("pet_events")
            .where("petId", "==", req.params.id)
            .orderBy("fechaEvento", "desc")
            .limit(50)
            .get();
        res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
    },
    createMedication: async (req, res) => {
        const medRef = firebase_1.firestoreDb.collection("pet_medication_notes").doc();
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
            createdAt: (0, time_1.nowIso)(),
            updatedAt: (0, time_1.nowIso)()
        });
        res.status(201).json({ data: { id: medRef.id } });
    },
    listMedications: async (req, res) => {
        const snapshot = await firebase_1.firestoreDb.collection("pet_medication_notes").where("petId", "==", req.params.id).get();
        res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
    },
    patchMedication: async (req, res) => {
        const medId = String(req.params.medId);
        await firebase_1.firestoreDb.collection("pet_medication_notes").doc(medId).set({ ...req.body, updatedAt: (0, time_1.nowIso)() }, { merge: true });
        res.status(200).json({ data: { id: medId } });
    },
    deactivateMedication: async (req, res) => {
        const medId = String(req.params.medId);
        await firebase_1.firestoreDb.collection("pet_medication_notes").doc(medId).set({ activo: false, updatedAt: (0, time_1.nowIso)() }, { merge: true });
        res.status(200).json({ data: { id: medId, activo: false } });
    },
    addMedicationLog: async (req, res) => {
        const medId = String(req.params.medId);
        const logRef = firebase_1.firestoreDb.collection("pet_medication_notes").doc(medId).collection("logs").doc();
        await logRef.set({
            logId: logRef.id,
            fechaProgramada: req.body.fechaProgramada,
            fechaAplicada: req.body.fechaAplicada ?? null,
            estado: req.body.estado,
            nota: req.body.nota ?? null,
            registradoPor: req.user?.uid ?? null,
            createdAt: (0, time_1.nowIso)()
        });
        res.status(201).json({ data: { logId: logRef.id } });
    },
    listMedicationLogs: async (req, res) => {
        const medId = String(req.params.medId);
        const snapshot = await firebase_1.firestoreDb.collection("pet_medication_notes").doc(medId).collection("logs").get();
        res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
    },
    dueMedications: async (req, res) => {
        const snapshot = await firebase_1.firestoreDb
            .collection("pet_medication_notes")
            .where("petId", "==", req.params.id)
            .where("activo", "==", true)
            .get();
        res.status(200).json({ data: snapshot.docs.map((doc) => doc.data()) });
    }
};
