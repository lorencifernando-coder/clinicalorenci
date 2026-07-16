# MISSÃO: Restabelecer e unificar o ecossistema Clínica Lorenci (produção)

> **Copie este documento inteiro como prompt para o agente de IA executor.**
> Ele foi escrito para um agente com acesso real à infraestrutura (SSH/Coolify).
> Autor: sessão de engenharia de 16/07/2026, com base no backup completo do
> servidor e no repositório GitHub `lorencifernando-coder/clinicalorenci`.

---

Você é o agente executor responsável por colocar em produção, de ponta a
ponta, o ecossistema da LFL Cuidado e Saúde: **site** (landing page),
**agendamento**, **pagamento (Mercado Pago)** e **integrações** (Google
Calendar/Meet, Google Drive, webhooks). Trabalhe sozinho até o fim, fase por
fase, validando cada fase antes da seguinte. Nunca pule a Fase 0 (backup).

## Acessos de que você precisa (peça ao Luiz o que faltar)

1. **SSH na VPS Hostinger** — IP `76.13.169.14` (root ou sudo).
2. **Painel Coolify** dessa VPS (URL, usuário e senha) — app `agendamento`
   UUID `i8y6wgnrtq76g6m7b8wfk7s9`; MySQL 8 no container `v52ebj8o6iue8xfgwdjnnaid`.
3. **Painel DNS** do domínio `clinicalorenci.com.br` (Hostinger).
4. **Painel Mercado Pago** da conta LFL CUIDADO E SAUDE LTDA (login do Luiz).
5. **Google Drive** do Luiz (lorenci.fernando@gmail.com) — pasta
   "Backup Servidor — Clinica Lorenci" (já existe, criada em 16/07/2026).
6. O arquivo de segredos do backup (no Drive:
   `SEGREDOS-env-producao-REAL — NAO COMPARTILHAR.txt`).

## Regras de ouro (não negociáveis)

- **R1.** Antes de QUALQUER alteração em produção: backup completo (Fase 0).
- **R2.** NUNCA apague nada — nem arquivos, nem registros do banco, nem apps
  no Coolify. Renomeie/desative em vez de excluir.
- **R3.** Segredos nunca vão para repositório público, chat público ou logs.
- **R4.** Ao final de cada fase, execute os testes da fase. Só avance com tudo verde.
- **R5.** O pagamento tem regras fixas do projeto: **somente PIX, crédito e
  débito** (boleto/atm/pré-pago/moeda digital/carteira/vale excluídos),
  **máximo 3x sem juros**, **CPF não pré-preenchido** na preference,
  `statement_descriptor` "CONSULTA MEDICA". O evento Calendar+Meet é criado
  **na hora do agendamento, independente do pagamento**. Não altere essas regras.
- **R6.** Se algo sair diferente do esperado, PARE a fase, reporte ao Luiz e
  aguarde, em vez de improvisar mudança de arquitetura.

## Arquitetura-alvo (decidida pelo Luiz)

Tudo na **VPS via Coolify**, com deploy por git:

| App Coolify | Código | Domínio | Porta |
|---|---|---|---|
| `site` (novo) | GitHub `lorencifernando-coder/clinicalorenci`, branch `main` (build: Dockerfile) | `clinicalorenci.com.br` + `www` | 3000 |
| `agendamento` (existe) | git bare `/srv/git/agendamento.git` | `agendamento.clinicalorenci.com.br` | 3003 |

O site tem um painel admin unificado em `clinicalorenci.com.br/admin` com duas
abas: editor de conteúdo + dashboard de pedidos (este consome a API do
agendamento via proxy interno `/api/agendamento/*` do server.js do site).

---

## FASE 0 — Backup completo do servidor → Google Drive

1. Na VPS: descubra o container MySQL (`docker ps | grep mysql` ou o nome
   `v52ebj8o6iue8xfgwdjnnaid`) e gere o dump:
   ```bash
   docker exec <container_mysql> mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" default > /root/backup_$(date +%F)/dump_banco.sql
   ```
   (a senha root do MySQL está nas variáveis do container no Coolify)
