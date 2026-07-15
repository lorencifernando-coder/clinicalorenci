// Vídeo "O Resgate da Medicina" — 9:16 vertical (1080×1920), ~30s.
// Paleta do site: ink, terracota, creme. Estilo flat ilustrado.
const INK = '#1E2B38';
const INK_DEEP = '#16202B';
const CTA = '#C98B5E';
const CTA_DK = '#A96F45';
const CREAM = '#F6F1E7';
const CARD = '#FBF7EF';
const MUTED = 'rgba(255,255,255,0.6)';
const SKIN1 = '#E8B48C';
const SKIN2 = '#C88A5C';
const HAIR1 = '#4A3527';
const HAIR2 = '#8A8580';
const HEAD_FONT = "'Playfair Display', Georgia, serif";
const BODY_FONT = "'Inter', -apple-system, sans-serif";

const clampP = (v) => Math.max(0, Math.min(1, v));

function fadeStyle(localTime, dur, opts = {}) {
  const { inDur = 0.5, outDur = 0.5, delay = 0, rise = 24 } = opts;
  const outStart = Math.max(0, dur - outDur);
  let op = 1, ty = 0;
  if (localTime < delay) { op = 0; ty = rise; }
  else if (localTime < delay + inDur) { const t = clampP((localTime - delay) / inDur); op = t; ty = (1 - t) * rise; }
  else if (localTime > outStart) { const t = clampP((localTime - outStart) / outDur); op = 1 - t; ty = -t * rise * 0.5; }
  return { opacity: op, transform: `translateY(${ty}px)` };
}
function popStyle(localTime, dur, opts = {}) {
  const { inDur = 0.5, outDur = 0.4, delay = 0, from = 0.85 } = opts;
  const outStart = Math.max(0, dur - outDur);
  let op = 1, sc = 1;
  if (localTime < delay) { op = 0; sc = from; }
  else if (localTime < delay + inDur) { const t = clampP((localTime - delay) / inDur); op = t; sc = from + (1 - from) * (1 - Math.pow(1 - t, 3)); }
  else if (localTime > outStart) { const t = clampP((localTime - outStart) / outDur); op = 1 - t; sc = 1 - 0.05 * t; }
  return { opacity: op, transform: `scale(${sc})` };
}

const EXPR = {
  tired: { eyes: 'tiredArc', brow: 'flatLow', mouth: 'flat' },
  sadFrown: { eyes: 'tiredArc', brow: 'worried', mouth: 'frown' },
  worried: { eyes: 'open', brow: 'worried', mouth: 'small' },
  warmSmile: { eyes: 'happyArc', brow: 'raised', mouth: 'smile' },
  softSmile: { eyes: 'open', brow: 'flat', mouth: 'smileSoft' },
  listening: { eyes: 'open', brow: 'flatRaised', mouth: 'smileSoft' },
};

