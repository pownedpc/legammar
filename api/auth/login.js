import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email i contrasenya obligatoris' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credencials incorrectes' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor: ' + err.message });
  }
}
