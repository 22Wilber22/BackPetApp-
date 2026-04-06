export interface PetModel {
  id: string;
  ownerId: string;
  usaVeterinaria: boolean;
  vetId: string | null;
  clinicId: string | null;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string | null;
  alergias: string | null;
  condicionesCronicas: string | null;
  fotoUrl: string | null;
  activo: boolean;
  archivedAt: string | null;
  deleteAfterAt: string | null;
  createdAt: string;
  updatedAt: string;
}
