import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No autenticat' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      user: { id: payload.id, email: payload.email, name: payload.name }
    });
  } catch {
    return res.status(401).json({ error: 'Token invàlid o caducat' });
  }
}
