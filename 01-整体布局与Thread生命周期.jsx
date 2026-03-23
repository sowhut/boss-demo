import { useState, useEffect, useRef } from "react";

/* ───────── Refined Design System ───────── */
const PALETTE = {
  ink: "#1a1a1a",
  inkSoft: "#3d3d3d",
  inkMuted: "#6b6b6b",
  inkFaint: "#9a9a9a",
  warmGray: "#f7f5f2",
  warmGrayDark: "#edeae5",
  parchment: "#fdfcfa",
  sidebar: "#1e1e1e",
  sidebarHover: "#2a2a2a",
  sidebarActive: "#333333",
  accent: "#c8956c",      // warm amber/gold
  accentSoft: "#c8956c20",
  accentBg: "#fdf4ec",
  blue: "#4a72b0",
  blueSoft: "#4a72b015",
  green: "#5a8a6a",
  greenSoft: "#edf5f0",
  red: "#c45c5c",
  border: "#e8e4de",
  borderLight: "#f0ece6",
};

/* ───────── Data ───────── */
const THREADS = [
  { id: 1, type: "meeting", icon: "🎙", title: "今天的销售周会", status: "recording", time: "进行中", summary: "正在录音..." },
  { id: 2, type: "report", icon: "📋", title: "张总的Q2汇报", status: "active", time: "10分钟前", summary: "可信度中等，第二部分数据口径有变化" },
  { id: 3, type: "article", icon: "📖", title: "消费降级趋势文章", status: "active", time: "1小时前", summary: "如果趋势成立，你的高端线需要重新评估" },
];

const ARCHIVED = [
  { id: 4, type: "meeting", icon: "🎙", title: "上周产品评审会", status: "archived", time: "3天前", summary: "团队对新功能优先级存在分歧" },
  { id: 5, type: "report", icon: "📋", title: "李总的月度汇报", status: "archived", time: "5天前", summary: "承诺激进，交付打折的模式再次出现" },
];

const MESSAGES = [
  { role: "ai", text: "夏总，我刚看完你上午转的那篇消费降级的文章，有个判断想跟你碰一下。先处理完张总的汇报再聊？" },
  { role: "user", text: "帮我看看张总发过来的Q2汇报" },
  { role: "ai", text: "收到，正在分析张总的Q2汇报...", card: { type: "report", title: "张总的Q2汇报", judgment: "他想让你批15万预算。可信度中等——第二部分的数据口径和上周不一致，建议重点看。", actions: ["展开看看", "聊聊这份汇报"] } },
  { role: "ai", text: "刚才的会议，李总对新业务的态度和上次明显不同——上次主动请缨，这次全程没接话。", card: { type: "meeting", title: "今天的销售周会", judgment: "团队在预算分配上没有达成真正共识。张总全程未表态。", actions: ["展开看看", "聊聊这场会议"] } },
];

const AI_STATUS_OPTIONS = [
  { emoji: "🔥", text: "刚读完3份行业报告，有新想法" },
  { emoji: "🧠", text: "在想你上次说的渠道复用问题" },
  { emoji: "📊", text: "盯着张总最近三份汇报看规律" },
  { emoji: "⚡", text: "今天状态不错，随时开聊" },
  { emoji: "🎯", text: "只站你这边" },
];

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