2. Empacote o código do agendamento:
   ```bash
   mkdir -p /root/backup_$(date +%F)
   git clone --mirror /srv/git/agendamento.git /root/backup_$(date +%F)/agendamento-git-mirror
   tar czf /root/backup_$(date +%F)/agendamento-codigo.tar.gz -C /root/backup_$(date +%F) agendamento-git-mirror
   ```
3. Exporte TODAS as variáveis de ambiente do app `agendamento` no Coolify
   (copie da tela de Environment Variables) para um arquivo
   `env-coolify-agendamento.txt` no mesmo diretório de backup. **Anote em
   particular os valores atuais (ou ausência) de: `MP_WEBHOOK_SECRET`,
   `ADMIN_TOKEN`, `DRIVE_FUNCTION_URL`.**
4. Envie os três artefatos para a pasta do Drive "Backup Servidor — Clinica
   Lorenci" (rclone, ou baixe via scp e suba manualmente — confirme com o
   Luiz o método). Não prossiga sem confirmação de upload.

**Teste da fase:** os arquivos estão no Drive e o dump abre (contém
`CREATE TABLE \`orders\``).

## FASE 1 — Religar o agendamento (subdomínio fora do ar)

Estado conhecido: `agendamento.clinicalorenci.com.br` **não resolve no DNS**.

1. DNS (painel Hostinger): crie/corrija o registro **A** `agendamento` →
   `76.13.169.14` (TTL baixo, 300–3600s).
