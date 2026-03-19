import { useState, useEffect, useRef } from "react";

/* ───────── Design System (from Demo 01) ───────── */
const PALETTE = {
  ink: "#1a1a1a",
  inkSoft: "#3d3d3d",
  inkMuted: "#6b6b6b",
  inkFaint: "#9a9a9a",
  warmGray: "#f7f5f2",
  warmGrayDark: "#edeae5",
  parchment: "#fdfcfa",
  accent: "#c8956c",
  accentSoft: "#c8956c20",
  accentBg: "#fdf4ec",
  blue: "#4a72b0",
  green: "#5a8a6a",
  greenSoft: "#edf5f0",
  border: "#e8e4de",
  borderLight: "#f0ece6",
};

const FONT_SERIF = "'Noto Serif SC', serif";
const FONT_SANS = "'Noto Sans SC', sans-serif";

/* ───────── Data ───────── */
const COMM_STYLES = [
  { id: "direct", label: "直接干脆", desc: "结论先行，不绕弯子", icon: "⚡" },
  { id: "steady", label: "沉稳专业", desc: "有理有据，条理清晰", icon: "📐" },
  { id: "sharp", label: "犀利坦诚", desc: "敢说难听话，帮你看清", icon: "🔍" },
  { id: "adaptive", label: "随机应变", desc: "该直接直接，该委婉委婉", icon: "🎯", recommended: true },
];

const INDUSTRIES = [
  "制造业", "零售/消费", "科技/互联网", "服务业",
  "贸易/进出口", "建筑/地产", "医疗健康", "教育培训",
];
const TEAMS = ["10人以下", "10-50人", "50-200人", "200-500人", "500人以上"];
const STAGES = ["初创期（0→1）", "成长期（快速扩张）", "成熟期（稳定运营）", "转型期（业务调整）"];
const ROLES = ["创始人 / CEO", "联合创始人 / 合伙人", "业务负责人 / 高管"];

/* ───────── Styles injected ───────── */
const STYLE_TAG = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes dotBounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gentlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
.anim-fadeInUp { animation: fadeInUp 0.5s ease-out both; }
.anim-fadeIn   { animation: fadeIn 0.4s ease-out both; }
.anim-slideIn  { animation: slideInRight 0.4s ease-out both; }
.dot-bounce-1 { animation: dotBounce 1s ease-in-out infinite; }
.dot-bounce-2 { animation: dotBounce 1s ease-in-out 0.15s infinite; }
.dot-bounce-3 { animation: dotBounce 1s ease-in-out 0.3s infinite; }

/* Custom scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4cfc8; border-radius: 4px; }
`;

/* ───────── Components ───────── */

function AIAvatar({ size = 36 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full overflow-hidden" style={{ boxShadow: "0 0 0 2px #fff, 0 0 0 3px #e8e4de" }}>
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          <rect width="36" height="36" rx="18" fill="#3d3d3d"/>
          <circle cx="18" cy="14" r="5.5" fill="#7a7a7a"/>
          <ellipse cx="18" cy="29" rx="9" ry="7" fill="#7a7a7a"/>
        </svg>
      </div>
      <div className="absolute flex items-center justify-center rounded-full font-bold"
        style={{
          bottom: -1, right: -2,
          width: size * 0.44, height: size * 0.44,
          fontSize: size * 0.19,
          background: PALETTE.accent, color: "#fff",
          border: "2px solid #fff", letterSpacing: "-0.02em",
        }}>
        AI
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[1, 2, 3].map(n => (
        <span key={n} className={`dot-bounce-${n}`}
          style={{ width: 5, height: 5, borderRadius: "50%", background: PALETTE.accent, display: "inline-block" }} />
      ))}
    </span>
  );
}

