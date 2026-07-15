// Burnout awareness video — PORTRAIT 9:16 (reels). Same storybook style, re-laid-out for 1080×1920.
const CREAM = '#F4E9D6';
const CREAM_DARK = '#EADFC5';
const INK = '#3B2E22';
const TERRA = '#D97748';
const TERRA_DK = '#B85A32';
const SAGE = '#7E9473';
const BLUE = '#6D8CAE';
const SUN = '#F0B44A';
const SKIN1 = '#E8B48C';
const SKIN2 = '#C88A5C';
const HAIR1 = '#4A3527';
const HAIR2 = '#8A8580';
const CLOUD = '#98A6AE';
const HEAD_FONT = "'Baloo 2', sans-serif";
const BODY_FONT = "'Nunito', sans-serif";

const clampP = (v) => Math.max(0, Math.min(1, v));

function fadeStyle(localTime, dur, opts = {}) {
  const { inDur = 0.5, outDur = 0.5, delay = 0, rise = 20 } = opts;
  const outStart = Math.max(0, dur - outDur);
  let op = 1, ty = 0;
  if (localTime < delay) { op = 0; ty = rise; }
  else if (localTime < delay + inDur) { const t = clampP((localTime - delay) / inDur); op = t; ty = (1 - t) * rise; }
  else if (localTime > outStart) { const t = clampP((localTime - outStart) / outDur); op = 1 - t; ty = -t * rise * 0.5; }
  return { opacity: op, transform: `translateY(${ty}px)` };
}
function popStyle(localTime, dur, opts = {}) {
  const { inDur = 0.5, outDur = 0.4, delay = 0, from = 0.8 } = opts;
  const outStart = Math.max(0, dur - outDur);
  let op = 1, sc = 1;
  if (localTime < delay) { op = 0; sc = from; }
  else if (localTime < delay + inDur) { const t = clampP((localTime - delay) / inDur); op = t; sc = from + (1 - from) * (1 - Math.pow(1 - t, 3)); }
  else if (localTime > outStart) { const t = clampP((localTime - outStart) / outDur); op = 1 - t; sc = 1 - 0.06 * t; }
  return { opacity: op, transform: `scale(${sc})` };
}

const EXPR = {
  neutral: { eyes: 'open', brow: 'flat', mouth: 'flat' },
  tired: { eyes: 'tiredArc', brow: 'flatLow', mouth: 'flat' },
  worried: { eyes: 'open', brow: 'worried', mouth: 'small' },
  sadFrown: { eyes: 'tiredArc', brow: 'worried', mouth: 'frown' },
  warmSmile: { eyes: 'happyArc', brow: 'raised', mouth: 'smile' },
  softSmile: { eyes: 'open', brow: 'flat', mouth: 'smileSoft' },
  listening: { eyes: 'open', brow: 'flatRaised', mouth: 'smileSoft' },
};

