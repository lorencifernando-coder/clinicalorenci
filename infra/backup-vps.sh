#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  BACKUP COMPLETO DA VPS — Clínica Lorenci (76.13.169.14)
#  ------------------------------------------------------------------
#  Cole este script inteiro no terminal SSH da VPS (como root) e
#  pressione Enter. Ele NÃO apaga nem altera nada — só lê e grava
#  o backup em /root/backup-servidor-<data>/.
#
#  O que ele salva:
#   1. Dump de TODOS os bancos MySQL (container do Coolify)
#   2. Repositórios git bare (/srv/git — código do agendamento)
#   3. Variáveis de ambiente de todos os containers (os SEGREDOS)
#   4. Configuração do Coolify (/data/coolify, sem logs)
#   5. Inventário: containers, discos, crontab
#
#  Ao final, mostra o comando para baixar tudo para o seu computador.
# ══════════════════════════════════════════════════════════════
set -u
DEST="/root/backup-servidor-$(date +%F-%H%M)"
mkdir -p "$DEST" && chmod 700 "$DEST"
echo "══ Backup completo → $DEST ══"

# ── Espaço em disco (aviso, não bloqueia) ──
LIVRE_GB=$(df --output=avail -BG / | tail -1 | tr -dc '0-9')
echo "Espaço livre em /: ${LIVRE_GB}G"
[ "${LIVRE_GB:-0}" -lt 3 ] && echo "⚠ AVISO: menos de 3G livres — o item 4 (Coolify) será pulado."

# ── 1. Banco de dados MySQL ──
MYSQL_CONT=$(docker ps --format '{{.Names}}' | grep -m1 -i mysql)
[ -z "$MYSQL_CONT" ] && MYSQL_CONT=$(docker ps --format '{{.Names}}' | grep -m1 v52ebj8o6iue8xfgwdjnnaid)
if [ -n "$MYSQL_CONT" ]; then
  docker exec "$MYSQL_CONT" sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases --single-transaction --routines --events' \
    > "$DEST/mysql-todos-os-bancos.sql" 2>"$DEST/mysql-erros.log" \
    && echo "✔ 1. Banco: $(du -h "$DEST/mysql-todos-os-bancos.sql" | cut -f1) (container $MYSQL_CONT)" \
    || echo "✖ 1. Falha no dump — veja $DEST/mysql-erros.log"
else
  echo "✖ 1. Nenhum container MySQL encontrado (docker ps)"
fi

# ── 2. Repositórios git (código do agendamento) ──
if [ -d /srv/git ]; then
  tar czf "$DEST/srv-git.tar.gz" -C /srv git && echo "✔ 2. /srv/git: $(du -h "$DEST/srv-git.tar.gz" | cut -f1)"
else
  echo "– 2. /srv/git não existe (pulado)"
fi

# ── 3. Variáveis de ambiente de TODOS os containers (segredos!) ──
for c in $(docker ps -a --format '{{.Names}}'); do
  echo "═══════ $c ═══════"
  docker inspect "$c" --format '{{range .Config.Env}}{{println .}}{{end}}'
done > "$DEST/containers-env-SEGREDOS.txt" 2>/dev/null
chmod 600 "$DEST/containers-env-SEGREDOS.txt"
echo "✔ 3. Env vars de $(docker ps -a -q | wc -l) containers (arquivo protegido 600)"

# ── 4. Coolify (configuração e dados, sem logs) ──
if [ -d /data/coolify ] && [ "${LIVRE_GB:-0}" -ge 3 ]; then
  tar czf "$DEST/coolify-data.tar.gz" --exclude='*log*' --exclude='*cache*' -C /data coolify 2>/dev/null \
    && echo "✔ 4. /data/coolify: $(du -h "$DEST/coolify-data.tar.gz" | cut -f1)"
else
  echo "– 4. Coolify pulado (pasta ausente ou pouco espaço)"
fi

# ── 5. Inventário do servidor ──
docker ps -a > "$DEST/inventario-containers.txt" 2>/dev/null
df -h > "$DEST/inventario-disco.txt"
crontab -l > "$DEST/inventario-crontab.txt" 2>/dev/null || true
ss -tlnp > "$DEST/inventario-portas.txt" 2>/dev/null || true
echo "✔ 5. Inventário (containers, disco, crontab, portas)"

echo
echo "══════════════════════════════════════════════════"
echo "BACKUP CONCLUÍDO em: $DEST"
du -sh "$DEST"
echo
echo "Para baixar para o SEU computador (rode no seu computador, não na VPS):"
echo "  scp -r root@76.13.169.14:$DEST ."
echo
echo "Depois de baixar, suba a pasta para o Google Drive"
echo "(pasta 'Backup Servidor — Clinica Lorenci')."
echo "⚠ O arquivo containers-env-SEGREDOS.txt contém senhas — não compartilhe."