function StepIndicator({ current, total, labels }) {
  return (
    <div className="flex items-center justify-center gap-6" style={{ marginTop: 28 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div style={{
            width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, fontFamily: FONT_SANS, transition: "all 0.3s",
            ...(i <= current
              ? { background: PALETTE.accent, color: "#fff" }
              : { background: PALETTE.warmGray, color: PALETTE.inkFaint, border: `1px solid ${PALETTE.border}` }),
          }}>{i + 1}</div>
          <span style={{
            fontSize: 12, fontFamily: FONT_SANS, transition: "all 0.3s",
            color: i === current ? PALETTE.accent : PALETTE.inkFaint,
            fontWeight: i === current ? 600 : 400,
          }}>{labels[i]}</span>
          {i < total - 1 && <div style={{ width: 32, height: 1, background: PALETTE.border, marginLeft: 4 }} />}
        </div>
      ))}
    </div>
  );
}

function TagButton({ selected, onClick, children, recommended }) {
  return (
    <button onClick={onClick}
      className="transition-all duration-200"
      style={{
        padding: "7px 16px", borderRadius: 10, fontSize: 13, fontFamily: FONT_SANS,
        fontWeight: selected ? 600 : 400, cursor: "pointer", position: "relative",
        border: `1.5px solid ${selected ? PALETTE.accent : PALETTE.border}`,
        background: selected ? PALETTE.accentBg : "#fff",
        color: selected ? PALETTE.accent : PALETTE.inkSoft,
        boxShadow: selected ? `0 2px 8px ${PALETTE.accentSoft}` : "none",
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = PALETTE.accentSoft; e.currentTarget.style.background = PALETTE.warmGray; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = PALETTE.border; e.currentTarget.style.background = "#fff"; } }}>
      {children}
      {recommended && !selected && (
        <span style={{ position: "absolute", top: -7, right: -4, fontSize: 9, fontWeight: 700, background: PALETTE.accent, color: "#fff", padding: "1px 6px", borderRadius: 8 }}>推荐</span>
      )}
    </button>
  );
}

function PrimaryButton({ onClick, disabled, children, fullWidth }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="transition-all duration-200"
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: "12px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
        fontFamily: FONT_SANS, cursor: disabled ? "not-allowed" : "pointer", border: "none",
        ...(disabled
          ? { background: PALETTE.warmGrayDark, color: PALETTE.inkFaint }
          : { background: PALETTE.ink, color: "#f5f5f5", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }),
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = PALETTE.accent; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = disabled ? PALETTE.warmGrayDark : PALETTE.ink; }}>
      {children}
    </button>
  );
}

/* ───────── Scene Cards (from Demo 01) ───────── */
const SCENE_CARDS = [
  {
    key: "meeting", icon: "🎙", title: "分析一场会议", subtitle: "找到你漏掉的信息",
    desc: "上传录音，AI帮你找出隐含假设、言下之意、被跳过的议题。",
    accentColor: "#d4845a", accentBg: "#fef6f0", accentBorder: "#f0d4be",
    actions: ["上传录音", "开始录制"],
  },
  {
    key: "report", icon: "📋", title: "看一份汇报", subtitle: "别被糊弄，快速回复",
    desc: "丢进来PPT/Word/PDF，AI判断意图、检测水分、帮你写回复。",
    accentColor: "#4a72b0", accentBg: "#f0f4fa", accentBorder: "#c0d0e8",
    actions: ["上传文档", "拍照上传"],
  },
  {
    key: "article", icon: "📖", title: "看一篇文章", subtitle: "变成你能用的弹药",
    desc: "粘贴链接或上传文章，AI帮你变成谈资、决策参考或转发语。",
    accentColor: "#5a8a6a", accentBg: "#f0f7f2", accentBorder: "#b8d4c2",
    actions: ["粘贴链接", "上传文章"],
  },
];

