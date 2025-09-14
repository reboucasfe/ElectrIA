import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in the environment variables.");
  console.error("Please ensure you have a .env file with the DATABASE_URL from your Supabase project.");
  process.exit(1); // Stop the server immediately if the URL is missing
}

import express from 'express';
import cors from 'cors';
import prisma from '../lib/prisma';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de teste para verificar a conexão com o banco de dados
app.get('/api/health', async (req, res) => {
  try {
    // Tenta fazer uma consulta simples para verificar se o Prisma consegue se conectar ao banco
    await prisma.$connect();
    res.status(200).json({ status: 'ok', message: 'API is running and connected to the database.' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to the database.' });
  } finally {
    await prisma.$disconnect();
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});