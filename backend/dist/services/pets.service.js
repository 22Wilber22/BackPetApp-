"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.petsService = void 0;
const firebase_1 = require("../config/firebase");
const time_1 = require("../utils/time");
const users_service_1 = require("./users.service");
const petsCollection = firebase_1.firestoreDb.collection("pets");
const mapDoc = (doc) => ({
    id: doc.id,
    ...doc.data()
});
exports.petsService = {
    async create(ownerId, data) {
        const now = (0, time_1.nowIso)();
        const petRef = petsCollection.doc();
        const pet = {
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
        await users_service_1.usersService.setHasPet(ownerId, true);
        return pet;
    },
    async listByOwner(ownerId) {
        const query = await petsCollection.where("ownerId", "==", ownerId).where("activo", "==", true).get();
        return query.docs.map(mapDoc);
    },
    async getById(id) {
        const doc = await petsCollection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return mapDoc(doc);
    },
    async deactivate(id) {
        const pet = await this.getById(id);
        if (!pet) {
            return null;
        }
        const archivedAt = (0, time_1.nowIso)();
        const deleteAfter = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
        await petsCollection.doc(id).set({
            activo: false,
            archivedAt,
            deleteAfterAt: deleteAfter,
            updatedAt: (0, time_1.nowIso)()
        }, { merge: true });
        const ownerPets = await petsCollection.where("ownerId", "==", pet.ownerId).where("activo", "==", true).get();
        if (ownerPets.empty) {
            await users_service_1.usersService.setHasPet(pet.ownerId, false);
        }
        return this.getById(id);
    },
    async assignVet(id, vetId, clinicId) {
        await petsCollection.doc(id).set({
            usaVeterinaria: true,
            vetId,
            clinicId: clinicId ?? null,
            updatedAt: (0, time_1.nowIso)()
        }, { merge: true });
        return this.getById(id);
    },
    async unassignVet(id) {
        await petsCollection.doc(id).set({
            usaVeterinaria: false,
            vetId: null,
            clinicId: null,
            updatedAt: (0, time_1.nowIso)()
        }, { merge: true });
        return this.getById(id);
    },
    async listArchivedByOwner(ownerId) {
        const query = await petsCollection
            .where("ownerId", "==", ownerId)
            .where("activo", "==", false)
            .get();
        return query.docs.map(mapDoc);
    },
    async reactivate(id) {
        const pet = await this.getById(id);
        if (!pet)
            return null;
        await petsCollection.doc(id).set({
            activo: true,
            archivedAt: null,
            deleteAfterAt: null,
            updatedAt: (0, time_1.nowIso)()
        }, { merge: true });
        await users_service_1.usersService.setHasPet(pet.ownerId, true);
        return this.getById(id);
    }
};
