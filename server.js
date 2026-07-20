const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const port = Number(process.env.PORT) || 3000;
const projectDirectory = __dirname;
const auditFile = path.join(projectDirectory, 'save.txt');
const staticFiles = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/start-now.html', 'start-now.html'],
  ['/login-script.js', 'login-script.js'],
  ['/login-style.css', 'login-style.css'],
  ['/script.js', 'script.js'],
  ['/style.css', 'style.css']
]);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(body));
}

function cleanAuditValue(value) {
  return String(value).replace(/[\r\n|]/g, ' ').trim();
}

async function readRequestBody(request) {
  const chunks = [];
  let length = 0;

  for await (const chunk of request) {
    length += chunk.length;
    if (length > 10_000) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function appendAuditEntry(entry) {
  return fs.appendFile(auditFile, `${entry}\n`, 'utf8');
}

async function handleAuditRequest(request, response, pathname) {
  try {
    if (pathname === '/api/audit/register') {
      const { username, password } = await readRequestBody(request);
      const accountName = cleanAuditValue(username);
      const accountPassword = cleanAuditValue(password);

      if (!accountName || !accountPassword) {
        return sendJson(response, 400, { error: 'Username and password are required.' });
      }

      await appendAuditEntry(
        `[${new Date().toISOString()}] REGISTERED | Account: ${accountName} | Password: ${accountPassword}`
      );
      return sendJson(response, 201, { recorded: true });
    }

    if (pathname === '/api/audit/reset') {
      await appendAuditEntry(
        `[${new Date().toISOString()}] LOCAL STORAGE RESET — REGISTERED ACCOUNT LIST TERMINATED`
      );
      return sendJson(response, 201, { recorded: true });
    }

    return sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    return sendJson(response, 400, { error: error.message || 'Could not record audit entry.' });
  }
}

async function serveStaticFile(response, filename) {
  try {
    const content = await fs.readFile(path.join(projectDirectory, filename));
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filename)] || 'application/octet-stream'
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found.');
  }
}

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return response.end();
  }

  if (request.method === 'POST' && pathname.startsWith('/api/audit/')) {
    return handleAuditRequest(request, response, pathname);
  }

  if (request.method === 'GET' && staticFiles.has(pathname)) {
    return serveStaticFile(response, staticFiles.get(pathname));
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found.');
});

server.listen(port, () => {
  console.log(`STEMULAR portal running at http://localhost:${port}`);
});
