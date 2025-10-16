// server_example.js
import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// (1) ROTA DE TESTE PÚBLICA (sem senha) — só para sabermos se o servidor está no ar
app.get("/health", (req, res) => {
  return res.json({ ok: true, message: "Welton Comms Actions API ✅" });
});

// (2) TUDO ABAIXO EXIGE TOKEN "Bearer welton-super-token"
app.use((req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ") || auth.split(" ")[1] !== process.env.API_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

// (3) ENDPOINTS (exemplos com dados de teste - "mock")
// Instagram
app.post("/social/instagram/fetch", async (req, res) => {
  const { username, limit = 10 } = req.body || {};
  if (!username) return res.status(400).json({ error: "missing_username" });

  return res.json({
    profile: {
      username,
      fullname: "Perfil Exemplo",
      profile_picture_url: "https://example.com/perfil.jpg",
      followers_count: 12345
    },
    posts: Array.from({ length: Math.min(limit, 10) }).map((_, i) => ({
      id: `post_${i+1}`,
      timestamp: new Date().toISOString(),
      permalink: "https://instagram.com/p/xyz",
      caption: "Legenda de exemplo",
      like_count: 100 + i,
      comments_count: 5 + i
    }))
  });
});

// Email
app.post("/email/send", (req, res) => {
  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) return res.status(400).json({ error: "missing_params" });
  return res.json({ message_id: "mock-123", status: "sent" });
});

// News
app.post("/news/search", (req, res) => {
  const { query = "" } = req.body || {};
  if (!query) return res.status(400).json({ error: "missing_query" });
  return res.json({
    articles: [
      {
        title: `Menção sobre ${query}`,
        source: "Portal X",
        url: "https://exemplo.com/noticia",
        publishedAt: new Date().toISOString(),
        description: "Resumo da notícia de exemplo."
      }
    ]
  });
});

app.listen(3000, () => console.log("Welton Comms Actions API rodando em :3000"));