function MiniSceneCard({ scene }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="cursor-pointer transition-all duration-300"
      style={{
        borderRadius: 14, overflow: "hidden", background: "#fff",
        border: `1px solid ${hovered ? scene.accentBorder : PALETTE.border}`,
        boxShadow: hovered ? `0 6px 20px rgba(0,0,0,0.06)` : "0 1px 3px rgba(0,0,0,0.03)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}>
      <div style={{ height: 2.5, background: scene.accentColor }} />
      <div style={{ padding: "16px 18px" }}>
        <div className="flex items-start gap-3" style={{ marginBottom: 10 }}>
          <div className="flex items-center justify-center shrink-0"
            style={{ width: 40, height: 40, borderRadius: 10, background: scene.accentBg, fontSize: 20 }}>
            {scene.icon}
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF, lineHeight: 1.3 }}>{scene.title}</h3>
            <p style={{ fontSize: 12, color: PALETTE.inkMuted, marginTop: 1, fontFamily: FONT_SANS }}>{scene.subtitle}</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: PALETTE.inkMuted, lineHeight: 1.6, fontFamily: FONT_SANS }}>{scene.desc}</p>
      </div>
    </div>
  );
}


/* ───────── Main Component ───────── */
export default function OnboardingDemo() {
  const [step, setStep] = useState(0); // 0=welcome, 1=AI intro, 2=user intro, 3=conversation
  const [showAnnotations, setShowAnnotations] = useState(true);

  // AI personality settings
  const [aiName, setAiName] = useState("诸葛");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("诸葛");
  const [commStyle, setCommStyle] = useState("adaptive");

  // User profile
  const [form, setForm] = useState({ industry: "", customIndustry: "", team: "", stage: "", role: "" });

  // Animation states
  const [showIntroText, setShowIntroText] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showNameSection, setShowNameSection] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showSceneCards, setShowSceneCards] = useState(false);

  const nameInputRef = useRef(null);

  // Staggered reveal for AI intro
  useEffect(() => {
    if (step === 1) {
      setShowIntroText(false);
      setShowNameSection(false);
      setShowStylePicker(false);
      const t1 = setTimeout(() => setShowIntroText(true), 300);
      const t2 = setTimeout(() => setShowNameSection(true), 800);
      const t3 = setTimeout(() => setShowStylePicker(true), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  // Auto-focus name input
  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  // Conversation entry animation
  useEffect(() => {
    if (step === 3) {
      setTyping(true);
      setShowGreeting(false);
      setShowSceneCards(false);
      const t1 = setTimeout(() => { setTyping(false); setShowGreeting(true); }, 1500);
      const t2 = setTimeout(() => setShowSceneCards(true), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step]);

  const handleSelect = (field, value) => {
    setForm(prev => ({ ...prev, [field]: prev[field] === value ? "" : value }));
  };

  const canProceedStep2 = form.industry && form.team && form.stage && form.role
    && (form.industry !== "其他" || form.customIndustry.trim());

  const handleNameConfirm = () => {
    if (tempName.trim()) setAiName(tempName.trim());
    setEditingName(false);
  };

  const selectedStyle = COMM_STYLES.find(s => s.id === commStyle);

  const getGreetingText = () => {
    const industry = form.industry === "其他" ? form.customIndustry : form.industry;
    const roleShort = form.role.split(" ")[0];
    const styleFlavor = {
      direct: "有事直接说，不浪费你时间。",
      steady: "有什么需要帮你看的，随时丢过来。",
      sharp: "有什么需要帮你盯的，我不会客气。",
      adaptive: "有事就说，我们慢慢磨合。",
    };
    return (
      <>
        你好。我是<span style={{ fontFamily: FONT_SERIF, fontWeight: 600, color: PALETTE.ink }}>{aiName}</span>，
        {industry ? `${industry}的${roleShort}` : "老板"}，以后你的事就是我的事。
        <br /><br />
        {styleFlavor[commStyle]}
        <br /><br />
        试试把一份汇报丢给我，或者直接聊聊你现在脑子里最乱的一件事。
      </>
    );
  };

  return (
    <>
      <style>{STYLE_TAG}</style>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: PALETTE.parchment, fontFamily: FONT_SANS }}>

        {/* ─── Top Bar ─── */}
        <div className="shrink-0 flex items-center justify-between"
          style={{ padding: "8px 20px", borderBottom: `1px solid ${PALETTE.border}`, background: "#fff" }}>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF }}>Demo 2/6</h1>
            <span style={{ fontSize: 12, color: PALETTE.inkMuted }}>新用户引导</span>
          </div>
          <label className="flex items-center gap-2" style={{ fontSize: 12, color: PALETTE.inkMuted, cursor: "pointer" }}>
            <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)}
              style={{ accentColor: PALETTE.accent }} />
            显示设计批注
          </label>
        </div>

        {/* ─── Main Content ─── */}
        <div className="flex-1 overflow-y-auto" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
          <div style={{ width: "100%", maxWidth: 520 }}>

            {/* ═══════ Step 0: Welcome ═══════ */}
            {step === 0 && (
              <div className="anim-fadeInUp" style={{ textAlign: "center" }}>
                {showAnnotations && (
                  <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 10, padding: "8px 14px", marginBottom: 28, textAlign: "left", lineHeight: 1.6 }}>
                    📌 <strong>欢迎页</strong>：一句话建立期待，触达情感而非理性。不解释功能，不列清单。
                  </div>
                )}

                <AIAvatar size={72} />

                <h1 style={{ fontSize: 28, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF, marginTop: 28, lineHeight: 1.4 }}>
                  从今天起，<br />你不再是一个人扛。
                </h1>
                <p style={{ fontSize: 15, color: PALETTE.inkMuted, marginTop: 12, lineHeight: 1.7 }}>
                  专为老板打造的AI合伙人。越用越懂你，最终代表你。
                </p>

                <div style={{ marginTop: 36 }}>
                  <PrimaryButton onClick={() => setStep(1)}>让我们认识一下</PrimaryButton>
                </div>
              </div>
            )}

            {/* ═══════ Step 1: AI Introduces Itself ═══════ */}
            {step === 1 && (
              <div className="anim-fadeIn">
                {showAnnotations && (
                  <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 10, padding: "8px 14px", marginBottom: 20, lineHeight: 1.6 }}>
                    📌 <strong>阶段一：AI先亮牌</strong>。先交出信息，用户再决定要不要交——建立信任的基本礼仪。<br/>
                    展示性格而非功能列表。昵称默认「诸葛」但允许修改。沟通风格先体验再调整。
                  </div>
                )}

                <div style={{
                  background: "#fff", borderRadius: 20, overflow: "hidden",
                  border: `1px solid ${PALETTE.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "24px 28px 20px", borderBottom: `1px solid ${PALETTE.borderLight}`,
                    background: `linear-gradient(135deg, ${PALETTE.warmGray}, ${PALETTE.parchment})`,
                  }}>
                    <div className="flex items-center gap-4">
                      <AIAvatar size={48} />
                      <div>
                        <div style={{ fontSize: 11, color: PALETTE.inkFaint, fontWeight: 500, letterSpacing: "0.05em", marginBottom: 2 }}>
                          你的AI合伙人
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF }}>
                          先介绍一下我自己
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "24px 28px 28px" }}>
                    {/* AI Self-Introduction Text */}
                    {showIntroText && (
                      <div className="anim-fadeInUp" style={{
                        background: PALETTE.warmGray, borderRadius: "16px 16px 16px 4px",
                        padding: "16px 20px", fontSize: 14, color: PALETTE.inkSoft, lineHeight: 1.8,
                        border: `1px solid ${PALETTE.borderLight}`, marginBottom: 24,
                      }}>
                        我会帮你盯会议里漏掉的信号，拆汇报里藏着的水分，把文章变成你能直接用的弹药。
                        <br /><br />
                        <span style={{ color: PALETTE.ink, fontWeight: 500 }}>我会直说，不绕弯。</span>你汇报里有漏洞我会指出来，你会议上漏听了什么我会告诉你。觉得不合适，随时调。
                      </div>
                    )}

                    {/* Name Section */}
                    {showNameSection && (
                      <div className="anim-fadeInUp" style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 10 }}>
                          你可以叫我
                        </div>
                        <div className="flex items-center gap-3">
                          {editingName ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input ref={nameInputRef} value={tempName}
                                onChange={e => setTempName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleNameConfirm()}
                                maxLength={8}
                                style={{
                                  flex: 1, padding: "10px 16px", borderRadius: 10, fontSize: 16, fontWeight: 600,
                                  fontFamily: FONT_SERIF, color: PALETTE.ink, border: `2px solid ${PALETTE.accent}`,
                                  background: PALETTE.accentBg, outline: "none",
                                }} />
                              <button onClick={handleNameConfirm}
                                style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: PALETTE.ink, color: "#fff", border: "none", cursor: "pointer" }}>
                                确定
                              </button>
                              <button onClick={() => { setEditingName(false); setTempName(aiName); }}
                                style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, color: PALETTE.inkMuted, background: PALETTE.warmGray, border: `1px solid ${PALETTE.border}`, cursor: "pointer" }}>
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span style={{
                                fontSize: 22, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF,
                                background: PALETTE.warmGray, padding: "8px 20px", borderRadius: 12,
                                border: `1px solid ${PALETTE.border}`,
                              }}>
                                {aiName}
                              </span>
                              <button onClick={() => { setEditingName(true); setTempName(aiName); }}
                                className="transition-all duration-200"
                                style={{
                                  fontSize: 12, color: PALETTE.inkFaint, background: "none",
                                  border: `1px solid ${PALETTE.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = PALETTE.accent; e.currentTarget.style.borderColor = PALETTE.accent; }}
                                onMouseLeave={e => { e.currentTarget.style.color = PALETTE.inkFaint; e.currentTarget.style.borderColor = PALETTE.border; }}>
                                ✏️ 改个名字
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Communication Style */}
                    {showStylePicker && (
                      <div className="anim-fadeInUp">
                        <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 4 }}>
                          我跟你说话的方式
                        </div>
                        <p style={{ fontSize: 12, color: PALETTE.inkFaint, marginBottom: 14, lineHeight: 1.5 }}>
                          选一个默认风格，用着不合适随时换
                        </p>

                        <div className="flex flex-col gap-2">
                          {COMM_STYLES.map(style => {
                            const isSelected = commStyle === style.id;
                            return (
                              <button key={style.id} onClick={() => setCommStyle(style.id)}
                                className="transition-all duration-200"
                                style={{
                                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                                  borderRadius: 14, cursor: "pointer", textAlign: "left", width: "100%",
                                  border: `1.5px solid ${isSelected ? PALETTE.accent : PALETTE.border}`,
                                  background: isSelected ? PALETTE.accentBg : "#fff",
                                  boxShadow: isSelected ? `0 2px 12px ${PALETTE.accentSoft}` : "none",
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#d4cfc8"; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = PALETTE.border; }}>
                                <span style={{ fontSize: 22, width: 36, textAlign: "center" }}>{style.icon}</span>
                                <div style={{ flex: 1 }}>
                                  <div className="flex items-center gap-2">
                                    <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? PALETTE.accent : PALETTE.ink, fontFamily: FONT_SANS }}>
                                      {style.label}
                                    </span>
                                    {style.recommended && (
                                      <span style={{
                                        fontSize: 10, fontWeight: 600, padding: "1px 8px", borderRadius: 8,
                                        background: isSelected ? PALETTE.accent : PALETTE.warmGrayDark,
                                        color: isSelected ? "#fff" : PALETTE.inkFaint,
                                      }}>推荐</span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: 12, color: isSelected ? PALETTE.accent : PALETTE.inkMuted, marginTop: 2, display: "block" }}>
                                    {style.desc}
                                  </span>
                                </div>
                                <div style={{
                                  width: 20, height: 20, borderRadius: 10, border: `2px solid ${isSelected ? PALETTE.accent : PALETTE.border}`,
                                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  background: isSelected ? PALETTE.accent : "#fff",
                                }}>
                                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ marginTop: 24 }}>
                          <PrimaryButton onClick={() => setStep(2)} fullWidth>
                            好的，轮到我了 →
                          </PrimaryButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ Step 2: User Introduces Self ═══════ */}
            {step === 2 && (
              <div className="anim-fadeIn">
                {showAnnotations && (
                  <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 10, padding: "8px 14px", marginBottom: 20, lineHeight: 1.6 }}>
                    📌 <strong>阶段二：用户亮牌</strong>。全部选择题，30秒搞定。行业支持自定义"其他"。<br/>
                    角色信息影响AI的回复风格：创始人和职业经理人的"扛事"方式不一样。
                  </div>
                )}

                <div style={{
                  background: "#fff", borderRadius: 20, overflow: "hidden",
                  border: `1px solid ${PALETTE.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "24px 28px 20px", borderBottom: `1px solid ${PALETTE.borderLight}`,
                    background: `linear-gradient(135deg, ${PALETTE.warmGray}, ${PALETTE.parchment})`,
                  }}>
                    <div className="flex items-center gap-4">
                      <div style={{
                        width: 48, height: 48, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
                        background: `linear-gradient(135deg, ${PALETTE.accent}, #a07050)`, color: "#fff", fontSize: 22, fontWeight: 700,
                      }}>你</div>
                      <div>
                        <div style={{ fontSize: 11, color: PALETTE.inkFaint, fontWeight: 500, letterSpacing: "0.05em", marginBottom: 2 }}>
                          轮到你了
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF }}>
                          说说你的情况
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: PALETTE.inkMuted, marginTop: 10, lineHeight: 1.6 }}>
                      这些信息帮{aiName}更快懂你的处境。选几个就行，30秒搞定。
                    </p>
                  </div>

                  <div style={{ padding: "24px 28px 28px" }}>
                    {/* Role */}
                    <div style={{ marginBottom: 22 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 10, display: "block" }}>
                        你的角色
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map(r => (
                          <TagButton key={r} selected={form.role === r} onClick={() => handleSelect("role", r)}>
                            {r}
                          </TagButton>
                        ))}
                      </div>
                    </div>

                    {/* Industry */}
                    <div style={{ marginBottom: 22 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 10, display: "block" }}>
                        你的行业
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[...INDUSTRIES, "其他"].map(i => (
                          <TagButton key={i} selected={form.industry === i} onClick={() => handleSelect("industry", i)}>
                            {i}
                          </TagButton>
                        ))}
                      </div>
                      {form.industry === "其他" && (
                        <div className="anim-fadeIn" style={{ marginTop: 10 }}>
                          <input value={form.customIndustry}
                            onChange={e => setForm(prev => ({ ...prev, customIndustry: e.target.value }))}
                            placeholder="输入你的行业，比如：宠物殡葬、跨境直播…"
                            style={{
                              width: "100%", padding: "10px 16px", borderRadius: 10, fontSize: 13,
                              fontFamily: FONT_SANS, color: PALETTE.ink,
                              border: `1.5px solid ${PALETTE.border}`, outline: "none", background: PALETTE.warmGray,
                              boxSizing: "border-box",
                            }}
                            onFocus={e => e.target.style.borderColor = PALETTE.accent}
                            onBlur={e => e.target.style.borderColor = PALETTE.border} />
                        </div>
                      )}
                    </div>

                    {/* Team Size */}
                    <div style={{ marginBottom: 22 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 10, display: "block" }}>
                        团队规模
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TEAMS.map(t => (
                          <TagButton key={t} selected={form.team === t} onClick={() => handleSelect("team", t)}>
                            {t}
                          </TagButton>
                        ))}
                      </div>
                    </div>

                    {/* Stage */}
                    <div style={{ marginBottom: 28 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 10, display: "block" }}>
                        业务阶段
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {STAGES.map(s => (
                          <TagButton key={s} selected={form.stage === s} onClick={() => handleSelect("stage", s)}>
                            {s}
                          </TagButton>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <PrimaryButton onClick={() => setStep(3)} disabled={!canProceedStep2} fullWidth>
                      开始合作
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ Step 3: First Conversation ═══════ */}
            {step === 3 && (
              <div className="anim-fadeIn" style={{
                background: "#fff", borderRadius: 20, overflow: "hidden",
                border: `1px solid ${PALETTE.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                maxWidth: 480, margin: "0 auto",
              }}>
                {showAnnotations && (
                  <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderBottom: `1px solid ${PALETTE.borderLight}`, padding: "8px 16px", lineHeight: 1.6 }}>
                    📌 <strong>进入对话</strong>：AI用昵称+选定风格主动开场。问候语整合用户行业和角色信息。<br/>
                    空状态展示三个场景卡片，降低首次使用门槛。
                  </div>
                )}

                {/* Chat Header */}
                <div className="flex items-center gap-3" style={{ padding: "12px 20px", borderBottom: `1px solid ${PALETTE.borderLight}` }}>
                  <AIAvatar size={32} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 700, color: PALETTE.ink, fontFamily: FONT_SERIF }}>{aiName}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, background: PALETTE.accentBg, color: PALETTE.accent, padding: "1px 5px", borderRadius: 3 }}>AI</span>
                      <span style={{ fontSize: 10, fontWeight: 500, background: PALETTE.greenSoft, color: PALETTE.green, padding: "2px 8px", borderRadius: 10 }}>在线</span>
                    </div>
                    <span style={{ fontSize: 11, color: PALETTE.inkFaint }}>{selectedStyle?.icon} {selectedStyle?.label}</span>
                  </div>
                </div>

                {/* Chat Body */}
                <div style={{ padding: "20px 20px 16px", minHeight: 360 }}>
                  {/* AI Greeting */}
                  <div className="flex items-start gap-2.5" style={{ marginBottom: 16 }}>
                    <AIAvatar size={24} />
                    <div>
                      <span style={{ fontSize: 11, color: PALETTE.inkFaint, fontWeight: 500 }}>{aiName}</span>
                      <div style={{
                        background: PALETTE.warmGray, borderRadius: "14px 14px 14px 4px",
                        padding: "14px 18px", fontSize: 13.5, color: PALETTE.inkSoft, lineHeight: 1.75,
                        maxWidth: 360, border: `1px solid ${PALETTE.borderLight}`, marginTop: 4,
                      }}>
                        {typing ? <TypingDots /> : showGreeting ? getGreetingText() : null}
                      </div>
                    </div>
                  </div>

                  {/* Scene Cards */}
                  {showSceneCards && (
                    <div className="flex flex-col gap-2.5 anim-fadeInUp" style={{ marginTop: 8 }}>
                      {SCENE_CARDS.map(s => <MiniSceneCard key={s.key} scene={s} />)}
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${PALETTE.borderLight}` }}>
                  <div className="flex items-center gap-2">
                    <div style={{
                      flex: 1, background: PALETTE.warmGray, border: `1px solid ${PALETTE.border}`, borderRadius: 12,
                      padding: "10px 16px", fontSize: 13, color: PALETTE.inkFaint,
                    }}>
                      聊聊你现在脑子里最乱的一件事…
                    </div>
                    <button className="transition-all duration-200" style={{
                      background: PALETTE.ink, color: "#f5f5f5", borderRadius: 12, padding: "10px 18px",
                      fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = PALETTE.accent}
                      onMouseLeave={e => e.currentTarget.style.background = PALETTE.ink}>
                      发送
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step Indicator ─── */}
            <StepIndicator current={step} total={4}
              labels={["欢迎", "认识AI", "介绍自己", "开始对话"]} />

            {/* ─── Quick Nav ─── */}
            <div className="flex justify-center gap-2" style={{ marginTop: 16 }}>
              {[0, 1, 2, 3].map(s => (
                <button key={s} onClick={() => setStep(s)}
                  className="transition-all duration-200"
                  style={{
                    width: step === s ? 20 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                    background: step === s ? PALETTE.accent : PALETTE.warmGrayDark,
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
