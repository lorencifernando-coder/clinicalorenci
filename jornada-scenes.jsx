/* Vídeo "A Jornada" — 9:16, ~29s. Paleta da clínica. */
const C = {
  ink: '#1E2B38', inkDeep: '#16202b', cta: '#C98B5E',
  cream: '#F2EDE4', white: '#FFFFFF', dim: 'rgba(255,255,255,0.55)',
};
const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', -apple-system, sans-serif";
const E = window.Easing;
const { interpolate, clamp, useScene } = window;

// helpers -----------------------------------------------------------
function fadeSlide(p, from, to, ease = E.easeOutCubic) {
  const t = ease(clamp((p - from) / (to - from), 0, 1));
  return { opacity: t, transform: `translateY(${(1 - t) * 30}px)` };
}
function fadeOutAll(p, from = 0.9) {
  return p > from ? 1 - (p - from) / (1 - from) : 1;
}
function Bg({ color = C.inkDeep, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: color, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 110px', textAlign: 'center', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
function Line({ style, children }) {
  return <h2 style={{ fontFamily: serif, fontWeight: 500, fontSize: 92, lineHeight: 1.32,
    color: C.white, margin: 0, ...style }}>{children}</h2>;
}
function Sub({ style, children }) {
  return <p style={{ fontFamily: sans, fontSize: 44, lineHeight: 1.6, color: C.dim,
    margin: 0, ...style }}>{children}</p>;
}

// SCENE 1 — o relógio -------------------------------------------------
function CenaRelogio() {
  const { progress: p } = useScene();
  const zoom = interpolate(p, [0, 1], [1, 1.08]);
  const hand = p * 720; // 2 voltas rápidas: pressa
  const out = fadeOutAll(p, 0.92);
  return (
    <Bg>
      <div style={{ opacity: out, transform: `scale(${zoom})`, display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: 70 }}>
        <div style={{ ...fadeSlide(p, 0.03, 0.18), width: 210, height: 210,
          border: '5px solid rgba(255,255,255,0.28)', borderRadius: '50%', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 6, height: 78,
            background: C.cta, transformOrigin: 'top center', transform: `rotate(${hand}deg)` }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 14, height: 14,
            background: C.cta, borderRadius: '50%', transform: 'translate(-50%,-50%)' }} />
        </div>
        <div style={fadeSlide(p, 0.16, 0.34)}>
          <Line>Você entra no consultório.<br />Mal se senta…</Line>
        </div>
        <div style={fadeSlide(p, 0.5, 0.68)}>
          <Line style={{ color: C.cta, fontSize: 76 }}>e o relógio já dita<br />o fim do seu tempo.</Line>
        </div>
      </div>
    </Bg>
  );
}

// SCENE 2 — a receita fria -------------------------------------------
function CenaReceita() {
  const { progress: p } = useScene();
  const out = fadeOutAll(p, 0.92);
  const items = ['Uma receita rápida.', 'Um aperto de mão frio.'];
  return (
    <Bg>
      <div style={{ opacity: out, display: 'flex', flexDirection: 'column', gap: 56 }}>
        {items.map((t, i) => (
          <div key={i} style={fadeSlide(p, 0.05 + i * 0.22, 0.2 + i * 0.22)}>
            <Line>{t}</Line>
          </div>
        ))}
        <div style={fadeSlide(p, 0.55, 0.72)}>
          <Line style={{ color: C.cta }}>A porta se fecha.</Line>
        </div>
      </div>
    </Bg>
  );
}

// SCENE 3 — a pergunta ------------------------------------------------
function CenaPergunta() {
  const { progress: p } = useScene();
  const out = fadeOutAll(p, 0.92);
  const zoom = interpolate(p, [0, 1], [1.06, 1]);
  return (
    <Bg>
      <div style={{ opacity: out, transform: `scale(${zoom})`, display: 'flex',
        flexDirection: 'column', gap: 64, alignItems: 'center' }}>
        <div style={fadeSlide(p, 0.04, 0.22)}>
          <Line style={{ fontSize: 104 }}>E o que você<br /><em style={{ color: C.cta }}>realmente</em> sentia?</Line>
        </div>
        <div style={fadeSlide(p, 0.45, 0.62)}>
          <Sub>Ninguém perguntou.<br />O sintoma foi mascarado — a causa continua lá.</Sub>
        </div>
      </div>
    </Bg>
  );
}

// SCENE 4 — outro caminho (vira a luz) --------------------------------
function CenaCaminho() {
  const { progress: p } = useScene();
  const out = fadeOutAll(p, 0.92);
  // linha de batimento: errática -> calma
  const dash = interpolate(p, [0.1, 0.8], [0, 1], E.easeInOutCubic);
  return (
    <Bg color={C.ink}>
      <div style={{ opacity: out, display: 'flex', flexDirection: 'column', gap: 70, alignItems: 'center' }}>
        <div style={fadeSlide(p, 0.04, 0.2)}>
          <Line style={{ color: C.cta, fontSize: 108 }}>Existe outro caminho.</Line>
        </div>
        <svg width="640" height="140" viewBox="0 0 640 140" style={{ opacity: fadeSlide(p, 0.2, 0.35).opacity }}>
          <path d="M0,70 L120,70 L150,20 L180,120 L210,40 L240,100 L270,70 L370,70 C450,70 480,50 640,60"
            fill="none" stroke={C.cta} strokeWidth="6" strokeLinecap="round"
            strokeDasharray="900" strokeDashoffset={900 - 900 * dash} />
        </svg>
        <div style={fadeSlide(p, 0.5, 0.68)}>
          <Sub style={{ color: 'rgba(255,255,255,0.7)' }}>Um médico que ouve, investiga<br />e caminha com você — sem pressa,<br />sem julgamentos.</Sub>
        </div>
      </div>
    </Bg>
  );
}

// SCENE 5 — a escuta muda tudo ----------------------------------------
function CenaEscuta() {
  const { progress: p } = useScene();
  const out = fadeOutAll(p, 0.92);
  const glow = interpolate(p, [0.2, 0.8], [0, 0.35], E.easeInOutSine);
  return (
    <Bg color={C.ink}>
      <div style={{ position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 42%, rgba(201,139,94,${glow}) 0%, transparent 62%)` }} />
      <div style={{ opacity: out, position: 'relative' }}>
        <div style={fadeSlide(p, 0.06, 0.26)}>
          <Line style={{ fontSize: 96 }}>Quando alguém<br />finalmente te escuta,</Line>
        </div>
        <div style={{ ...fadeSlide(p, 0.42, 0.6), marginTop: 48 }}>
          <Line style={{ color: C.cta, fontSize: 96 }}>a sua saúde<br />muda de direção.</Line>
        </div>
      </div>
    </Bg>
  );
}

// SCENE 6 — final com foto + CTA --------------------------------------
function CenaFinal({ scene }) {
  const { progress: p } = useScene();
  const zoom = interpolate(p, [0, 1], [1, 1.04]);
  return (
    <Bg color={C.inkDeep}>
      <div style={{ position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${C.inkDeep} 0%, ${C.ink} 100%)` }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 56, transform: `scale(${zoom})` }}>
        <div style={{ ...fadeSlide(p, 0.03, 0.2), width: 300, height: 300, borderRadius: '50%',
          overflow: 'hidden', border: `7px solid ${C.cta}`, boxShadow: '0 30px 80px rgba(0,0,0,.5)' }}>
          <img src="assets/dr-luiz-foto.png" alt="Dr. Luiz Fernando Lorenci"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '80% top' }} />
        </div>
        <div style={fadeSlide(p, 0.2, 0.38)}>
          <Line style={{ fontSize: 78 }}>Você merece um atendimento que valorize<br /><span style={{ color: C.cta }}>tudo que é importante para você!</span></Line>
        </div>
        <div style={fadeSlide(p, 0.42, 0.58)}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 42, color: C.white,
            background: C.cta, padding: '30px 68px', borderRadius: 16 }}>
            Marque a sua consulta
          </div>
        </div>
        <div style={fadeSlide(p, 0.56, 0.72)}>
          <Sub style={{ fontSize: 32 }}>Dr. Luiz Fernando Lorenci · CRMSC-41096<br />agendamento.clinicalorenci.com.br</Sub>
        </div>
      </div>
    </Bg>
  );
}

// APP ------------------------------------------------------------------
function JornadaVideo() {
  const [t, setTweak] = useTweaks(window.JORNADA_TWEAKS);
  const vertical = t.formato === '9:16 (Stories/Reels)';
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0d141c' }}>
      <div style={{ height: '100%', aspectRatio: `${W}/${H}`, maxWidth: '100%' }}>
        <SceneStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}
          bg={C.inkDeep} fit="contain">
          {{
            'Relogio': CenaRelogio,
            'Receita': CenaReceita,
            'Pergunta': CenaPergunta,
            'Caminho': CenaCaminho,
            'Escuta': CenaEscuta,
            'Final': CenaFinal,
          }}
        </SceneStage>
      </div>
      <TweaksPanel>
        <TweakSection label="Formato" />
        <TweakRadio label="Proporção" value={t.formato}
          options={['9:16 (Stories/Reels)', '16:9 (Página)']}
          onChange={(v) => setTweak('formato', v)} />
        <TweakSection label="Edição" />
        <TweakToggle label="Motion editor" value={t.motionEditor}
          onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}
window.JornadaVideo = JornadaVideo;
