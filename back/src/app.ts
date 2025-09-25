import express from 'express';
import cors from 'cors';
import classeRoutes from "./routes/task.router.js";
import authenticate from "./middlewares/auth.middleware.js";
import userRoutes from "./routes/user.router.js"
import path from "path";
import cookieParser from "cookie-parser";
export const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

// Servir les fichiers statiques AVANT toute auth pour éviter 401 et ORB
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes publiques utilisateurs
app.use("/api/users", userRoutes);

// Routes protégées
app.use(authenticate);
app.use("/api/tasks", classeRoutes);

export default app;