function Face({ preset = 'neutral' }) {
  const p = EXPR[preset] || EXPR.neutral;
  return (
    <g>
      {p.brow === 'flat' && <>
        <rect x="96" y="76" width="24" height="5" rx="2.5" fill={INK} />
        <rect x="140" y="76" width="24" height="5" rx="2.5" fill={INK} />
      </>}
      {p.brow === 'flatLow' && <>
        <rect x="96" y="80" width="24" height="5" rx="2.5" fill={INK} opacity="0.75" />
        <rect x="140" y="80" width="24" height="5" rx="2.5" fill={INK} opacity="0.75" />
      </>}
      {p.brow === 'worried' && <>
        <path d="M96,82 L120,74" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path d="M164,82 L140,74" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      </>}
      {p.brow === 'raised' && <>
        <path d="M96,74 Q108,66 120,74" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M140,74 Q152,66 164,74" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>}
      {p.brow === 'flatRaised' && <>
        <rect x="96" y="74" width="24" height="5" rx="2.5" fill={INK} />
        <rect x="140" y="74" width="24" height="5" rx="2.5" fill={INK} />
      </>}

      {p.eyes === 'open' && <>
        <circle cx="108" cy="95" r="6.5" fill={INK} />
        <circle cx="152" cy="95" r="6.5" fill={INK} />
      </>}
      {p.eyes === 'tiredArc' && <>
        <path d="M100,96 q8,6 16,0" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M144,96 q8,6 16,0" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M98,105 q10,3 20,0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.35" />
        <path d="M142,105 q10,3 20,0" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.35" />
      </>}
      {p.eyes === 'happyArc' && <>
        <path d="M100,97 q8,-9 16,0" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M144,97 q8,-9 16,0" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>}

      {p.mouth === 'flat' && <rect x="112" y="122" width="36" height="4.5" rx="2.25" fill={INK} />}
      {p.mouth === 'frown' && <path d="M110,128 Q130,116 150,128" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />}
      {p.mouth === 'small' && <ellipse cx="130" cy="123" rx="8" ry="9" fill={INK} opacity="0.85" />}
      {p.mouth === 'smile' && <path d="M110,118 Q130,138 150,118" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />}
      {p.mouth === 'smileSoft' && <path d="M112,120 Q130,132 148,120" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />}
    </g>
  );
}

const POSE_MAG = { down: 8, forwardDesk: 34, upFace: 140, raisedOut: 160, crossedIn: 95, restBent: 24 };

function Arm({ side, pose = 'down', skin }) {
  const shoulderX = side === 'L' ? 70 : 190;
  const shoulderY = 150;
  const mag = POSE_MAG[pose] ?? 8;
  const rot = side === 'L' ? -mag : mag;
  const len = pose === 'forwardDesk' ? 96 : pose === 'crossedIn' ? 86 : 112;
  return (
    <g transform={`translate(${shoulderX},${shoulderY}) rotate(${rot})`}>
      <rect x="-17" y="0" width="34" height={len} rx="17" fill={skin} />
      <circle cx="0" cy={len} r="17" fill={skin} />
    </g>
  );
}

function PersonBust({ x = 0, y = 0, scale = 1, flip = false, skin = SKIN1, hair = HAIR1, shirt = BLUE,
  headTilt = 0, armLeft = 'down', armRight = 'down', expr = 'neutral', breathe = 0 }) {
  const bob = Math.sin(breathe) * 3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${flip ? -scale : scale}, ${scale}) translateY(${bob}px)` }}>
      <svg width="260" height="320" viewBox="0 0 260 320">
        <path d="M55,320 Q55,150 130,150 Q205,150 205,320 Z" fill={shirt} />
        <Arm side="L" pose={armLeft} skin={skin} />
        <Arm side="R" pose={armRight} skin={skin} />
        <path d="M55,320 Q55,150 130,150 Q205,150 205,320 Z" fill={shirt} />
        <g transform={`rotate(${headTilt},130,140)`}>
          <rect x="76" y="30" width="108" height="72" rx="42" fill={hair} />
          <circle cx="76" cy="102" r="13" fill={skin} />
          <circle cx="184" cy="102" r="13" fill={skin} />
          <circle cx="130" cy="95" r="58" fill={skin} />
          <path d="M74,58 Q130,20 186,58 Q186,90 130,96 Q74,90 74,58 Z" fill={hair} />
          <Face preset={expr} />
        </g>
      </svg>
    </div>
  );
}

function CloudShape({ x, y, w = 140, color = '#fff', opacity = 1 }) {
  const h = w * 0.55;
  return (
    <svg width={w} height={h} viewBox="0 0 140 78" style={{ position: 'absolute', left: x, top: y, opacity }}>
      <path d="M30,60 Q6,60 6,40 Q6,22 26,22 Q30,4 54,4 Q78,4 82,22 Q104,22 104,42 Q126,42 126,58 Q126,60 122,60 Z" fill={color} />
    </svg>
  );
}
function SunRays({ x, y, size = 260, color = SUN, spin = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${spin}deg)` }}>
      <circle cx="100" cy="100" r="46" fill={color} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="97" y="6" width="6" height="26" rx="3" fill={color}
          transform={`rotate(${i * 30},100,100)`} />
      ))}
    </svg>
  );
}
function BatteryIcon({ x, y, size = 90 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" style={{ position: 'absolute', left: x, top: y }}>
      <rect x="4" y="8" width="80" height="44" rx="8" fill="none" stroke={INK} strokeWidth="6" />
      <rect x="86" y="22" width="10" height="16" rx="3" fill={INK} />
      <rect x="12" y="16" width="14" height="28" rx="3" fill={TERRA} />
    </svg>
  );
}
function MoonZ({ x, y, size = 90 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y }}>
      <path d="M62,14 A34,34 0 1 0 62,86 A28,28 0 0 1 62,14 Z" fill={BLUE} />
      <text x="66" y="46" fontFamily={HEAD_FONT} fontSize="26" fontWeight="700" fill={INK}>Z</text>
      <text x="80" y="30" fontFamily={HEAD_FONT} fontSize="18" fontWeight="700" fill={INK}>z</text>
    </svg>
  );
}
function StormCloud({ x, y, size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y }}>
      <path d="M22,50 Q8,50 8,36 Q8,22 24,22 Q28,8 48,8 Q68,8 72,24 Q90,24 90,42 Q90,50 80,50 Z" fill={CLOUD} />
      <path d="M40,54 L30,74 L42,74 L34,94" stroke={SUN} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeartCrack({ x, y, size = 90 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y }}>
      <path d="M50,88 C10,60 6,30 28,18 C40,11 50,20 50,32 C50,20 60,11 72,18 C94,30 90,60 50,88 Z" fill={TERRA} opacity="0.85" />
      <path d="M50,32 L44,50 L54,58 L48,80" stroke={CREAM} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlantPot({ x, y, size = 120 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{ position: 'absolute', left: x, top: y }}>
      <path d="M28,80 L72,80 L64,116 L36,116 Z" fill={TERRA_DK} />
      <path d="M50,80 Q30,40 50,10" stroke={SAGE} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M50,80 Q70,44 54,14" stroke={SAGE} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M50,70 Q34,50 46,26" stroke={SAGE} strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="30" rx="14" ry="9" fill={SAGE} transform="rotate(-30,38,30)" />
      <ellipse cx="60" cy="20" rx="14" ry="9" fill={SAGE} transform="rotate(20,60,20)" />
      <ellipse cx="48" cy="55" rx="12" ry="8" fill={SAGE} transform="rotate(-10,48,55)" />
    </svg>
  );
}
function SpeechHeart({ x, y, size = 110 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y }}>
      <path d="M14,14 h72 a8,8 0 0 1 8,8 v40 a8,8 0 0 1 -8,8 h-40 l-16,16 v-16 h-16 a8,8 0 0 1 -8,-8 v-40 a8,8 0 0 1 8,-8 Z" fill="#fff" stroke={INK} strokeWidth="3" />
      <path d="M50,52 C30,38 28,24 40,19 C46,17 50,22 50,28 C50,22 54,17 60,19 C72,24 70,38 50,52 Z" fill={TERRA} />
    </svg>
  );
}

