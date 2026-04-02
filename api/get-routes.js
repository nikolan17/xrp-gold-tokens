export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const API = `https://api.github.com/repos/nikolan17/xrp-gold-tokens/contents/routes.json`;

  const getRes = await fetch(API, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  });
  const fileData = await getRes.json();
  const routes = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

  return res.status(200).json({ routes });
}
