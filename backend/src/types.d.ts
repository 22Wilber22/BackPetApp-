import { DecodedIdToken } from "firebase-admin/auth";
import { UserRole } from "./models/user.model";

type AuthUser = DecodedIdToken & {
  role?: UserRole;
  clinicId?: string | null;
  supervisorVetId?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: AuthUser;
    }
  }
}

export {};