function Face({ preset = 'tired', ink = INK }) {
  const p = EXPR[preset] || EXPR.tired;
  return (
    <g>
      {p.brow === 'flatLow' && <>
        <rect x="96" y="80" width="24" height="5" rx="2.5" fill={ink} opacity="0.75" />
        <rect x="140" y="80" width="24" height="5" rx="2.5" fill={ink} opacity="0.75" />
      </>}
      {p.brow === 'worried' && <>
        <path d="M96,82 L120,74" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M164,82 L140,74" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      </>}
      {p.brow === 'raised' && <>
        <path d="M96,74 Q108,66 120,74" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M140,74 Q152,66 164,74" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>}
      {p.brow === 'flat' && <>
        <rect x="96" y="76" width="24" height="5" rx="2.5" fill={ink} />
        <rect x="140" y="76" width="24" height="5" rx="2.5" fill={ink} />
      </>}
      {p.brow === 'flatRaised' && <>
        <rect x="96" y="74" width="24" height="5" rx="2.5" fill={ink} />
        <rect x="140" y="74" width="24" height="5" rx="2.5" fill={ink} />
      </>}
      {p.eyes === 'open' && <>
        <circle cx="108" cy="95" r="6.5" fill={ink} />
        <circle cx="152" cy="95" r="6.5" fill={ink} />
      </>}
      {p.eyes === 'tiredArc' && <>
        <path d="M100,96 q8,6 16,0" stroke={ink} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M144,96 q8,6 16,0" stroke={ink} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </>}
      {p.eyes === 'happyArc' && <>
        <path d="M100,97 q8,-9 16,0" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M144,97 q8,-9 16,0" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>}
      {p.mouth === 'flat' && <rect x="112" y="122" width="36" height="4.5" rx="2.25" fill={ink} />}
      {p.mouth === 'frown' && <path d="M110,128 Q130,116 150,128" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />}
      {p.mouth === 'small' && <ellipse cx="130" cy="123" rx="8" ry="9" fill={ink} opacity="0.85" />}
      {p.mouth === 'smile' && <path d="M110,118 Q130,138 150,118" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />}
      {p.mouth === 'smileSoft' && <path d="M112,120 Q130,132 148,120" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />}
    </g>
  );
}

function PersonBust({ x = 0, y = 0, scale = 1, flip = false, skin = SKIN1, hair = HAIR1, shirt = CTA,
  headTilt = 0, expr = 'tired', breathe = 0, ink = INK }) {
  const bob = Math.sin(breathe) * 3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${flip ? -scale : scale}, ${scale}) translateY(${bob}px)` }}>
      <svg width="260" height="320" viewBox="0 0 260 320">
        <path d="M55,320 Q55,150 130,150 Q205,150 205,320 Z" fill={shirt} />
        <g transform={`rotate(${headTilt},130,140)`}>
          <rect x="76" y="30" width="108" height="72" rx="42" fill={hair} />
          <circle cx="76" cy="102" r="13" fill={skin} />
          <circle cx="184" cy="102" r="13" fill={skin} />
          <circle cx="130" cy="95" r="58" fill={skin} />
          <path d="M74,58 Q130,20 186,58 Q186,90 130,96 Q74,90 74,58 Z" fill={hair} />
          <Face preset={expr} ink={ink} />
        </g>
      </svg>
    </div>
  );
}

function Clock({ x, y, size = 200, time = 0, urgent = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)' }}>
      <circle cx="50" cy="50" r="42" fill="none" stroke={urgent ? CTA : 'rgba(255,255,255,0.4)'} strokeWidth="4" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="49" y="11" width="2" height="6" rx="1" fill="rgba(255,255,255,0.35)" transform={`rotate(${i * 30},50,50)`} />
      ))}
      <line x1="50" y1="50" x2="50" y2="24" stroke={CTA} strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${time * 120},50,50)`} />
      <line x1="50" y1="50" x2="66" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${time * 12},50,50)`} />
      <circle cx="50" cy="50" r="3.5" fill={CTA} />
    </svg>
  );
}

const W = 1080, H = 1920;
const centerText = { position: 'absolute', left: 60, right: 60, textAlign: 'center' };

// ── Cena 1: O relógio dita o tempo ──────────────────────────────
function SceneRelogio() {
  const { localTime, dur, progress } = useScene();
  const t1 = fadeStyle(localTime, dur, { delay: 0.4, inDur: 0.6, outDur: 0.5 });
  const t2 = fadeStyle(localTime, dur, { delay: 1.6, inDur: 0.6, outDur: 0.5 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: INK_DEEP, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + progress * 0.06})` }}>
        <Clock x={W / 2} y={620} size={420} time={localTime} urgent={progress > 0.5} />
      </div>
      <div style={{ ...centerText, top: 950, ...t1 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 74, fontWeight: 500, color: '#fff', lineHeight: 1.35 }}>Você entra no consultório.<br />Mal se senta…</div>
      </div>
      <div style={{ ...centerText, top: 1250, ...t2 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 66, fontStyle: 'italic', color: CTA, lineHeight: 1.35 }}>e o relógio já dita<br />o fim do seu tempo.</div>
      </div>
    </div>
  );
}

