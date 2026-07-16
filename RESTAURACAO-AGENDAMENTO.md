# Restauração e mapa do sistema — Site + Agendamento + Pagamento

> Documento de **operação** (runbook). Explica como as peças se conectam e
> como restaurar o que quebrou. **Não contém senhas nem tokens** — os valores
> reais ficam apenas no backup privado (`.env.producao.REAL`) e no painel do
> Coolify. Nunca commite segredos aqui.

## 1. Existem DOIS sistemas separados

| Sistema | O que é | Onde roda | Endereço |
|---|---|---|---|
| **Site / Landing** (este repositório) | HTML/CSS/JS estático, sem build | Hostinger **hospedagem compartilhada** | `clinicalorenci.com.br` |
| **Agendamento + Pagamento** (backup `.zip` separado) | Node.js/Express + MySQL | Hostinger **VPS** (IP `76.13.169.14`) via **Coolify** | `agendamento.clinicalorenci.com.br` |

O site apenas **linka** para o agendamento — os botões "Agendar Consulta"
apontam para `https://agendamento.clinicalorenci.com.br`. O código de
agendamento **não** faz parte deste repositório (e não deve: ele tem banco de
dados e segredos, e a hospedagem compartilhada não roda Node).

## 2. Sintomas recentes e causas (pós-upload na Hostinger)

| Sintoma | Causa | Correção |
|---|---|---|
| Acentos "estranhos" na home | `index.html` (export do Base44) não declarava `charset` cedo no `<head>`; a Hostinger não forçava UTF-8 | `<meta charset="utf-8">` no topo do `index.html` + `AddDefaultCharset UTF-8` no `.htaccess` ✅ |
| Subpáginas "somem" ao abrir sem `.html` | O `server.js` (Express) criava URLs amigáveis; na hospedagem estática isso não existe sozinho | Regra de reescrita no `.htaccess` (serve `pagina.html` quando pedem `/pagina`) ✅ |
| Vídeos não rodam | Arquivos `.jsx` servidos com tipo errado pela Hostinger | `AddType application/javascript .jsx` no `.htaccess` ✅ |
| Painel admin "perdido" | Nada foi apagado — o admin fica em `/admin.html` (não há link para ele na home, é proposital) | Acesse direto: `clinicalorenci.com.br/admin.html` (ou `/admin`) |
| Link de agendamento não abre | O subdomínio `agendamento.clinicalorenci.com.br` **não resolve no DNS** | Ver seção 4 (infra no VPS/Coolify) |

> **Ao subir os arquivos na Hostinger, inclua o `.htaccess`** — ele é um
> arquivo oculto (começa com ponto). No Gerenciador de Arquivos, ative
> "Mostrar arquivos ocultos" antes de enviar, senão ele fica de fora e as
> correções acima não valem.

## 3. Site estático (este repo) — publicar na Hostinger

1. Enviar **todos** os arquivos para a pasta pública (`public_html`),
   mantendo a estrutura de pastas (`assets/` junto).
2. Garantir que o **`.htaccess`** (oculto) foi enviado para a mesma pasta.
3. `index.html` é a página inicial. Subpáginas: `politica-de-privacidade.html`,
   `admin.html`.
4. Para trocar o destino dos botões "Agendar Consulta", procure
   `agendamento.clinicalorenci.com.br` no `index.html`.

## 3.1 Deploy do site na VPS/Coolify (caminho escolhido — tudo num lugar só)

Decisão: rodar o **site também na VPS**, ao lado do agendamento, com deploy
automático por git (acaba o upload manual — que foi a origem dos bugs de
acento/subpáginas/vídeos). O repositório já está pronto: tem `server.js`
(Express), `Dockerfile` e `package.json`. O `server.js` serve tudo com charset
UTF-8, MIME correto de `.jsx` e URLs amigáveis (`/admin`,
`/politica-de-privacidade`) — verificado.

**Passos no Coolify (VPS `76.13.169.14`):**

1. **New Resource → Application** → origem: repositório GitHub
   `lorencifernando-coder/clinicalorenci`, branch `main`
   (depois de o PR ser mergeado).
2. **Build Pack: Dockerfile** (o Coolify detecta o `Dockerfile` na raiz).
3. **Porta: 3000** (o `EXPOSE` do Dockerfile). O Coolify injeta a env `PORT`;
   o `server.js` a respeita.
4. **Deploy** e teste primeiro pela **URL temporária do Coolify**
   (`*.sslip.io`) — confirme home, `/admin`, `/politica-de-privacidade` e os
   vídeos.
