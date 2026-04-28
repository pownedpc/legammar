import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'No autenticat' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const history = await sql`
      SELECT id, topic, summary, articles, created_at
      FROM news_history
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 30
    `;
    return res.status(200).json({ history });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor: ' + err.message });
  }
}
