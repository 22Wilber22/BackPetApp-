"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindersController = void 0;
const reminders_service_1 = require("../services/reminders.service");
exports.remindersController = {
    create: async (req, res) => {
        const data = await reminders_service_1.remindersService.create(req.body);
        res.status(201).json({ data });
    },
    listByPet: async (req, res) => {
        const petId = String(req.params.petId);
        const data = await reminders_service_1.remindersService.listByPet(petId);
        res.status(200).json({ data });
    },
    patch: async (req, res) => {
        const id = String(req.params.id);
        const data = await reminders_service_1.remindersService.update(id, req.body);
        res.status(200).json({ data });
    },
    remove: async (req, res) => {
        const id = String(req.params.id);
        await reminders_service_1.remindersService.remove(id);
        res.status(200).json({ data: { deleted: true } });
    },
    addDoseRecord: async (req, res) => {
        const id = String(req.params.id);
        const data = await reminders_service_1.remindersService.addDoseRecord(id, req.body);
        res.status(201).json({ data });
    },
    listDoseRecords: async (req, res) => {
        const id = String(req.params.id);
        const data = await reminders_service_1.remindersService.listDoseRecords(id);
        res.status(200).json({ data });
    }
};