// Headline helper (portrait, centered) --------------------------------
function Cap({ top, children, size = 58, color = INK, font = HEAD_FONT, weight = 700, style }) {
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top, textAlign: 'center', ...style }}>
      <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color, lineHeight: 1.15, textWrap: 'balance' }}>{children}</div>
    </div>
  );
}

// ── Scene 1: Intro ─────────────────────────────────────────────────────
function SceneIntro() {
  const { localTime, dur } = useScene();
  const cap = fadeStyle(localTime, dur, { delay: 0.8, inDur: 0.6, outDur: 0.5 });
  const stress = fadeStyle(localTime, dur, { delay: 1.6, inDur: 0.7, outDur: 0.4, rise: 0 });
  const breathe = localTime * 1.4;
  return (
    <div style={{ position: 'absolute', inset: 0, background: CREAM, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 70, top: 90, ...fadeStyle(localTime, dur, { delay: 0.2, inDur: 0.5 }) }}>
        <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke={INK} strokeWidth="5" />
          <line x1="40" y1="40" x2="40" y2="20" stroke={INK} strokeWidth="4" strokeLinecap="round" transform={`rotate(${localTime * 40},40,40)`} />
          <line x1="40" y1="40" x2="54" y2="40" stroke={INK} strokeWidth="4" strokeLinecap="round" transform={`rotate(${localTime * 4},40,40)`} /></svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1400, bottom: 0, background: '#B9835A' }} />
      <div style={{ position: 'absolute', left: 210, top: 1170, width: 660, height: 74, background: TERRA_DK, borderRadius: 14 }} />
      <div style={{ position: 'absolute', left: 380, top: 1030, width: 300, height: 170, background: '#DED3BE', borderRadius: 14, boxShadow: '0 -4px 0 #C8BB9F inset' }}>
        <div style={{ position: 'absolute', left: 18, top: 18, right: 18, bottom: 18, background: BLUE, borderRadius: 8, opacity: 0.85 }} />
      </div>
      <div style={{ position: 'absolute', left: 720, top: 1080, width: 90, height: 120 }}>
        <div style={{ position: 'absolute', left: 10, top: 20, width: 70, height: 90, background: '#fff', borderRadius: 4, transform: 'rotate(-4deg)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }} />
        <div style={{ position: 'absolute', left: 4, top: 8, width: 70, height: 90, background: '#F7F2E6', borderRadius: 4, transform: 'rotate(3deg)', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }} />
      </div>
      <div style={{ ...stress }}>
        {[[600, 700], [700, 675], [790, 720]].map(([sx, sy], i) => (
          <svg key={i} width="50" height="50" style={{ position: 'absolute', left: sx, top: sy }}>
            <path d="M4,25 Q14,10 24,25 T44,25" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.55" />
          </svg>
        ))}
      </div>
      <PersonBust x={540} y={1000} scale={1.75} expr="tired" armLeft="forwardDesk" armRight="forwardDesk" headTilt={6} breathe={breathe} skin={SKIN1} hair={HAIR1} shirt={BLUE} />
      <Cap top={300} size={62} style={cap}>Você sente que não dá<br />mais conta de tudo?</Cap>
    </div>
  );
}

