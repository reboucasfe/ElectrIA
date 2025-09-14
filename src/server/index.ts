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