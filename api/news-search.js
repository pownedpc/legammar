import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'No autenticat' });
  }

  const { topic } = req.body || {};
  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Falta el tema de cerca' });
  }

  try {
    // 1. Fetch news from GNews
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&token=${process.env.GNEWS_API_KEY}&lang=es&max=5&sortby=publishedAt`;
    const newsRes = await fetch(gnewsUrl);
    const newsData = await newsRes.json();

    if (!newsRes.ok) {
      return res.status(502).json({ error: 'Error en la cerca de notícies: ' + (newsData.errors?.[0] || 'GNews error') });
    }

    const articles = (newsData.articles || []).map(a => ({
      title: a.title,
      description: a.description || '',
      url: a.url,
      publishedAt: a.publishedAt,
      source: a.source?.name || ''
    }));

    if (articles.length === 0) {
      return res.status(200).json({ articles: [], summary: 'No s\'han trobat notícies per aquest tema.' });
    }

    // 2. Generate summary with OpenAI (optional — if quota exceeded, articles still return)
    let summary = '';
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const articleText = articles
        .map((a, i) => `${i + 1}. ${a.title}${a.description ? ': ' + a.description : ''}`)
        .join('\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ets un periodista concís. A partir de les notícies proporcionades, redacta un resum breu i informatiu (màxim 4 frases). Usa la mateixa llengua del tema de cerca. No uses markdown ni llistes.'
          },
          {
            role: 'user',
            content: `Tema: ${topic}\n\nNotícies:\n${articleText}`
          }
        ],
        max_tokens: 300,
        temperature: 0.6
      });
      summary = completion.choices[0]?.message?.content?.trim() || '';
    } catch (aiErr) {
      summary = '';
    }

    // 3. Save to Neon DB
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO news_history (user_id, topic, summary, articles)
      VALUES (${user.id}, ${topic.trim()}, ${summary}, ${JSON.stringify(articles)})
    `;

    return res.status(200).json({ articles, summary });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor: ' + err.message });
  }
}
