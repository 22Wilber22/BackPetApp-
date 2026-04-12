export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface AppointmentModel {
  appointmentId: string;
  ownerId: string;
  petId: string;
  petName: string;
  ownerName: string;
  vetName: string;
  vetId: string;
  assistantIds: string[];
  clinicId: string;
  type: string;
  schedule: string;
  reason: string;
  symptoms: string | null;
  notes: string | null;
  channel: string | null;
  sendReminder: boolean;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}
