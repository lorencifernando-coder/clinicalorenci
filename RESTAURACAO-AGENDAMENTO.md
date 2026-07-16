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
