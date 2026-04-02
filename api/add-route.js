export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, route, url } = req.body;

  // Auth check
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  // Validate
  if (!route || !url) return res.status(400).json({ error: 'Route and URL are required' });
  if (!/^[A-Z0-9]+$/i.test(route)) return res.status(400).json({ error: 'Route must be letters/numbers only' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'nikolan17/xrp-gold-tokens';
  const FILE = 'routes.json';
  const API  = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

  // Get current routes.json
  const getRes = await fetch(API, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  });
  const fileData = await getRes.json();
  const current = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

  // Add / update route
  current[route.toUpperCase()] = url;

  // Push back to GitHub
  const putRes = await fetch(API, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add affiliate route /${route.toUpperCase()}`,
      content: Buffer.from(JSON.stringify(current, null, 2)).toString('base64'),
      sha: fileData.sha,
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    return res.status(500).json({ error: 'GitHub update failed', detail: err });
  }

  return res.status(200).json({ success: true, routes: current });
}