// ── Cena 2: Receita fria, porta fecha ───────────────────────────
function SceneReceita() {
  const { localTime, dur, progress } = useScene();
  const paper = popStyle(localTime, dur, { delay: 0.3, inDur: 0.5, outDur: 0.4 });
  const t1 = fadeStyle(localTime, dur, { delay: 1.2, inDur: 0.6, outDur: 0.4 });
  const doorP = clampP((localTime - 2.6) / 1.2);
  return (
    <div style={{ position: 'absolute', inset: 0, background: INK_DEEP, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: W / 2 - 170, top: 380, width: 340, height: 460, background: CARD, borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,.4)', ...paper }}>
        <div style={{ margin: '44px 40px 0', height: 10, width: 140, background: INK, opacity: 0.7, borderRadius: 5 }} />
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ margin: '26px 40px 0', height: 8, width: 260 - i * 30, background: INK, opacity: 0.25, borderRadius: 4 }} />
        ))}
        <div style={{ margin: '48px 40px 0', height: 8, width: 120, background: CTA, borderRadius: 4 }} />
      </div>
      <div style={{ ...centerText, top: 950, ...t1 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 72, fontWeight: 500, color: '#fff', lineHeight: 1.4 }}>Uma receita rápida.<br />Um aperto de mão frio.</div>
      </div>
      <div style={{ ...centerText, top: 1330, opacity: doorP }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 66, fontStyle: 'italic', color: CTA }}>A porta se fecha.</div>
      </div>
      {/* porta fechando: painel escuro desliza */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: W * doorP * 0.5, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: W * doorP * 0.5, background: 'rgba(0,0,0,0.5)' }} />
    </div>
  );
}

