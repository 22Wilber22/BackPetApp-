import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { requestIdMiddleware } from "./utils/request-id";
import { logger } from "./utils/logger";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { usersRouter } from "./routes/users.routes";
import { petsRouter } from "./routes/pets.routes";
import { vetsRouter } from "./routes/vets.routes";
import { clinicsRouter } from "./routes/clinics.routes";
import { appointmentsRouter } from "./routes/appointments.routes";
import { remindersRouter } from "./routes/reminders.routes";
import { staffRouter } from "./routes/staff.routes";
import { patientsRouter } from "./routes/patients.routes";
import { reportsRouter } from "./routes/reports.routes";
import { uploadsRouter } from "./routes/uploads.routes";
import { databaseBurstGuard } from "./middlewares/rate-limit.middleware";

export const app = express();

app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url };
      }
    }
  })
);
app.use(helmet());
app.use((_, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.FRONTEND_ORIGIN_LIST.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin denied"));
    }
  })
);
// DEBUG TEMPORAL: loguear tamaño del body entrante para diagnosticar 413
app.use((req, _res, next) => {
  const cl = req.headers['content-length'];
  const ct = req.headers['content-type'];
  if (cl && Number(cl) > 50_000) {
    logger.warn({ method: req.method, url: req.url, contentLength: cl, contentType: ct }, "⚠️ LARGE REQUEST BODY DETECTED");
  }
  next();
});

// JSON bodies son solo datos — las imágenes van por multer en /uploads.
// 10mb temporalmente para diagnosticar — reducir una vez confirmado el flujo correcto.
app.use(express.json({ limit: "10mb" }));

// fotoUrl length is now validated per-route via Zod (createPetSchema: fotoUrl.max(2048))
// No global middleware needed here — Zod returns a clear 422 with the validation error.

// Keep a hard cap on concurrent DB-heavy requests so Firestore does not get flooded.
app.use(databaseBurstGuard);

app.use(healthRouter);
app.use(authRouter);
app.use(usersRouter);
app.use(petsRouter);
app.use(vetsRouter);
app.use(clinicsRouter);
app.use(appointmentsRouter);
app.use(remindersRouter);
app.use(staffRouter);
app.use(patientsRouter);
app.use(reportsRouter);
app.use(uploadsRouter);

app.use(errorHandler);
