import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';

const app: Application = express();

// 1. Middlewares
app.use(helmet()); // Security headers
app.use(cors({
  origin: 'http://localhost:5000', // Your React Frontend URL (adjust later)
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// 2. Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Atom Drops Backend is running correctly' 
  });
});


// Mount Modules
app.use('/api/v1/auth', authRoutes);

export default app;