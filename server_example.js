// server_example.js
// Exemplo mínimo em Node.js (Express) para suportar as Ações do GPT.
// Substitua os TODOs pelas integrações reais (Instagram Graph, Google APIs, News API).

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

/* ------------------------------------------------------------------ */
/* 1) ROTA DE SAÚDE (SEM AUTENTICAÇÃO)                                */
/* ------------------------------------------------------------------ */
app.get("/", (req, res) => res.send("Welton Comms Actions API ✅"));

/* ------------------------------------------------------------------ */
/* 2) MIDDLEWARE DE AUTENTICAÇÃO (BEARER) – protege as rotas da API   */
/*    Obs.: a rota "/" acima fica livre para teste/Render.            */
/* ------------------------------------------------------------------ */
app.use((req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ") || auth.split(" ")[1] !== process.env.API_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

/* ------------------------------------------------------------------ */
/* 3) ROTAS PROTEGIDAS                                                */
/* ------------------------------------------------------------------ */

// 3.1) Instagram Business Discovery
app.post("/social/instagram/fetch", async (req, res) => {
  try {
    const { username, limit = 10 } = req.body;
    if (!username) return res.status(400).json({ error: "missing_username" });

    const IG_USER_ID = process.env.IG_USER_ID;
    const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      return res.status(500).json({ error: "instagram_credentials_missing" });
    }

    const fields = [
      "name","username","profile_picture_url","followers_count",
      `media.limit(${Math.min(limit, 50)}){id,caption,permalink,timestamp,like_count,comments_count}`
    ].join(",");

    const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}`;
    const params = {
      fields: `business_discovery.username(${username}){${fields}}`,
      access_token: IG_ACCESS_TOKEN,
    };

    const { data } = await axios.get(url, { params });
    const bd = data.business_discovery;
    if (!bd) return res.status(404).json({ error: "profile_not_accessible_or_no_media" });

    const posts = (bd.media?.data || []).map(p => ({
      id: p.id,
      timestamp: p.timestamp,
      permalink: p.permalink,
      caption: p.caption || "",
      like_count: p.like_count ?? null,
      comments_count: p.comments_count ?? null,
    }));

    return res.json({
      profile: {
        username: bd.username,
        fullname: bd.name || "",
        profile_picture_url: bd.profile_picture_url || "",
        followers_count: bd.followers_count ?? null,
      },
      posts
    });
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({ error: "meta_api_error", detail: err.response?.data || String(err) });
  }
});

// 3.2) Google Sheets append (mock)
app.post("/sheets/editorial/append", async (req, res) => {
  const { spreadsheet_id, sheet_name, rows } = req.body;
  if (!spreadsheet_id || !sheet_name || !rows) {
    return res.status(400).json({ error: "missing_params" });
  }
  // TODO: implementar chamada real ao Google Sheets API (spreadsheets.values.append)
  return res.json({
    updated_range: `${sheet_name}!A1:F${rows.length}`,
    web_link: `https://docs.google.com/spreadsheets/d/${spreadsheet_id}`
  });
});

// 3.3) Email send (mock)
app.post("/email/send", async (req, res) => {
  const { to, subject, html, attachments = [] } = req.body;
  if (!to || !subject || !html) return res.status(400).json({ error: "missing_params" });
  // TODO: integrar com Gmail API ou SMTP (Nodemailer)
  return res.json({ message_id: "mock-123", status: "sent" });
});

// 3.4) Drive upload (mock)
app.post("/drive/upload", async (req, res) => {
  const { filename, mime_type, file_base64, folder_id } = req.body;
  if (!filename || !mime_type || !file_base64) return res.status(400).json({ error: "missing_params" });
  // TODO: integrar com Google Drive API (files.create + permissions)
  return res.json({ file_id: "mock-file-id", webViewLink: "https://drive.google.com/file/d/mock-file-id/view" });
});

// 3.5) News search (mock)
app.post("/news/search", async (req, res) => {
  const { query, from, to, language = "pt" } = req.body;
  if (!query) return res.status(400).json({ error: "missing_query" });
  // TODO: integrar com NewsAPI ou Google Custom Search
  return res.json({
    articles: [
      { title: "Exemplo de menção pública", source: "Portal X", url: "https://...", publishedAt: "2025-10-21T00:00:00Z", description: "Resumo da notícia relacionada." }
    ]
  });
});

/* ------------------------------------------------------------------ */
/* 4) HANDLERS FINAIS                                                 */
/* ------------------------------------------------------------------ */
app.use((req, res) => res.status(404).json({ error: "not_found" }));

app.listen(3000, () => {
  console.log("Welton Comms Actions API rodando em :3000");
});