5. **Domínio:** adicione `clinicalorenci.com.br` e `www.clinicalorenci.com.br`
   no app; deixe o Coolify emitir o **SSL** (Traefik/Let's Encrypt).
6. **DNS:** aponte o registro **A** de `clinicalorenci.com.br` (e `www`) para
   **`76.13.169.14`**. Hoje eles apontam para a hospedagem compartilhada —
   troque **só depois** que o app estiver testado no Coolify (evita site fora
   do ar). Propagação pode levar alguns minutos/horas.
7. **Auto-deploy:** ative o webhook do GitHub no app do Coolify para que cada
   `git push` na `main` redeploye sozinho.

> Depois disso, a hospedagem compartilhada deixa de servir o site. O
> `.htaccess` continua no repositório (ignorado pelo Node) — só volta a valer
> se um dia você reusar a hospedagem estática.

## 4. Restaurar o subdomínio de agendamento (VPS + Coolify)

O link não abre porque o subdomínio não está resolvendo. Verifique nesta ordem:

1. **DNS:** no provedor do domínio, deve existir um registro
   `agendamento` do tipo **A** apontando para **`76.13.169.14`**
   (ou CNAME conforme o setup do Coolify). Teste: `nslookup agendamento.clinicalorenci.com.br`.
2. **VPS ligado:** a VPS Hostinger precisa estar ativa e o **Coolify** rodando.
3. **App no Coolify:** o app `agendamento` (UUID `i8y6wgnrtq76g6m7b8wfk7s9`)
   deve estar **deployado e "running"**, com o domínio
   `agendamento.clinicalorenci.com.br` configurado e **SSL** emitido (Traefik).
4. **Banco:** container MySQL do Coolify ativo; app conectando (variáveis
   `DB_*`).
5. **Variáveis de ambiente** copiadas do backup para o Coolify (ver seção 5).

Recuperação do zero (disaster recovery) está detalhada no `LEIA-ME_INSTRUCOES.md`
que acompanha o backup do agendamento.

## 5. Checagem de configuração do pagamento (Mercado Pago)

Ponto de atenção encontrado na conferência do backup:

- **`MP_WEBHOOK_SECRET` estava ausente** no `.env.producao.REAL`. O webhook
  (`routes/mp-webhook.js`) **rejeita com 401** qualquer notificação quando esse
  segredo não está definido (`validateWebhookSignature` retorna `false` sem o
  segredo). Efeito: o Mercado Pago cobra, mas o pedido **nunca vira `paid`** e
  o Google Meet não é confirmado — fica preso em `pending`.
- **Ação:** confirmar no painel do Coolify se `MP_WEBHOOK_SECRET` está setado
  (o mesmo valor cadastrado em *Suas integrações → Webhooks* no painel do
  Mercado Pago). Se não estiver, adicioná-lo e redeployar.

Outras variáveis que o código usa e devem existir no Coolify:
`SITE_URL` (= `https://agendamento.clinicalorenci.com.br`, sem barra final),
`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_CLIENT_ID`, `MP_CLIENT_SECRET`,
`MP_WEBHOOK_SECRET`, `MEET_FUNCTION_URL`, `AGENDAMENTO_SHARED_SECRET`,
`OUTBOUND_WEBHOOKS`, e as `DB_*`.

Se `SITE_URL` estiver errado, o `back_urls` (retorno após pagar) e o
`notification_url` (`${SITE_URL}/api/mp-webhook`) do Mercado Pago apontam para
o lugar errado — pagamentos não confirmam.

## 6. Fluxo de pagamento (resumo, para diagnóstico)

1. Paciente preenche o formulário → `POST /api/create-order` (valida CPF,
   evita overbooking, grava `clients/consultations/orders/appointments`).
2. Google Calendar + Meet criados **na hora**, marcados "[AGUARDANDO PAGAMENTO]".
3. Gera link **Checkout Pro** do Mercado Pago (só PIX/Crédito/Débito, até 3x
   sem juros). Falhou? Pedido vira `manual_review` — agendamento e Meet já
   existem, nada se perde.
4. Mercado Pago confirma via `POST /api/mp-webhook` (valida assinatura, rebusca
   o pagamento na API, idempotência). Aprovado → pedido `paid` + evento do
   Calendar confirmado.

Status possíveis do pedido: `pending`, `paid`, `manual_review`.

## 7. Os DOIS painéis de admin (não são o mesmo, nem têm a mesma senha)

Hoje **não** existe um admin único. São dois, em domínios diferentes:

| Painel | Endereço | O que faz | Senha |
|---|---|---|---|
| **Admin do site** | `clinicalorenci.com.br/admin.html` | Só edita conteúdo: frases da animação "A Jornada" e o texto da Política de Privacidade. Gera um `content.js` para baixar. Roda 100% no navegador. | **Nenhuma.** Não tem login — qualquer pessoa com o link abre. |
| **Admin do agendamento** | `agendamento.clinicalorenci.com.br` (painel em `public/admin/`) | Dashboard de pedidos/pagamentos: logs (`/api/admin/logs`) e resumo (`/api/admin/logs/summary`). | **`ADMIN_TOKEN`** (token Bearer). O login pede "Token de Acesso"; também aceita `?token=...` na URL. |

**Qual é a senha do admin de agendamento?** É o valor de `ADMIN_TOKEN`.
**Esse valor NÃO está no backup** (`.env.producao.REAL` não o contém) — ele
existe apenas nas variáveis de ambiente do app no **Coolify**. Para descobrir:
abra o app `agendamento` no Coolify → *Environment Variables* → `ADMIN_TOKEN`.
Se não existir lá, o painel responde `500 ADMIN_TOKEN não configurado` — nesse
caso, crie um valor forte, salve e redeploy; esse passa a ser a senha.

> ⚠️ **Não dá para "condensar" o dashboard de pedidos/pagamentos dentro de
> `clinicalorenci.com.br/admin`.** Aquele admin do site é estático (sem
> servidor); o dashboard de pedidos precisa da API com banco de dados, que só
> roda no VPS (agendamento). Dá para *unificar o visual* (uma página que
> aponta para a API do agendamento via CORS), mas é uma mudança de arquitetura
> — decidir antes de fazer.

## 8. Inventário de APIs e segredos (o que o código usa × o que veio no backup)

Cruzamento entre `process.env.*` no código e as chaves do `.env.producao.REAL`.
**Valores reais não ficam aqui** — só os nomes e para que servem.

### Presentes no backup e em uso ✅
`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (MySQL) · `MP_ACCESS_TOKEN`
(Mercado Pago — Checkout Pro) · `SITE_URL` · `MEET_FUNCTION_URL` +
`AGENDAMENTO_SHARED_SECRET` (Google Meet/Calendar via função externa) ·
`OUTBOUND_WEBHOOKS` · `CONSULTATION_*`, `BOOKING_*`, `DISCOUNT_AMOUNT`,
`PAYMENT_WINDOW_HOURS`, `PORT`, `NODE_ENV`.

### Usados pelo código mas AUSENTES no backup ❌ (conferir/definir no Coolify)
| Variável | Para que serve | Efeito se faltar |
|---|---|---|
| `MP_WEBHOOK_SECRET` | Valida a assinatura do webhook do Mercado Pago | Webhook rejeita **tudo com 401** → pedido nunca vira `paid` |
| `ADMIN_TOKEN` | Senha do painel admin do agendamento | Login impossível; API responde `500` |
| `DRIVE_FUNCTION_URL` | Upload dos arquivos do paciente (exames/docs) para o Google Drive | Upload de arquivos falha |
| `MEET_UPDATE_FUNCTION_URL` | (Opcional) confirmar/atualizar o evento do Meet | Pode ser a mesma `MEET_FUNCTION_URL` com `?action=update` |

### Presentes no backup mas não referenciados pelo código atual (reserva)
`MP_PUBLIC_KEY`, `MP_CLIENT_ID`, `MP_CLIENT_SECRET` — úteis para SDK no
navegador / OAuth; o fluxo atual (Checkout Pro server-side) usa só o
`MP_ACCESS_TOKEN`.

### Contas/integrações externas que exigem credencial própria
- **Mercado Pago** — conta de produção *LFL CUIDADO E SAUDE LTDA*
  (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` no painel de Webhooks).
- **Google Calendar/Meet e Drive** — conta de serviço Google, via funções
  externas (`MEET_FUNCTION_URL`, `DRIVE_FUNCTION_URL`) autenticadas por
  `AGENDAMENTO_SHARED_SECRET`.
- **MySQL** — usuário/senha do banco do Coolify (`DB_*`).

> ⚠️ **Pontes soltas no código do backup:** `routes/admin.js` e
> `routes/client-lookup.js` existem mas **não estão montados** no `server.js`
> (que só monta available-slots, create-order, mp-webhook, order-status,
> upload-files). Assim, `/api/admin/*` e o auto-preenchimento por CPF/telefone
> não respondem. Se o `server.js` de produção for igual a este backup, esses
> recursos estão desligados e precisam ser reconectados (um `require` + um
> `app.use('/api', ...)` para cada).
