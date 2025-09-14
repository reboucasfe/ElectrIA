import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import prisma from '../lib/prisma';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check route to verify database connection
app.get('/api/health', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    const errorMessage = "Server-side error: DATABASE_URL is not defined. Please create a .env file in your project's root directory and add your Supabase connection string to it.";
    console.error(errorMessage);
    return res.status(500).json({ status: 'error', message: errorMessage });
  }

  try {
    await prisma.$connect();
    res.status(200).json({ status: 'ok', message: 'API is running and successfully connected to the database.' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to the database. Please verify your DATABASE_URL in the .env file is correct.' });
  } finally {
    await prisma.$disconnect();
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  if (!process.env.DATABASE_URL) {
    console.warn('[server]: WARNING - DATABASE_URL environment variable is not set.');
    console.warn('[server]: Please create a .env file and add your DATABASE_URL to it.');
  }
});