"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindersController = void 0;
const reminders_service_1 = require("../services/reminders.service");
const pets_service_1 = require("../services/pets.service");
const api_error_1 = require("../utils/api-error");
const assertPetOwnership = async (petId, uid, role) => {
    if (!uid) {
        throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
    }
    const pet = await pets_service_1.petsService.getById(petId);
    if (!pet) {
        throw new api_error_1.ApiError(404, "PET_NOT_FOUND", "Pet not found");
    }
    const isOwner = pet.ownerId === uid;
    const isAdmin = role === "admin";
    const isAssignedVet = role === "veterinario" && pet.vetId === uid;
    if (!(isOwner || isAdmin || isAssignedVet)) {
        throw new api_error_1.ApiError(403, "FORBIDDEN", "No access to this pet's reminders");
    }
};
const assertReminderAccess = async (reminderId, uid, role) => {
    const reminder = await reminders_service_1.remindersService.getById(reminderId);
    if (!reminder) {
        throw new api_error_1.ApiError(404, "REMINDER_NOT_FOUND", "Reminder not found");
    }
    await assertPetOwnership(String(reminder.petId), uid, role);
};
exports.remindersController = {
    create: async (req, res) => {
        const petId = String(req.body?.petId ?? "");
        await assertPetOwnership(petId, req.user?.uid, req.user?.role);
        const data = await reminders_service_1.remindersService.create(req.body);
        res.status(201).json({ data });
    },
    listMine: async (req, res) => {
        const uid = req.user?.uid;
        if (!uid) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required");
        }
        const pets = await pets_service_1.petsService.listByOwner(uid);
        const petIds = pets.map((pet) => pet.id);
        const data = await reminders_service_1.remindersService.listByPetIds(petIds);
        res.status(200).json({ data });
    },
    listByPet: async (req, res) => {
        const petId = String(req.params.petId);
        await assertPetOwnership(petId, req.user?.uid, req.user?.role);
        const data = await reminders_service_1.remindersService.listByPet(petId);
        res.status(200).json({ data });
    },
    patch: async (req, res) => {
        const id = String(req.params.id);
        await assertReminderAccess(id, req.user?.uid, req.user?.role);
        const data = await reminders_service_1.remindersService.update(id, req.body);
        res.status(200).json({ data });
    },
    remove: async (req, res) => {
        const id = String(req.params.id);
        await assertReminderAccess(id, req.user?.uid, req.user?.role);
        await reminders_service_1.remindersService.remove(id);
        res.status(200).json({ data: { deleted: true } });
    },
    addDoseRecord: async (req, res) => {
        const id = String(req.params.id);
        await assertReminderAccess(id, req.user?.uid, req.user?.role);
        const data = await reminders_service_1.remindersService.addDoseRecord(id, req.body);
        res.status(201).json({ data });
    },
    listDoseRecords: async (req, res) => {
        const id = String(req.params.id);
        await assertReminderAccess(id, req.user?.uid, req.user?.role);
        const data = await reminders_service_1.remindersService.listDoseRecords(id);
        res.status(200).json({ data });
    }
};
