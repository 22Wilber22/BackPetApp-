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
app.use(express.json({ limit: "50kb" }));

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

app.use(errorHandler);