// ── Scene 2: Symptoms ─────────────────────────────────────────────────
function SceneSymptoms() {
  const { localTime, dur } = useScene();
  const head = fadeStyle(localTime, dur, { delay: 0.1, inDur: 0.5 });
  const items = [
    { Icon: BatteryIcon, x: 90, y: 560, label: 'Cansaço extremo', delay: 0.6 },
    { Icon: MoonZ, x: 770, y: 560, label: 'Insônia', delay: 1.4 },
    { Icon: StormCloud, x: 770, y: 1470, label: 'Irritabilidade', delay: 2.2 },
    { Icon: HeartCrack, x: 90, y: 1470, label: 'Desânimo', delay: 3.0 },
  ];
  const breathe = localTime * 1.2;
  return (
    <div style={{ position: 'absolute', inset: 0, background: CREAM }}>
      <Cap top={230} size={52} style={head}>Os sinais aparecem aos poucos</Cap>
      <PersonBust x={540} y={1150} scale={1.45} expr="worried" armLeft="crossedIn" armRight="crossedIn" breathe={breathe} skin={SKIN1} hair={HAIR1} shirt={TERRA} />
      {items.map(({ Icon, x, y, label, delay }, i) => {
        const st = popStyle(localTime, dur, { delay, inDur: 0.5, outDur: 0.4 });
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, textAlign: 'center', width: 220, ...st }}>
            <div style={{ position: 'relative', height: 100 }}><Icon x={65} y={0} /></div>
            <div style={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: 30, color: INK, marginTop: 8 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Scene 3: Reveal ────────────────────────────────────────────────────
function SceneReveal() {
  const { localTime, dur } = useScene();
  const line1 = popStyle(localTime, dur, { delay: 0.5, inDur: 0.6, outDur: 0.5, from: 0.85 });
  const line2 = fadeStyle(localTime, dur, { delay: 1.6, inDur: 0.6, outDur: 0.5 });
  const rain = (localTime * 60) % 40;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DCC9A6', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 26%, rgba(59,46,34,0.05), rgba(59,46,34,0.42))' }} />
      <CloudShape x={300} y={150} w={480} color="#8C7B63" opacity={0.9} />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ position: 'absolute', left: 400 + i * 60, top: 420 + ((rain + i * 12) % 60), width: 4, height: 30, background: '#7A8FA8', opacity: 0.5, borderRadius: 2 }} />
      ))}
      <PersonBust x={540} y={980} scale={1.85} expr="sadFrown" armLeft="upFace" armRight="upFace" headTilt={10} skin={SKIN1} hair={HAIR1} shirt={BLUE} />
      <Cap top={1400} size={64} color={TERRA_DK} style={line1}>Isso pode ser burnout.</Cap>
      <Cap top={1540} size={32} color={INK} font={BODY_FONT} style={line2}>Não é frescura — é o corpo pedindo socorro.</Cap>
    </div>
  );
}

// ── Scene 4: Hope ─────────────────────────────────────────────────────
function SceneHope() {
  const { localTime, dur, progress } = useScene();
  const partL = -progress * 160;
  const partR = progress * 180;
  const head = fadeStyle(localTime, dur, { delay: 1.1, inDur: 0.6 });
  const sub = fadeStyle(localTime, dur, { delay: 1.9, inDur: 0.6 });
  const hand = fadeStyle(localTime, dur, { delay: 0.6, inDur: 0.5, rise: 40 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: CREAM, overflow: 'hidden' }}>
      <SunRays x={540} y={230} size={300} spin={progress * 20} />
      <CloudShape x={120 + partL} y={110} w={320} color="#fff" opacity={0.95} />
      <CloudShape x={660 + partR} y={150} w={280} color="#fff" opacity={0.95} />
      <PersonBust x={500} y={1300} scale={1.6} expr="softSmile" armLeft="down" armRight="down" headTilt={-6} skin={SKIN1} hair={HAIR1} shirt={TERRA} breathe={localTime} />
      <div style={{ ...hand }}>
        <svg width="220" height="220" style={{ position: 'absolute', left: 730, top: 1200 }}>
          <path d="M20,180 Q20,80 100,60 Q170,45 190,90" stroke={SKIN2} strokeWidth="34" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <Cap top={480} size={56}  style={head}>Você não precisa<br />enfrentar isso sozinho.</Cap>
      <Cap top={720} size={30} color={SAGE} font={BODY_FONT} style={sub}>Pedir ajuda é o primeiro passo<br />para se sentir melhor.</Cap>
    </div>
  );
}

