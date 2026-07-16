/* ══════════════════════════════════════════════════════════════
   Servidor Node.js (Express) — Site Dr. Luiz Fernando Lorenci
   ------------------------------------------------------------------
   Serve o site estático. Não há banco de dados nem build.
   Rodar:  npm install  &&  npm start
   Porta:  variável de ambiente PORT (padrão 3000)
   ══════════════════════════════════════════════════════════════ */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Arquivos .jsx (motor dos vídeos) precisam de content-type de JS
express.static.mime.define({ 'application/javascript': ['jsx'] });

// Servir todos os arquivos do projeto (index.html, .dc.html, .jsx, assets/…)
app.use(
  express.static(ROOT, {
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (filePath.endsWith('.jsx')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    },
  })
);

// ── Proxy somente-leitura para a API do agendamento ─────────────
// Permite que o painel unificado (/admin) mostre pedidos e pagamentos
// sem CORS: o navegador chama /api/agendamento/* neste domínio e o
// servidor repassa para a API real, incluindo o token Bearer digitado
// pelo admin. Apenas os dois endpoints de leitura do dashboard são
// repassados — nada de escrita passa por aqui.
const AGENDAMENTO_API_URL = (process.env.AGENDAMENTO_API_URL || 'https://agendamento.clinicalorenci.com.br').replace(/\/$/, '');
const PROXY_ALLOWED = ['/admin/logs', '/admin/logs/summary'];

// Limite simples por IP (30 req/min) — impede que o proxy vire oráculo de
// força-bruta do ADMIN_TOKEN. Sem dependências: janela fixa em memória.
const proxyHits = new Map();
function proxyRateLimited(ip) {
  const now = Date.now();
  const slot = proxyHits.get(ip);
  if (!slot || now > slot.resetAt) {
    proxyHits.set(ip, { count: 1, resetAt: now + 60000 });
    if (proxyHits.size > 5000) proxyHits.clear(); // teto de memória
    return false;
  }
  slot.count += 1;
  return slot.count > 30;
}

app.get('/api/agendamento/*', async (req, res) => {
  const subPath = req.path.replace('/api/agendamento', '');
  if (!PROXY_ALLOWED.includes(subPath)) {
    return res.status(404).json({ error: 'Endpoint não disponível no proxy.' });
  }
  if (proxyRateLimited(req.ip || 'desconhecido')) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde um minuto.' });
  }
  try {
    const upstream = await fetch(`${AGENDAMENTO_API_URL}/api${subPath}`, {
      headers: { Authorization: req.headers.authorization || '' },
      signal: AbortSignal.timeout(10000),
    });
    const body = await upstream.text();
    res.status(upstream.status)
      .type(upstream.headers.get('content-type') || 'application/json')
      .send(body);
  } catch (err) {
    console.error('[Proxy agendamento]', err.message);
    res.status(502).json({
      error: 'Não foi possível falar com o sistema de agendamento. Verifique se ele está no ar.',
    });
  }
});

// Página inicial
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));

// Rota amigável para a política de privacidade
app.get('/politica-de-privacidade', (_req, res) =>
  res.sendFile(path.join(ROOT, 'politica-de-privacidade.html'))
);

app.listen(PORT, () => {
  console.log(`\n  Site no ar em: http://localhost:${PORT}\n`);
});