// ── Cena 3: E o que você sentia? ────────────────────────────────
function SceneIgnorado() {
  const { localTime, dur } = useScene();
  const t1 = fadeStyle(localTime, dur, { delay: 0.4, inDur: 0.7, outDur: 0.5 });
  const t2 = fadeStyle(localTime, dur, { delay: 1.8, inDur: 0.7, outDur: 0.5 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#131B24', overflow: 'hidden' }}>
      <PersonBust x={W / 2} y={700} scale={2.4} expr="sadFrown" headTilt={8} shirt="#33465A" ink={INK_DEEP} breathe={localTime * 1.2} />
      <div style={{ ...centerText, top: 1050, ...t1 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 78, fontWeight: 500, color: '#fff', lineHeight: 1.35 }}>E o que você<br />realmente sentia?</div>
      </div>
      <div style={{ ...centerText, top: 1330, ...t2 }}>
        <div style={{ fontFamily: BODY_FONT, fontSize: 40, color: MUTED, lineHeight: 1.6 }}>Ninguém perguntou.<br />O sintoma foi mascarado —<br />a causa continua lá.</div>
      </div>
    </div>
  );
}

// ── Cena 4: Existe outro caminho ────────────────────────────────
function SceneCaminho() {
  const { localTime, dur, progress } = useScene();
  const t1 = popStyle(localTime, dur, { delay: 0.4, inDur: 0.7, outDur: 0.5 });
  const t2 = fadeStyle(localTime, dur, { delay: 1.6, inDur: 0.7, outDur: 0.5 });
  const glow = 0.5 + 0.5 * Math.sin(localTime * 1.6);
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${INK_DEEP} 0%, ${INK} 100%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: W / 2, top: 640, width: 480, height: 480, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, rgba(201,139,94,${0.22 + glow * 0.12}) 0%, transparent 70%)` }} />
      <svg width="300" height="300" viewBox="0 0 100 100" style={{ position: 'absolute', left: W / 2, top: 640, transform: 'translate(-50%,-50%)' }}>
        <path d="M50,88 C14,62 10,34 30,23 C41,17 50,25 50,36 C50,25 59,17 70,23 C90,34 86,62 50,88 Z" fill={CTA} />
        <path d="M28,55 h13 l6,-12 8,22 6,-10 h11" stroke={CREAM} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="120" strokeDashoffset={120 - clampP((localTime - 0.8) / 1.2) * 120} />
      </svg>
      <div style={{ ...centerText, top: 1000, ...t1 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 88, fontStyle: 'italic', color: CTA }}>Existe outro caminho.</div>
      </div>
      <div style={{ ...centerText, top: 1230, ...t2 }}>
        <div style={{ fontFamily: BODY_FONT, fontSize: 40, color: MUTED, lineHeight: 1.6 }}>Um médico que ouve, investiga<br />e caminha com você —<br />sem pressa, sem julgamentos.</div>
      </div>
    </div>
  );
}

// ── Cena 5: A escuta ────────────────────────────────────────────
function SceneEscuta() {
  const { localTime, dur } = useScene();
  const bubble = popStyle(localTime, dur, { delay: 1.0, inDur: 0.5, outDur: 0.5 });
  const t1 = fadeStyle(localTime, dur, { delay: 1.8, inDur: 0.7, outDur: 0.5 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: CREAM, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: '#EADFC9' }} />
      <PersonBust x={340} y={860} scale={1.9} expr="listening" headTilt={-4} shirt="#5B7286" breathe={localTime * 1.1} />
      <PersonBust x={740} y={860} scale={1.9} flip expr="warmSmile" headTilt={4} skin={SKIN2} hair={HAIR2} shirt="#F2EFE6" breathe={localTime * 1.1 + 1} />
      <div style={{ ...bubble }}>
        <svg width="180" height="180" viewBox="0 0 100 100" style={{ position: 'absolute', left: 450, top: 380 }}>
          <path d="M14,14 h72 a8,8 0 0 1 8,8 v40 a8,8 0 0 1 -8,8 h-40 l-16,16 v-16 h-16 a8,8 0 0 1 -8,-8 v-40 a8,8 0 0 1 8,-8 Z" fill="#fff" stroke={INK} strokeWidth="3" />
          <path d="M50,52 C30,38 28,24 40,19 C46,17 50,22 50,28 C50,22 54,17 60,19 C72,24 70,38 50,52 Z" fill={CTA} />
        </svg>
      </div>
      <div style={{ ...centerText, top: 1180, ...t1 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 70, fontWeight: 500, color: INK, lineHeight: 1.4 }}>Quando alguém<br />finalmente te escuta,<br /><em style={{ color: CTA_DK }}>a sua saúde muda<br />de direção.</em></div>
      </div>
    </div>
  );
}

// ── Cena 6: CTA com foto ────────────────────────────────────────
function SceneCTA() {
  const { localTime, dur } = useScene();
  const foto = popStyle(localTime, dur, { delay: 0.3, inDur: 0.6, outDur: 0 });
  const t1 = fadeStyle(localTime, dur, { delay: 1.0, inDur: 0.7, outDur: 0 });
  const btn = popStyle(localTime, dur, { delay: 1.9, inDur: 0.6, outDur: 0 });
  const t2 = fadeStyle(localTime, dur, { delay: 2.5, inDur: 0.6, outDur: 0 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${INK_DEEP} 0%, ${INK} 100%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: W / 2, top: 560, transform: 'translate(-50%,-50%)', ...foto }}>
        <div style={{ width: 340, height: 340, borderRadius: '50%', overflow: 'hidden', border: `6px solid ${CTA}`, boxShadow: '0 30px 80px rgba(0,0,0,.5)' }}>
          <img src="./assets/dr-luiz-foto.png" alt="Dr. Luiz Fernando Lorenci" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '80% top' }} />
        </div>
      </div>
      <div style={{ ...centerText, top: 830, ...t1 }}>
        <div style={{ fontFamily: HEAD_FONT, fontSize: 72, fontWeight: 500, color: '#fff', lineHeight: 1.4 }}>Você merece o resgate da<br /><em style={{ color: CTA }}>medicina humanizada.</em></div>
      </div>
      <div style={{ ...centerText, top: 1180, ...btn }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, background: CTA, color: '#fff', fontFamily: BODY_FONT, fontWeight: 600, fontSize: 44, padding: '30px 70px', borderRadius: 16, boxShadow: `0 10px 0 ${CTA_DK}` }}>
          Marque a sua consulta
        </div>
      </div>
      <div style={{ ...centerText, top: 1360, ...t2 }}>
        <div style={{ fontFamily: BODY_FONT, fontSize: 32, color: MUTED, lineHeight: 1.6 }}>Dr. Luiz Fernando Lorenci · CRMSC-41096<br />Presencial em Florianópolis, Imbituba e Garopaba<br />Telemedicina para todo o Brasil</div>
      </div>
    </div>
  );
}

function ResgateVideo() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || { motionEditor: true });
  const map = { Relogio: SceneRelogio, Receita: SceneReceita, Ignorado: SceneIgnorado, Caminho: SceneCaminho, Escuta: SceneEscuta, CTA: SceneCTA };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <SceneStage width={1080} height={1920} bg={INK_DEEP} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        {map}
      </SceneStage>
      <TweaksPanel>
        <TweakSection label="Vídeo" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}

Object.assign(window, { ResgateVideo });