/* ───────── CSS keyframes injected once ───────── */
const STYLE_TAG = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
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
@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.anim-fadeInUp { animation: fadeInUp 0.5s ease-out both; }
.anim-fadeIn   { animation: fadeIn 0.4s ease-out both; }
.dot-bounce-1 { animation: dotBounce 1s ease-in-out infinite; }
.dot-bounce-2 { animation: dotBounce 1s ease-in-out 0.15s infinite; }
.dot-bounce-3 { animation: dotBounce 1s ease-in-out 0.3s infinite; }
.pulse-glow   { animation: pulseGlow 2s ease-in-out infinite; }
`;

/* ───────── Components ───────── */

function AIAvatar({ size = 32, className = "" }) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
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
          background: PALETTE.accent,
          color: "#fff",
          border: "2px solid #fff",
          letterSpacing: "-0.02em",
        }}>
        AI
      </div>
    </div>
  );
}

function AIAvatarSmall() {
  return <AIAvatar size={22} />;
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-0.5">
      <div className="flex gap-1">
        <span className="dot-bounce-1" style={{ width: 4, height: 4, borderRadius: "50%", background: PALETTE.accent, display: "inline-block" }} />
        <span className="dot-bounce-2" style={{ width: 4, height: 4, borderRadius: "50%", background: PALETTE.accent, display: "inline-block" }} />
        <span className="dot-bounce-3" style={{ width: 4, height: 4, borderRadius: "50%", background: PALETTE.accent, display: "inline-block" }} />
      </div>
      <span style={{ fontSize: 12, color: PALETTE.inkMuted, fontFamily: "'Noto Sans SC', sans-serif" }}>
        {name} 正在思考…
      </span>
    </div>
  );
}

function ThreadItem({ thread, isActive, onClick, onArchive }) {
  const statusColors = { recording: PALETTE.red, active: PALETTE.green, archived: PALETTE.inkFaint };
  return (
    <div onClick={onClick}
      className="group flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
      style={{
        background: isActive ? PALETTE.sidebarActive : "transparent",
        ...(isActive ? { boxShadow: `inset 3px 0 0 ${PALETTE.accent}` } : {}),
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = PALETTE.sidebarHover; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
      <span className="text-lg mt-0.5 shrink-0">{thread.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={thread.status === "recording" ? "pulse-glow" : ""}
            style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[thread.status], display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e0e0e0", fontFamily: "'Noto Sans SC', sans-serif" }} className="truncate">{thread.title}</span>
        </div>
        <p style={{ fontSize: 11, color: "#888", marginTop: 2, fontFamily: "'Noto Sans SC', sans-serif" }} className="truncate">{thread.summary}</p>
        <span style={{ fontSize: 11, color: "#666" }}>{thread.time}</span>
      </div>
      {thread.status === "active" && onArchive && (
        <button onClick={e => { e.stopPropagation(); onArchive(thread.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#666", fontSize: 11, marginTop: 4 }}>✕</button>
      )}
    </div>
  );
}

function SceneCard({ card }) {
  const labels = { meeting: "会议分析", report: "汇报解读", article: "文章提炼" };
  const icons = { meeting: "🎙", report: "📋", article: "📖" };
  return (
    <div className="anim-fadeInUp" style={{
      background: PALETTE.parchment, border: `1px solid ${PALETTE.border}`, borderRadius: 14,
      padding: "14px 16px", marginTop: 8, maxWidth: 420, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icons[card.type]}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: PALETTE.inkFaint, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Noto Sans SC', sans-serif" }}>{labels[card.type]}</span>
      </div>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink, fontFamily: "'Noto Serif SC', serif" }}>{card.title}</h4>
      <p style={{ fontSize: 13, color: PALETTE.inkSoft, marginTop: 6, lineHeight: 1.6, fontFamily: "'Noto Sans SC', sans-serif" }}>{card.judgment}</p>
      <div className="flex gap-2" style={{ marginTop: 12 }}>
        {card.actions.map((a, i) => (
          <button key={i} className="transition-all duration-200"
            style={{
              fontSize: 12, padding: "5px 14px", borderRadius: 20, fontWeight: 500, cursor: "pointer", border: "none",
              fontFamily: "'Noto Sans SC', sans-serif",
              ...(i === 0
                ? { background: PALETTE.ink, color: "#fff" }
                : { background: "#fff", color: PALETTE.inkSoft, border: `1px solid ${PALETTE.border}` }),
            }}
            onMouseEnter={e => { if (i === 0) e.currentTarget.style.background = PALETTE.accent; }}
            onMouseLeave={e => { if (i === 0) e.currentTarget.style.background = PALETTE.ink; }}
          >{a}</button>
        ))}
      </div>
    </div>
  );
}

function EmptyStateSceneCard({ scene, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="anim-fadeInUp cursor-pointer transition-all duration-300"
      style={{
        animationDelay: `${index * 100 + 200}ms`,
        borderRadius: 16, overflow: "hidden",
        background: "#fff",
        border: `1px solid ${hovered ? scene.accentBorder : PALETTE.border}`,
        boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${scene.accentBorder}` : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}>
      {/* top accent bar */}
      <div style={{ height: 3, background: scene.accentColor }} />
      <div style={{ padding: "20px 22px" }}>
        <div className="flex items-start gap-3.5" style={{ marginBottom: 12 }}>
          <div className="transition-transform duration-300 flex items-center justify-center shrink-0"
            style={{
              width: 48, height: 48, borderRadius: 12, background: scene.accentBg, fontSize: 24,
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}>
            {scene.icon}
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, fontFamily: "'Noto Serif SC', serif", lineHeight: 1.3 }}>{scene.title}</h3>
            <p style={{ fontSize: 13, color: PALETTE.inkMuted, marginTop: 2, fontFamily: "'Noto Sans SC', sans-serif" }}>{scene.subtitle}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: PALETTE.inkMuted, lineHeight: 1.65, marginBottom: 16, fontFamily: "'Noto Sans SC', sans-serif" }}>{scene.desc}</p>
        <div className="flex gap-2">
          {scene.actions.map((a, i) => (
            <button key={i} className="transition-all duration-200" style={{
              fontSize: 12, padding: "7px 16px", borderRadius: 8, fontWeight: 500, cursor: "pointer", border: "none",
              fontFamily: "'Noto Sans SC', sans-serif",
              ...(i === 0
                ? { background: scene.accentColor, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }
                : { background: PALETTE.warmGray, color: PALETTE.inkSoft }),
            }}
              onMouseEnter={e => { if (i === 0) e.currentTarget.style.opacity = "0.88"; else e.currentTarget.style.background = PALETTE.warmGrayDark; }}
              onMouseLeave={e => { if (i === 0) e.currentTarget.style.opacity = "1"; else e.currentTarget.style.background = PALETTE.warmGray; }}
            >{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── Main ───────── */

export default function LayoutDemo() {
  const [userMode, setUserMode] = useState("new");
  const [activeNav, setActiveNav] = useState("chat");
  const [activeThread, setActiveThread] = useState(null);
  const [threads, setThreads] = useState(THREADS);
  const [showArchived, setShowArchived] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [aiStatus, setAiStatus] = useState(AI_STATUS_OPTIONS[0]);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const aiName = "诸葛";
  const isNew = userMode === "new";

  useEffect(() => { setActiveThread(null); setActiveNav("chat"); setShowArchived(false); setShowStatusPicker(false); }, [userMode]);
  useEffect(() => { const t = setInterval(() => setIsTyping(p => !p), 4500); return () => clearInterval(t); }, []);

  return (
    <>
      <style>{STYLE_TAG}</style>
      <div className="h-screen flex flex-col" style={{ fontFamily: "'Noto Sans SC', -apple-system, sans-serif", background: PALETTE.sidebar }}>

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between shrink-0" style={{ background: "#161616", borderBottom: "1px solid #2a2a2a", padding: "7px 16px" }}>
          <h1 style={{ color: "#ccc", fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em", fontFamily: "'Noto Sans SC', sans-serif" }}>
            Demo 1/8 · 整体布局与Thread生命周期
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex" style={{ background: "#2a2a2a", borderRadius: 8, padding: 2 }}>
              {[{ key: "new", label: "新用户" }, { key: "existing", label: "老用户" }].map(m => (
                <button key={m.key} onClick={() => setUserMode(m.key)}
                  style={{
                    padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                    fontFamily: "'Noto Sans SC', sans-serif", transition: "all 0.15s",
                    ...(userMode === m.key ? { background: PALETTE.accent, color: "#fff" } : { background: "transparent", color: "#888" }),
                  }}>{m.label}</button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: 12, color: "#777" }}>
              <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)}
                style={{ accentColor: PALETTE.accent, width: 13, height: 13 }} />
              批注
            </label>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* ══════════ Sidebar ══════════ */}
          <div className="flex flex-col shrink-0" style={{ width: 256, background: PALETTE.sidebar, borderRight: "1px solid #2a2a2a" }}>
            {/* Nav */}
            <div style={{ padding: 12, borderBottom: "1px solid #2a2a2a" }}>
              {showAnnotations && <div style={{ fontSize: 11, color: PALETTE.accent, background: "#2a2218", border: "1px solid #3a2e1e", borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>📌 固定区：「我是谁」</div>}
              <div className="flex flex-col gap-0.5">
                {[
                  { key: "chat", icon: "💬", label: "对话", badge: null },
                  { key: "people", icon: "👥", label: "人脉", badge: "内测" },
                  { key: "matters", icon: "🗂", label: "事项", badge: "内测" },
                  { key: "network", icon: "🔗", label: "人脉圈", badge: "Vision" },
                ].map(item => (
                  <button key={item.key} onClick={() => {
                    if (item.key === "chat") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "01" } }));
                    }
                    if (item.key === "people") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "06" } }));
                      return;
                    }
                    if (item.key === "matters") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "07" } }));
                      return;
                    }
                    if (item.key === "network") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "08" } }));
                      return;
                    }
                    setActiveNav(item.key);
                    setActiveThread(null);
                  }}
                    className="flex items-center gap-2.5 transition-all duration-150"
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                      border: "none", cursor: "pointer", textAlign: "left",
                      fontFamily: "'Noto Sans SC', sans-serif",
                      ...(activeNav === item.key
                        ? { background: PALETTE.sidebarActive, color: "#fff", boxShadow: `inset 3px 0 0 ${PALETTE.accent}` }
                        : { background: "transparent", color: "#aaa" }),
                    }}
                    onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = PALETTE.sidebarHover; }}
                    onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span style={{ marginLeft: "auto", fontSize: 10, background: "#333", color: "#888", padding: "2px 6px", borderRadius: 4 }}>{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Thread area */}
            <div className="flex-1 overflow-y-auto" style={{ padding: 12 }}>
              {showAnnotations && <div style={{ fontSize: 11, color: PALETTE.accent, background: "#2a2218", border: "1px solid #3a2e1e", borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>📌 动态区：{isNew ? "空态" : "活跃Thread"}</div>}
              {isNew ? (
                <div className="flex flex-col items-center justify-center text-center" style={{ paddingTop: 48, paddingBottom: 48 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 18, marginBottom: 12 }}>✦</div>
                  <p style={{ fontSize: 13, color: "#777", fontWeight: 500, marginBottom: 4 }}>还没有进行中的任务</p>
                  <p style={{ fontSize: 11, color: "#555", lineHeight: 1.6, padding: "0 8px" }}>从右侧选一个场景开始，<br/>或者直接聊聊你在想的事</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 10, color: "#666", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8, paddingLeft: 4, textTransform: "uppercase" }}>进行中</div>
                  <div className="flex flex-col gap-0.5">
                    {threads.map(t => <ThreadItem key={t.id} thread={t} isActive={activeThread === t.id}
                      onClick={() => { setActiveThread(t.id); setActiveNav("chat"); }} onArchive={(id) => setThreads(p => p.filter(x => x.id !== id))} />)}
                  </div>
                  {threads.length === 0 && <p style={{ fontSize: 12, color: "#555", textAlign: "center", padding: "16px 0" }}>没有进行中的任务</p>}
                  <button onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ width: "100%", fontSize: 11, color: "#666", marginTop: 16, paddingLeft: 4, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ transition: "transform 0.2s", transform: showArchived ? "rotate(90deg)" : "rotate(0)", display: "inline-block" }}>▶</span>
                    已完成（{ARCHIVED.length}）
                  </button>
                  {showArchived && (
                    <div className="flex flex-col gap-0.5" style={{ marginTop: 4, opacity: 0.55 }}>
                      {ARCHIVED.map(t => <ThreadItem key={t.id} thread={t} isActive={activeThread === t.id} onClick={() => setActiveThread(t.id)} />)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User */}
            <div style={{ padding: 12, borderTop: "1px solid #2a2a2a" }}>
              <div className="flex items-center gap-2.5">
                <div style={{
                  width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `linear-gradient(135deg, ${PALETTE.accent}, #a07050)`, color: "#fff", fontSize: 13, fontWeight: 700,
                }}>{isNew ? "新" : "夏"}</div>
                <div>
                  <div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 500 }}>{isNew ? "新用户" : "夏总"}</div>
                  <div style={{ fontSize: 11, color: "#777" }}>{isNew ? "刚刚加入" : "制造业 · 50人团队"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ Main ══════════ */}
          <div className="flex-1 flex flex-col min-w-0" style={{ background: PALETTE.parchment }}>

            {activeNav === "chat" && !activeThread && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between shrink-0" style={{ padding: "12px 28px", borderBottom: `1px solid ${PALETTE.border}` }}>
                  <div className="flex items-center gap-3">
                    <AIAvatar size={38} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, fontFamily: "'Noto Serif SC', serif", letterSpacing: "-0.01em" }}>{aiName}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, background: PALETTE.accentBg, color: PALETTE.accent, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.02em" }}>AI</span>
                        <span style={{ fontSize: 10, fontWeight: 500, background: PALETTE.greenSoft, color: PALETTE.green, padding: "2px 8px", borderRadius: 10 }}>在线</span>
                      </div>
                      <button onClick={() => setShowStatusPicker(!showStatusPicker)}
                        className="group flex items-center gap-1 transition-colors"
                        style={{ fontSize: 12, color: PALETTE.inkFaint, marginTop: 2, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <span>{aiStatus.emoji}</span>
                        <span className="group-hover:underline">{aiStatus.text}</span>
                      </button>
                    </div>
                  </div>
                  {!isNew && (
                    <button className="transition-all duration-200" style={{
                      fontSize: 13, color: PALETTE.inkMuted, border: `1px solid ${PALETTE.border}`, borderRadius: 10,
                      padding: "6px 14px", background: "#fff", cursor: "pointer", fontFamily: "'Noto Sans SC', sans-serif",
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = PALETTE.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = PALETTE.border}>
                      📜 历史
                    </button>
                  )}
                </div>

                {/* Status picker */}
                {showStatusPicker && (
                  <div className="anim-fadeIn" style={{ margin: "8px 28px 0" }}>
                    {showAnnotations && <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, border: `1px solid ${PALETTE.accentBg}`, borderRadius: 8, padding: "8px 12px", marginBottom: 8, lineHeight: 1.6 }}>
                      📌 <strong>AI自设状态</strong>：类似飞书/钉钉个人状态。AI根据近期工作动态自动设定。<br/>核心感知：你的合伙人一直在为你工作。
                    </div>}
                    <div style={{ background: "#fff", border: `1px solid ${PALETTE.border}`, borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                      <div style={{ fontSize: 11, color: PALETTE.inkMuted, fontWeight: 600, marginBottom: 8 }}>{aiName}的当前状态</div>
                      <div className="flex flex-col gap-1">
                        {AI_STATUS_OPTIONS.map((opt, i) => (
                          <button key={i} onClick={() => { setAiStatus(opt); setShowStatusPicker(false); }}
                            className="flex items-center gap-2 transition-all duration-150"
                            style={{
                              width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 13, textAlign: "left",
                              border: "none", cursor: "pointer", fontFamily: "'Noto Sans SC', sans-serif",
                              ...(aiStatus.text === opt.text
                                ? { background: PALETTE.accentBg, color: PALETTE.accent, fontWeight: 500 }
                                : { background: "transparent", color: PALETTE.inkSoft }),
                            }}
                            onMouseEnter={e => { if (aiStatus.text !== opt.text) e.currentTarget.style.background = PALETTE.warmGray; }}
                            onMouseLeave={e => { if (aiStatus.text !== opt.text) e.currentTarget.style.background = "transparent"; }}>
                            <span>{opt.emoji}</span><span>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${PALETTE.borderLight}`, fontSize: 11, color: PALETTE.inkFaint }}>
                        💡 状态由{aiName}根据近期工作自动更新
                      </div>
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto" style={{ padding: "24px 28px" }} onClick={() => showStatusPicker && setShowStatusPicker(false)}>
                  {isNew ? (
                    <div style={{ maxWidth: 520, margin: "0 auto" }}>
                      {showAnnotations && <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 10, padding: "10px 14px", marginBottom: 20, lineHeight: 1.6 }}>
                        📌 <strong>新用户空状态</strong>：AI用昵称「{aiName}」自我介绍，头像+AI角标。三个场景大卡片降低首次使用门槛。
                      </div>}

                      {/* Greeting */}
                      <div className="flex items-start gap-3 anim-fadeInUp" style={{ marginBottom: 32 }}>
                        <AIAvatar size={34} className="mt-0.5" />
                        <div>
                          <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: PALETTE.inkMuted, fontWeight: 500 }}>{aiName}</span>
                            <span style={{ fontSize: 8, fontWeight: 700, background: PALETTE.accentBg, color: PALETTE.accent, padding: "1px 4px", borderRadius: 3 }}>AI</span>
                          </div>
                          <div style={{
                            background: PALETTE.warmGray, borderRadius: "16px 16px 16px 4px",
                            padding: "14px 18px", fontSize: 14, color: PALETTE.inkSoft, lineHeight: 1.7,
                            maxWidth: 400, border: `1px solid ${PALETTE.borderLight}`,
                            fontFamily: "'Noto Sans SC', sans-serif",
                          }}>
                            你好，我是<span style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: PALETTE.ink }}>{aiName}</span>，你的AI合伙人。
                            <br /><br />
                            选一个场景开始，或者直接聊聊你现在脑子里最乱的一件事。
                          </div>
                        </div>
                      </div>

                      {/* Scene Cards */}
                      <div className="flex flex-col gap-3">
                        {SCENE_CARDS.map((s, i) => <EmptyStateSceneCard key={s.key} scene={s} index={i} />)}
                      </div>
                      <div className="anim-fadeIn" style={{ textAlign: "center", marginTop: 24, animationDelay: "0.8s" }}>
                        <p style={{ fontSize: 12, color: PALETTE.inkFaint }}>不确定从哪开始？直接在下方输入框聊聊也行 ↓</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {showAnnotations && <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 10, padding: "8px 12px", marginBottom: 4 }}>📌 老用户对话流</div>}
                      {MESSAGES.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} anim-fadeInUp`} style={{ animationDelay: `${i * 80}ms` }}>
                          <div style={{ maxWidth: 440 }}>
                            {msg.role === "ai" && (
                              <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
                                <AIAvatarSmall />
                                <span style={{ fontSize: 11, color: PALETTE.inkFaint, fontWeight: 500 }}>{aiName}</span>
                                <span style={{ fontSize: 8, fontWeight: 700, background: PALETTE.accentBg, color: PALETTE.accent, padding: "1px 4px", borderRadius: 3 }}>AI</span>
                              </div>
                            )}
                            <div style={{
                              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                              padding: "12px 16px", fontSize: 14, lineHeight: 1.65,
                              fontFamily: "'Noto Sans SC', sans-serif",
                              ...(msg.role === "user"
                                ? { background: PALETTE.ink, color: "#f0f0f0" }
                                : { background: PALETTE.warmGray, color: PALETTE.inkSoft, border: `1px solid ${PALETTE.borderLight}` }),
                            }}>
                              {msg.text}
                            </div>
                            {msg.card && <SceneCard card={msg.card} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ padding: "12px 28px 16px", borderTop: `1px solid ${PALETTE.border}`, background: PALETTE.parchment }}>
                  {showAnnotations && <div style={{ fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 8, padding: "6px 10px", marginBottom: 8 }}>📌 Typing状态 + 场景入口</div>}
                  {isTyping && <TypingIndicator name={aiName} />}
                  {!isNew && (
                    <div className="flex gap-2" style={{ marginBottom: 8 }}>
                      {[{ icon: "🎙", label: "会议" }, { icon: "📋", label: "汇报" }, { icon: "📖", label: "文章" }].map((s, i) => (
                        <button key={i} className="flex items-center gap-1.5 transition-all duration-200"
                          style={{ fontSize: 12, color: PALETTE.inkMuted, border: `1px solid ${PALETTE.border}`, borderRadius: 8, padding: "5px 12px", background: "#fff", cursor: "pointer", fontFamily: "'Noto Sans SC', sans-serif" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = PALETTE.accent; e.currentTarget.style.color = PALETTE.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = PALETTE.border; e.currentTarget.style.color = PALETTE.inkMuted; }}>
                          <span>{s.icon}</span><span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div style={{
                      flex: 1, background: PALETTE.warmGray, border: `1px solid ${PALETTE.border}`, borderRadius: 14,
                      padding: "11px 18px", fontSize: 14, color: PALETTE.inkFaint, fontFamily: "'Noto Sans SC', sans-serif",
                    }}>
                      聊聊你现在脑子里最乱的一件事…
                    </div>
                    <button className="transition-all duration-200" style={{
                      background: PALETTE.ink, color: "#f5f5f5", borderRadius: 14, padding: "11px 20px",
                      fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "'Noto Sans SC', sans-serif",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = PALETTE.accent}
                      onMouseLeave={e => e.currentTarget.style.background = PALETTE.ink}>
                      发送
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeNav === "chat" && activeThread && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 shrink-0" style={{ padding: "12px 28px", borderBottom: `1px solid ${PALETTE.border}` }}>
                  <button onClick={() => setActiveThread(null)} className="transition-colors" style={{ color: PALETTE.inkFaint, fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>← 主对话</button>
                  <span style={{ color: PALETTE.border }}>|</span>
                  <span style={{ fontSize: 18 }}>{[...threads, ...ARCHIVED].find(t => t.id === activeThread)?.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink, fontFamily: "'Noto Serif SC', serif" }}>{[...threads, ...ARCHIVED].find(t => t.id === activeThread)?.title}</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    {showAnnotations && <div style={{ color: PALETTE.accent, background: PALETTE.accentBg, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 12 }}>📌 Thread内容区。见 Demo 3/4/5。</div>}
                    <p style={{ color: PALETTE.inkFaint, fontSize: 13 }}>Thread: {[...threads, ...ARCHIVED].find(t => t.id === activeThread)?.title}</p>
                  </div>
                </div>
              </div>
            )}

            {activeNav === "memory" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center anim-fadeIn">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: PALETTE.ink, fontFamily: "'Noto Serif SC', serif" }}>记忆</h2>
                  <p style={{ fontSize: 13, color: PALETTE.inkMuted, marginTop: 4 }}>人物档案和事件追踪</p>
                  <p style={{ fontSize: 11, color: PALETTE.inkFaint, marginTop: 8 }}>具体设计见 Demo 6</p>
                </div>
              </div>
            )}

            {activeNav === "network" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center anim-fadeIn">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: PALETTE.ink, fontFamily: "'Noto Serif SC', serif" }}>混沌AI私董圈</h2>
                  <p style={{ fontSize: 13, color: PALETTE.inkMuted, marginTop: 4, marginBottom: 16 }}>通往创业者集体智慧的入场券</p>
                  <div style={{ background: PALETTE.warmGray, border: `1px solid ${PALETTE.border}`, borderRadius: 14, padding: 16, maxWidth: 260, margin: "0 auto" }}>
                    <div style={{ fontSize: 13, color: PALETTE.inkMuted, marginBottom: 10, fontWeight: 500 }}>解锁条件</div>
                    <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: `1px solid ${PALETTE.borderLight}` }}>
                      <div className="flex justify-between" style={{ fontSize: 11, color: PALETTE.inkMuted, marginBottom: 6 }}><span>记忆积累</span><span>3/10</span></div>
                      <div style={{ width: "100%", background: PALETTE.warmGrayDark, borderRadius: 4, height: 5 }}>
                        <div style={{ width: "30%", background: PALETTE.accent, borderRadius: 4, height: 5, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