// ── Scene 5: Consultation ──────────────────────────────────────────────
function SceneConsultation() {
  const { localTime, dur } = useScene();
  const cap = fadeStyle(localTime, dur, { delay: 2.8, inDur: 0.6 });
  const head = fadeStyle(localTime, dur, { delay: 0.2, inDur: 0.6 });
  const bubble = popStyle(localTime, dur, { delay: 1.4, inDur: 0.5, outDur: 0.5 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: CREAM_DARK, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 260, background: '#D7B98C', opacity: 0.6 }} />
      <div style={{ position: 'absolute', left: 820, top: 300, width: 160, height: 100, background: SUN, borderRadius: '70px 70px 20px 20px', opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: 892, top: 400, width: 24, height: 220, background: '#B9835A', borderRadius: 6 }} />
      <PlantPot x={70} y={1420} size={150} />
      <div style={{ position: 'absolute', left: 220, top: 1080, width: 640, height: 300, background: '#E3D6BC', borderRadius: 24 }} />
      <PersonBust x={430} y={1300} scale={1.3} expr="listening" armLeft="restBent" armRight="down" headTilt={-4} skin={SKIN1} hair={HAIR1} shirt={BLUE} breathe={localTime * 1.1} />
      <PersonBust x={700} y={1300} scale={1.3} flip={true} expr="warmSmile" armLeft="restBent" armRight="down" headTilt={4} skin={SKIN2} hair={HAIR2} shirt="#F2EFE6" breathe={localTime * 1.1 + 1} />
      <div style={{ ...bubble }}><SpeechHeart x={475} y={1010} size={130} /></div>
      <Cap top={320} size={50} style={head}>Você não está sozinho</Cap>
      <Cap top={1560} size={40} color={INK} style={cap}>Conversar com quem entende<br />faz toda a diferença.</Cap>
    </div>
  );
}

// ── Scene 6: CTA ───────────────────────────────────────────────────────
function SceneCTA() {
  const { localTime, dur } = useScene();
  const t1 = fadeStyle(localTime, dur, { delay: 0.3, inDur: 0.6 });
  const t2 = popStyle(localTime, dur, { delay: 1.1, inDur: 0.5, outDur: 0.6 });
  const t3 = fadeStyle(localTime, dur, { delay: 1.9, inDur: 0.6, outDur: 0.6 });
  const btn = popStyle(localTime, dur, { delay: 2.6, inDur: 0.5, outDur: 0.6 });
  return (
    <div style={{ position: 'absolute', inset: 0, background: CREAM, overflow: 'hidden' }}>
      <SunRays x={190} y={220} size={220} spin={localTime * 8} />
      <PlantPot x={880} y={1560} size={170} />
      <Cap top={520} size={34} color={SAGE} font={BODY_FONT} style={t1}>Cuide de você antes que<br />o corpo cobre a conta.</Cap>
      <Cap top={700} size={62} color={INK} style={t2}>Clínica Dr. Luiz<br />Fernando Lorenci</Cap>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', ...btn }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: TERRA, color: '#fff', fontFamily: HEAD_FONT, fontWeight: 700, fontSize: 44, padding: '24px 60px', borderRadius: 100, boxShadow: '0 8px 0 ' + TERRA_DK }}>
          Agende sua consulta
        </div>
      </div>
      <Cap top={1240} size={28} color={INK} font={BODY_FONT} style={{ ...t3, opacity: (t3.opacity ?? 1) * 0.78 }}>Marque um horário e comece<br />a se cuidar hoje.</Cap>
    </div>
  );
}

function BurnoutVideoVertical() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || { motionEditor: true });
  const map = { Intro: SceneIntro, Symptoms: SceneSymptoms, Reveal: SceneReveal, Hope: SceneHope, Consultation: SceneConsultation, CTA: SceneCTA };
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#16110c' }}>
      <div style={{ height: '100%', aspectRatio: '1080/1920', maxWidth: '100%' }}>
        <SceneStage width={1080} height={1920} bg={CREAM} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} fit="contain">
          {map}
        </SceneStage>
      </div>
      <TweaksPanel>
        <TweakSection label="Vídeo" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}

Object.assign(window, { BurnoutVideoVertical });
