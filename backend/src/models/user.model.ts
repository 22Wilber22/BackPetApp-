export type UserRole = "admin" | "jefe" | "veterinario" | "recepcionista" | "asistente" | "usuario";

export interface UserModel {
  uid: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  role: UserRole;
  clinicId: string | null;
  supervisorVetId: string | null;
  tieneMascota: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
