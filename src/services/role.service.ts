import { UserRole } from "../models/user.model";

export const isAdmin = (role: UserRole | undefined): boolean => role === "admin";

export const canAccessVetPatients = (
  actorRole: UserRole | undefined,
  actorUid: string,
  vetId: string,
  supervisorVetId: string | null | undefined
): boolean => {
  if (actorRole === "admin") {
    return true;
  }
  if (actorRole === "veterinario") {
    return actorUid === vetId;
  }
  if (actorRole === "asistente") {
    return supervisorVetId === vetId;
  }
  return false;
};
