const fs = require('fs');

const routes = JSON.parse(fs.readFileSync('routes.json', 'utf8'));

// Build the ROUTES object string
const routeEntries = Object.entries(routes)
  .map(([k, v]) => `  ${k}: '${v}'`)
  .join(',\n');

// Build the regex pattern from route keys
const pattern = Object.keys(routes).join('|');

const routingCode = `const _path = window.location.pathname;
const ROUTES = {
${routeEntries},
};
const BASE_URL   = 'https://qfsmagastore.com/pages/xrp-gold-coins';
const _match     = _path.match(/\\/(${pattern})\\b/i);
const TARGET_URL = _match ? (ROUTES[_match[1].toUpperCase()] || BASE_URL) : BASE_URL;`;

let html = fs.readFileSync('template.html', 'utf8');
html = html.replace('/*__AFFILIATE_ROUTES__*/', routingCode);
fs.writeFileSync('index.html', html);

console.log('Build complete. Routes injected:', Object.keys(routes));
