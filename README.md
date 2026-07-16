# Site — Dr. Luiz Fernando Lorenci · LFL Cuidado e Saúde

Landing page de captação de pacientes (telemedicina) do Dr. Luiz Fernando Lorenci,
com foco em medicina integrativa, burnout e saúde mental. O site é HTML/CSS/JS puro
(sem processo de build) e agora acompanha um **servidor Node.js (Express)** opcional
para rodar localmente ou em hospedagens Node. O layout é **responsivo** (desktop, tablet
e celular). Continua funcionando também como site 100% estático.

**Página inicial:** `index.html`

> **Publicando na Hostinger?** Leia o [`RESTAURACAO-AGENDAMENTO.md`](RESTAURACAO-AGENDAMENTO.md)
> — ele explica o mapa dos dois sistemas (site × agendamento), por que os
> acentos/subpáginas/vídeos quebraram no upload e como restaurar o subdomínio
> de agendamento. **Importante:** ao subir os arquivos, inclua o `.htaccess`
> (arquivo oculto) — ele corrige o charset (acentos), o tipo dos `.jsx` (vídeos)
> e as URLs amigáveis das subpáginas.

---

## 1. Estrutura de arquivos

```
index.html                     ← página principal (landing) — responsiva
politica-de-privacidade.html   ← página de política (LGPD) — texto estático
admin.html                     ← painel para editar as frases do vídeo "A Jornada"
content.js                     ← conteúdo editável (gerado/atualizado pelo admin)

server.js                      ← servidor Node.js (Express) — opcional
package.json                   ← dependências e scripts do Node

video-burnout-reels.dc.html    ← animação "burnout" (9:16) embutida na página
video-jornada-reels.dc.html    ← vídeo "A Jornada" (9:16) — para exportar p/ Instagram
video-resgate.dc.html          ← vídeo "O Resgate" (9:16) — para exportar p/ Instagram

support.js                     ← runtime que roda os vídeos .dc.html (NÃO editar)
animations-v2.jsx              ← motor de animação dos vídeos (NÃO editar)
tweaks-panel.jsx               ← painel de ajustes do editor de vídeo (NÃO editar)
burnout-scenes-vertical.jsx    ← cenas do vídeo de burnout
jornada-scenes.jsx             ← cenas do vídeo "A Jornada"
resgate-scenes.jsx             ← cenas do vídeo "O Resgate"

assets/
  dr-luiz-foto.png             ← foto do médico (hero, seções, vídeos)
  crest-icon.png               ← brasão da clínica (marca d'água)
  sobre-medico.jpg             ← foto usada na seção "Sobre"
  marca-dagua.png              ← imagem decorativa (marca d'água)
  video-jornada.html           ← mini-player flutuante (canto inferior direito)
```

### O que cada grupo faz
- **Site (obrigatório):** `index.html`, `politica-de-privacidade.html`, `content.js`, pasta `assets/`.
- **Vídeo embutido (obrigatório):** `video-burnout-reels.dc.html` + `support.js` +
  `animations-v2.jsx` + `tweaks-panel.jsx` + `burnout-scenes-vertical.jsx`.
- **Edição de conteúdo (recomendado):** `admin.html`.
- **Vídeos para redes sociais (opcional):** `video-jornada-reels.dc.html`,
  `video-resgate.dc.html` e seus arquivos `*-scenes.jsx`. Não são necessários para o site
  funcionar, mas ficam aqui para você exportar em MP4 quando quiser.

> **Importante:** mantenha todos os arquivos na mesma estrutura de pastas ao subir no servidor.
> Os caminhos são relativos; mover um arquivo de lugar quebra as referências.

---

## 2. Como publicar

Há duas formas — escolha a que a sua hospedagem oferece. Em ambas, **mantenha a estrutura
de pastas** e o `index.html` como página padrão.

### Opção A — Site estático (mais simples)
1. Suba **todos** os arquivos/pastas para a raiz (ou subpasta) do servidor.
2. Não há compilação nem instalação. Funciona em qualquer hospedagem estática
   (Hostinger, Vercel, Netlify, GitHub Pages, Apache/Nginx, etc.).

### Opção B — Servidor Node.js (Express)
Útil para rodar localmente ou em hospedagens Node (Render, Railway, VPS, etc.).

```bash
npm install     # instala o Express (uma vez)
npm start       # sobe o site em http://localhost:3000
```

- A porta pode ser definida pela variável de ambiente `PORT` (padrão `3000`).
- O `server.js` serve os arquivos estáticos e responde também em
  `/politica-de-privacidade`.
- A pasta `node_modules/` é criada pelo `npm install` e **não** vai para o Git
  (já está no `.gitignore`) — rode `npm install` no servidor.

**Em qualquer opção, o navegador do visitante precisa de internet** para carregar:
- Google Fonts (Playfair Display, Inter);
- Tailwind CDN (usado pelo tema base);
- os vídeos `.dc.html` (carregam React/Babel via `support.js`).

