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

// Página inicial
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));

// Rota amigável para a política de privacidade
app.get('/politica-de-privacidade', (_req, res) =>
  res.sendFile(path.join(ROOT, 'politica-de-privacidade.html'))
);

app.listen(PORT, () => {
  console.log(`\n  Site no ar em: http://localhost:${PORT}\n`);
});
