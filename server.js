const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ══════════════════════════════
//  🔑 APNI API KEY YAHAN DALO
// ══════════════════════════════
const ANTHROPIC_API_KEY = 'sk-ant-YAHAN-APNI-KEY-DALO';
// ══════════════════════════════

const PORT = 3000;

const server = http.createServer((req, res) => {

  // CORS headers — sabke liye allow
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API PROXY ──
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });

      apiReq.on('error', (e) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });

      apiReq.write(body);
      apiReq.end();
    });
    return;
  }

  // ── STATIC FILES ──
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
  };
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found: ' + filePath);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   🔥 UnixDroid AI — Local Server     ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║   ✅ Server chal raha hai!            ║`);
  console.log(`║   🌐 http://localhost:${PORT}           ║`);
  console.log('║   ⛔ Band karne ke liye: Ctrl + C    ║');
  console.log('╚══════════════════════════════════════╝\n');
});