---

## 3. Editar o conteúdo (sem mexer em código)

### 3.1 Frases da animação "A Jornada"
1. Abra **`admin.html`** no navegador.
2. Edite as frases de cada cena. Recursos:
   - `<br>` quebra a linha;
   - `<span class="jaccent">texto</span>` deixa o trecho em **dourado**.
3. Clique em **"Baixar content.js atualizado"**.
4. Substitua o arquivo **`content.js`** no servidor pelo que foi baixado.
5. As frases aparecem automaticamente na seção "A Jornada" da página.

### 3.2 Política de Privacidade
`politica-de-privacidade.html` é uma página estática com o texto completo (LGPD).
Antes de publicar, **preencha os campos marcados em `[colchetes]`** diretamente no arquivo:
- `[Inserir seu CNPJ]`
- `[Inserir seu Endereço Completo]`
- `[https://seusite.com.br/politica-de-privacidade]`
- `[contato@seusite.com.br]`

Edite com qualquer editor de texto/código e salve.

---

## 4. Links importantes (onde alterar)

Todos ficam em `index.html`:

| O quê | Onde aparece | Valor atual |
|---|---|---|
| Botão "Agendar Consulta" | vários botões da página | `https://agendamento.clinicalorenci.com.br` |
| Botão flutuante de WhatsApp | canto inferior direito | `https://wa.me/message/J2QCNGVBCGD6M1` |

Para trocar, procure (Ctrl+F) o endereço atual no `index.html` e substitua.

---

## 5. Vídeos para o Instagram (Reels/Stories)

Os arquivos `video-*.dc.html` são vídeos verticais (9:16) já no padrão de reels.

- **Na página:** o vídeo de burnout já aparece embutido (`?embed=1` esconde os controles
  e mostra só a animação, dentro de uma moldura tipo celular).
- **Para postar nas redes:** abra o `.dc.html` desejado e exporte em MP4
  (menu **Share → Export → Video** no ambiente de design). Suba o MP4 direto no Instagram.

O modo `?embed=1` (usado dentro da página) esconde a barra de controles; abrir o arquivo
sem esse parâmetro mostra o player com play/pause para conferência.

---

## 6. Identidade visual (referência rápida)

| Uso | Cor |
|---|---|
| Fundo escuro / tinta (ink) | `#1E2B38` |
| Fundo bege claro | `#F2EDE4` |
| Cartões | `#FBF8F2` |
| Destaque / CTA (terracota) | `#C98B5E` |
| Hover do CTA | `#b5794f` |

**Tipografia:** títulos em *Playfair Display* (serifada); textos em *Inter* (sem serifa).

---

## 7. Histórico (o que já foi feito até aqui)

- Landing page reconstruída a partir da arte aprovada: hero com foto real + brasão, seção
  "mensagem pessoal", "Sobre o médico" e "Consultório".
- Seções de conteúdo do site atual: "Você se identifica?", "Cuidado Integral", "Método de
  Atendimento", "Consulta Online" e "Depoimentos + CTA final".
- Texto autoral distribuído: "O Resgate da Medicina", "O que estamos ignorando?" e
  "Uma Aliança de Verdade".
- Animação "A Jornada" (storytelling da dor → cuidado) na página e como vídeo 9:16.
- Vídeo de burnout convertido para 9:16 (reels) e embutido na página em moldura de celular,
  sem controles e sem download.
- Botão flutuante de WhatsApp + mini-player flutuante que só aparece após rolar o hero.
- Atendimento presencial removido (por ora): o site fala apenas em telemedicina.
- Frase final dos vídeos: "Você merece um atendimento que valorize tudo que é importante
  para você!".
- Painel `admin.html` para editar as frases da animação sem mexer no código.
- Página de Política de Privacidade (LGPD), 1ª versão, com campos a preencher.
- Projeto limpo (removidos rascunhos, uploads e builds antigos) e organizado como repositório.
- Servidor Node.js (Express) adicionado (`server.js` + `package.json`) — o site pode rodar
  como estático ou via `npm start`.
- Layout tornado responsivo (desktop, tablet e celular) sem alterar o visual de desktop.

---

## 8. Observações técnicas

- Site 100% estático: HTML + CSS inline + JS simples. Sem framework, sem build.
- Os vídeos `.dc.html` dependem de `support.js` + arquivos `.jsx` no mesmo diretório;
  o servidor só precisa entregá-los como arquivos comuns (não exigem tipo MIME especial).
- Não edite `support.js`, `animations-v2.jsx` nem `tweaks-panel.jsx` — são o motor dos vídeos.
- `content.js` é gerado pelo `admin.html`; edições manuais são possíveis, mas mantenha o
  formato `window.SITE_CONTENT = { ... };`.
