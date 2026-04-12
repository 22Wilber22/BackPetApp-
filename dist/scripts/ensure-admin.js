"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const email = process.env.ADMIN_EMAIL ?? "admin@petapp.local";
const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
const nombres = process.env.ADMIN_NOMBRES ?? "Admin";
const apellidos = process.env.ADMIN_APELLIDOS ?? "Backup";
async function ensureAdmin() {
    let user;
    try {
        user = await firebase_1.adminAuth.getUserByEmail(email);
        console.log("Usuario ya existia:", user.uid);
    }
    catch {
        user = await firebase_1.adminAuth.createUser({
            email,
            password,
            displayName: `${nombres} ${apellidos}`
        });
        console.log("Usuario creado:", user.uid);
    }
    await firebase_1.adminAuth.setCustomUserClaims(user.uid, { role: "admin" });
    const now = new Date().toISOString();
    await firebase_1.firestoreDb.collection("users").doc(user.uid).set({
        uid: user.uid,
        email,
        nombres,
        apellidos,
        telefono: null,
        role: "admin",
        clinicId: null,
        supervisorVetId: null,
        tieneMascota: false,
        activo: true,
        createdAt: now,
        updatedAt: now
    }, { merge: true });
    const updated = await firebase_1.adminAuth.getUser(user.uid);
    console.log(JSON.stringify({
        uid: user.uid,
        email,
        role: "admin",
        customClaims: updated.customClaims ?? {}
    }, null, 2));
}
ensureAdmin().catch((error) => {
    console.error("Error asegurando admin:", error);
    process.exit(1);
});
