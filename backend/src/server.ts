import http from 'http';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { testConnection } from "./config/database";
import swaggerSpec from "./config/swagger";
import { errorHandler, notFound } from "./middleware/error.middleware";
import adminRoutes from "./routes/admin.routes";
import adminApplicationRoutes from "./routes/admin-application.routes";
import adminNotificationRoutes from "./routes/admin-notification.routes";
import adminReportRoutes from "./routes/admin-report.routes";
import admissionCombinationRoutes from "./routes/admissionCombination.routes";
import authRoutes from "./routes/auth.routes";
import candidateRoutes from "./routes/candidate.routes";
import candidateProfileRoutes from "./routes/candidate-profile.routes";
import combinationRoutes from "./routes/combination.routes";
import combinationAssignmentRoutes from "./routes/combinationAssignment.routes";
import universityRoutes from "./routes/university.routes";
import userRoutes from "./routes/user.routes";
import path from 'path';
import { initSocket } from "./socket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files locally
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/universities", universityRoutes);
app.use(
  "/api/universities/:universityCode/majors/:majorCode/combinations",
  admissionCombinationRoutes,
);
app.use(
  "/api/universities/:universityCode/majors/:majorCode/assigned-combinations",
  combinationAssignmentRoutes,
);
app.use("/api/combinations", combinationRoutes);
app.use("/api/candidate", candidateProfileRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/applications", adminApplicationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/admin/reports", adminReportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start
const start = async (): Promise<void> => {
  await testConnection();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

start();

export default app;
