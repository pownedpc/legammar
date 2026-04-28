const ALLOWED = /^(search\/movie|movie\/\d+)$/;

export default async function handler(req, res) {
  const { path, ...params } = req.query;

  if (!path || !ALLOWED.test(path)) {
    return res.status(400).json({ error: 'Invalid TMDB path' });
  }

  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}` }
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
