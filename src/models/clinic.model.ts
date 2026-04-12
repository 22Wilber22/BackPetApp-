export interface ClinicModel {
  clinicId: string;
  jefeId: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  geo: { lat: number; lng: number } | null;
  activo: boolean;
  createdAt: string;
}
