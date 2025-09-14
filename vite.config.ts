import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import express from "express";
import { prisma } from "./src/lib/prisma";

// Plugin customizado para criar um endpoint de API para testar a conexão com o banco de dados
function apiPlugin() {
  const app = express();

  app.get("/api/test-connection", async (_req, res) => {
    try {
      await prisma.$connect();
      res.status(200).json({ message: "Conexão com o banco de dados bem-sucedida!" });
    } catch (error) {
      console.error("Falha na conexão com o banco de dados:", error);
      res.status(500).json({ message: "Falha na conexão com o banco de dados.", error: error.message });
    } finally {
      await prisma.$disconnect();
    }
  });

  return {
    name: "api-plugin",
    configureServer(server) {
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));