2. Coolify: confirme que o app `agendamento` está **running** e que o domínio
   `agendamento.clinicalorenci.com.br` está configurado no app com **SSL**
   (Traefik/Let's Encrypt). Redeploy se necessário.
3. Confirme que o MySQL está up e que o app conecta (logs do app sem erro de
   conexão).

**Testes da fase:**
- `nslookup agendamento.clinicalorenci.com.br` → 76.13.169.14
- `curl -s https://agendamento.clinicalorenci.com.br/api/available-slots?date=2026-07-20`
  → 200 com JSON `{duration_minutes, slots:[...]}`
- A página `https://agendamento.clinicalorenci.com.br` abre o formulário.

## FASE 2 — Completar variáveis de ambiente do agendamento (Coolify)

O código usa três variáveis que **não estavam** no backup (podem ou não
existir no Coolify — verifique uma a uma):

| Variável | Como obter | Consequência se faltar |
|---|---|---|
| `MP_WEBHOOK_SECRET` | Painel MP → Suas integrações → (aplicação) → Webhooks → "Assinatura secreta" | **Webhook rejeita tudo com 401; pedido nunca vira `paid`** |
| `ADMIN_TOKEN` | Defina você: gere com `openssl rand -hex 24` e anote para o Luiz (é a senha do painel de pedidos) | Painel admin de pedidos inacessível (500/401) |
| `DRIVE_FUNCTION_URL` | Função do Vesper/Base44 que grava no Drive (padrão análogo à MEET_FUNCTION_URL: `https://vesper-2d4d26ca.base44.app/functions/<nomeDaFuncao>`; confirme o nome com o Luiz/Vesper) | Upload de exames do paciente falha |

Confirme também (valores no arquivo de segredos do Drive):
`SITE_URL=https://agendamento.clinicalorenci.com.br` (sem barra final),
`MP_ACCESS_TOKEN`, `MEET_FUNCTION_URL`, `AGENDAMENTO_SHARED_SECRET`,
`OUTBOUND_WEBHOOKS`, `DB_*`, `CONSULTATION_*`, `BOOKING_*`,
`PAYMENT_WINDOW_HOURS=48`, `DISCOUNT_AMOUNT=100`, `PORT=3003`,
`NODE_ENV=production`. Redeploy após alterar.

**Teste da fase:** todas as variáveis da lista presentes no Coolify; app sobe
sem erro nos logs.

## FASE 3 — Religar rotas desligadas do backend (admin e client-lookup)

**Achado do pente-fino:** `routes/admin.js` e `routes/client-lookup.js`
existem no código mas **não estão montados** no `server.js` — o dashboard
admin e o auto-preenchimento de cadastro não respondem.

No código do agendamento (clone de `/srv/git/agendamento.git`), edite
`server.js`:

```js
// junto aos outros requires:
const adminRoute = require('./routes/admin');
const clientLookupRoute = require('./routes/client-lookup');

// junto aos outros app.use('/api', ...):
app.use('/api', adminRoute);
app.use('/api', clientLookupRoute);
```

Aproveite o mesmo commit para um endurecimento pequeno (achado do QA):
em `lib/mercadopago.js`, a função `isValidCpf` lança `TypeError` se receber
valor truthy não-string (hoje inalcançável porque `create-order.js` coage
antes, mas é bomba armada para chamadas futuras). Troque a primeira linha por:

```js
function isValidCpf(value) {
  if (!value || typeof value !== 'string') return false;
  ...
```

Commit + push para o bare repo + redeploy no Coolify.

**Testes da fase:**
- `curl -s https://agendamento.clinicalorenci.com.br/api/admin/logs` (sem
  token) → **401** (não mais 404)
- `curl -s -H "Authorization: Bearer $ADMIN_TOKEN" .../api/admin/logs/summary`
  → 200 com `{total, paid, pending, failed, manual_review, this_week}`
- `curl -s ".../api/client-lookup?phone=48999318583"` → 200 `{found: true, ...}`
- `https://agendamento.clinicalorenci.com.br/admin/` abre e loga com o ADMIN_TOKEN.

## FASE 4 — Subir o site na VPS e trocar o DNS

1. Coolify → New Resource → Application → GitHub
   `lorencifernando-coder/clinicalorenci`, branch `main` (garanta que o PR
   dessa missão foi mergeado antes; caso contrário use a branch
   `claude/frontend-backend-scheduling-payments-ld9ok9`).
2. Build Pack: **Dockerfile** (na raiz). Porta exposta: **3000**.
3. Variável de ambiente do app site: `AGENDAMENTO_API_URL=https://agendamento.clinicalorenci.com.br`
   (é o default do código, mas deixe explícita).
4. Deploy → teste pela URL temporária (`*.sslip.io`) ANTES do DNS:
   - `/` → 200, acentos corretos (busque "consultório" no HTML)
   - `/admin` → 200 (página unificada com abas)
   - `/politica-de-privacidade` → 200
   - `/video-burnout-reels.dc.html` → 200; `/animations-v2.jsx` → 200 com
     content-type `application/javascript`
5. Adicione os domínios `clinicalorenci.com.br` e `www.clinicalorenci.com.br`
   no app + SSL.
6. DNS: aponte o **A** da raiz `@` e `www` → `76.13.169.14`.
   (O site sai da hospedagem compartilhada; NÃO apague os arquivos de lá —
   regra R2 — apenas deixe o DNS apontar para a VPS.)
7. Ative auto-deploy (webhook GitHub) no app do site.

**Testes da fase:** todos os itens do passo 4 repetidos no domínio real
(https, cadeado válido), + botões "Agendar Consulta" da home levam ao
formulário de agendamento funcionando.

## FASE 5 — Mercado Pago de ponta a ponta

1. Painel MP → Suas integrações → aplicação da clínica → **Webhooks**:
   - URL de produção: `https://agendamento.clinicalorenci.com.br/api/mp-webhook`
   - Eventos: **Pagamentos** (payment).
   - Copie a **assinatura secreta** → é o `MP_WEBHOOK_SECRET` da Fase 2
     (se você já preencheu com outro valor, atualize e redeploy).
   - Use o botão de **teste de webhook** do painel: o app deve responder 200/401
     de forma coerente (teste do painel pode não ter assinatura válida — o
     importante é o endpoint responder e o evento real funcionar na Fase 6).
2. **Investigue o histórico de 403**: no dump de 14/07 há dois pedidos
   `manual_review` com erro do MP `403 At least one policy returned
   UNAUTHORIZED` (pedidos das 12:59 e 14:32; os das 14:52+ geraram link
   normalmente). Verifique no painel MP se a conta está 100% verificada
   (documentos, dados bancários) e se o `MP_ACCESS_TOKEN` em uso é o de
   produção da aplicação correta. Se os 403 persistirem em novos pedidos,
   abra os detalhes da aplicação no MP e confira "Modo produção" ativo.
3. Confira no banco: `SELECT COUNT(*) FROM webhook_events;` — estava **0**
   (nenhum webhook jamais processado). Após a Fase 6, esse número deve ser ≥ 1.

## FASE 6 — Teste E2E real (com dinheiro de verdade, valor mínimo)

> Faça este teste com o Luiz ciente: haverá uma cobrança real seguida de estorno.

1. No Coolify, **temporariamente** defina `CONSULTATION_PRICE=5` (R$ 5,00) e
   redeploy (para o teste custar pouco). NÃO esqueça de reverter no fim.
2. Abra `https://agendamento.clinicalorenci.com.br`, faça um agendamento de
   teste com dados reais do Luiz (nome "TESTE E2E Luiz", CPF real dele,
   telefone real) num horário livre de amanhã.
   - ✅ Deve criar o pedido e redirecionar para o checkout do MP.
   - ✅ Verifique no Google Calendar do consultório: evento
     "[AGUARDANDO PAGAMENTO] Consulta - TESTE E2E Luiz" com link do Meet.
   - ⚠️ Se o MP devolver 403 policy UNAUTHORIZED: o pagador não pode ser a
     mesma conta MP que recebe — use outra conta MP/cartão de outra pessoa
     para pagar, ou trate conforme achado da Fase 5.
3. Pague via **PIX** no checkout.
   - ✅ Em até ~1 min o webhook deve chegar: `SELECT * FROM webhook_events;`
     ganha 1 linha; `orders.status` vira `paid`.
   - ✅ O evento no Calendar perde o prefixo "[AGUARDANDO PAGAMENTO]".
   - ✅ A tela de status do site mostra "Consulta confirmada!".
4. Teste o upload: refaça um agendamento anexando um PDF pequeno — deve
   aparecer no Drive (via DRIVE_FUNCTION_URL).
5. Painéis: `clinicalorenci.com.br/admin` → aba Pedidos (com ADMIN_TOKEN) mostra
   os pedidos de teste; o painel do agendamento também.
6. **Estorne** os pagamentos de teste no painel MP (Atividade → pagamento →
   Reembolsar).
7. **Reverta `CONSULTATION_PRICE=350`** e redeploy. Confirme na página que o
   preço exibido volta a R$ 350,00.

## FASE 7 — Limpeza dos dados de teste (sem apagar histórico real)

Marque os pedidos de teste como expirados (não delete — regra R2):
```sql
UPDATE orders SET status='expired', notes=CONCAT(IFNULL(notes,''),' [TESTE E2E]')
WHERE id IN ('<ids dos pedidos de teste>');
```
Apague apenas os eventos de teste do Google Calendar (esses sim, para não
poluir a agenda), ou renomeie para "[TESTE]".

## FASE 8 — Relatório final + backup pós-mudança

1. Refaça o backup da Fase 0 (agora com o sistema atualizado) e suba ao Drive
   com data nova.
2. Reporte ao Luiz: o que foi feito em cada fase, valores/URLs definidos
   (SEM expor segredos — diga onde estão), o resultado de cada teste, os
   pedidos de teste estornados, e qualquer pendência.
3. Entregue explicitamente: **a senha do painel de pedidos é o `ADMIN_TOKEN`
   definido na Fase 2** — diga ao Luiz para guardá-la no gerenciador de senhas.

---

## Checklist final (tudo precisa estar ✅ para a missão terminar)

- [ ] Backup pré-mudança no Drive (Fase 0)
- [ ] `agendamento.clinicalorenci.com.br` resolve, com SSL, formulário abre
- [ ] `MP_WEBHOOK_SECRET`, `ADMIN_TOKEN`, `DRIVE_FUNCTION_URL` definidos
- [ ] Rotas `/api/admin/*` e `/api/client-lookup` respondendo
- [ ] Site servido pela VPS com acentos corretos, vídeos e subpáginas OK
- [ ] `clinicalorenci.com.br/admin` unificado: aba conteúdo + aba pedidos logando
- [ ] Webhook MP configurado no painel e validado com pagamento real
- [ ] Pedido de teste: pending → paid → Calendar confirmado → estornado
- [ ] Upload de arquivo do paciente chegando ao Drive
- [ ] `webhook_events` > 0 no banco
- [ ] Preço revertido para R$ 350 e dados de teste marcados
- [ ] Backup pós-mudança no Drive + relatório entregue
