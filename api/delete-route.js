export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, route } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  if (!route) return res.status(400).json({ error: 'Route is required' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'nikolan17/xrp-gold-tokens';
  const FILE = 'routes.json';
  const API  = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

  const getRes = await fetch(API, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  });
  const fileData = await getRes.json();
  const current = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

  delete current[route.toUpperCase()];

  const putRes = await fetch(API, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Remove affiliate route /${route.toUpperCase()}`,
      content: Buffer.from(JSON.stringify(current, null, 2)).toString('base64'),
      sha: fileData.sha,
    }),
  });

  if (!putRes.ok) return res.status(500).json({ error: 'GitHub update failed' });
  return res.status(200).json({ success: true, routes: current });
}
