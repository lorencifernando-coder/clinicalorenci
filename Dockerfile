# ══════════════════════════════════════════════════════════════
#  Dockerfile — Site Dr. Luiz Fernando Lorenci (deploy na VPS/Coolify)
#  ------------------------------------------------------------------
#  Roda o site pelo server.js (Express), que serve os arquivos
#  estáticos e já cuida do charset UTF-8, do tipo dos .jsx (vídeos)
#  e das URLs amigáveis (/admin, /politica-de-privacidade).
#  Mesmo padrão do app de agendamento, para manter tudo igual.
# ══════════════════════════════════════════════════════════════

# --- Estágio de instalação de dependências ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Estágio final de produção ---
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Dependências já instaladas
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Código e arquivos do site
COPY . .

# Roda como usuário non-root (segurança)
USER node

# server.js escuta em process.env.PORT (Coolify define) ou 3000
EXPOSE 3000

CMD ["node", "server.js"]
