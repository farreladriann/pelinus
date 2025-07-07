// src/app.ts

import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import bodyParser from 'body-parser';
import morgan from 'morgan';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import connectDB from './config/connectDB';
import helmet from 'helmet';
import kelasRoutes from './routes/kelasRoutes';
import pelajaranRoutes from './routes/pelajaranRoutes';
// Ensure that the environment variables are loaded

const PORT = process.env.PORT || 3500;
const app: Application = express();

connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/kelas', kelasRoutes)
app.use('/pelajaran', pelajaranRoutes)

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createHttpError(404, 'Not Found'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof createHttpError.HttpError) {
    const httpError = err as createHttpError.HttpError;
    res.status(httpError.status).json({ message: httpError.message });
  } else {
    console.error(err);
    res.status(500).json({
      message: err.message.length > 40 ? 'Internal Server Error' : err.message,
    });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.once('SIGUSR2', function () {
  shutdown().then(() => {
    // Sending SIGUSR2 to the process again to allow nodemon to restart it
    process.kill(process.pid, 'SIGUSR2');
  });
});

// Start the server after MongoDB connection is open
mongoose.connection.on('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

mongoose.connection.on('error', (error: Error) => {
  console.error('MongoDB connection error:', error);
});

async function shutdown() {
  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}