import { adminAuth } from "../config/firebase";
import { UserModel, UserRole } from "../models/user.model";
import { usersService } from "./users.service";

const buildDefaultUser = (uid: string, email: string, nombres: string, apellidos: string): Omit<UserModel, "createdAt" | "updatedAt"> => ({
  uid,
  email,
  nombres,
  apellidos,
  telefono: null,
  role: "usuario",
  clinicId: null,
  supervisorVetId: null,
  tieneMascota: false,
  activo: true
});

export const authService = {
  async syncClaims(uid: string): Promise<void> {
    const user = await usersService.getByUid(uid);
    if (!user) {
      return;
    }

    await adminAuth.setCustomUserClaims(uid, {
      role: user.role,
      clinicId: user.clinicId,
      supervisorVetId: user.supervisorVetId
    });
  },

  async registerWithEmail(payload: { email: string; password: string; nombres: string; apellidos: string; telefono?: string | null }) {
    const userRecord = await adminAuth.createUser({
      email: payload.email,
      password: payload.password,
      displayName: `${payload.nombres} ${payload.apellidos}`
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: "usuario",
      clinicId: null,
      supervisorVetId: null
    });

    const user = await usersService.create({
      ...buildDefaultUser(userRecord.uid, payload.email, payload.nombres, payload.apellidos),
      telefono: payload.telefono ?? null
    });

    return user;
  },

  async upsertProviderUser(idToken: string) {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? "";
    const names = (decoded.name ?? "").split(" ");
    const nombres = names[0] ?? "Usuario";
    const apellidos = names.slice(1).join(" ") || "PetApp";

    const existing = await usersService.getByUid(uid);
    if (!existing) {
      await usersService.create(buildDefaultUser(uid, email, nombres, apellidos));
      await adminAuth.setCustomUserClaims(uid, {
        role: "usuario",
        clinicId: null,
        supervisorVetId: null
      });
    }

    return usersService.getByUid(uid);
  },

  async me(uid: string): Promise<UserModel | null> {
    return usersService.getByUid(uid);
  },

  async logout(uid: string): Promise<void> {
    await adminAuth.revokeRefreshTokens(uid);
  },

  async setRole(uid: string, role: UserRole, clinicId?: string | null): Promise<void> {
    await usersService.updateRole(uid, role, clinicId);
    await this.syncClaims(uid);
  }
};
