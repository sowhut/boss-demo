import { useState, useEffect, useRef } from "react";

/* ───────── Design System (inherited from main app) ───────── */
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
  accent: "#c8956c",
  accentSoft: "#c8956c20",
  accentBg: "#fdf4ec",
  border: "#e8e4de",
  borderLight: "#f0ece6",
};

/* ───────── Animated Network Constellation ───────── */
function NetworkConstellation({ width = 320, height = 280 }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Generate nodes — a few "active" boss nodes and many dim background nodes
    const nodes = [];
    const BOSS_COUNT = 6;
    const BG_COUNT = 18;
    const cx = width / 2, cy = height / 2;

    for (let i = 0; i < BOSS_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / BOSS_COUNT + Math.random() * 0.3;
      const r = 60 + Math.random() * 50;
      nodes.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 4 + Math.random() * 3,
        type: "boss",
        opacity: 0.7 + Math.random() * 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < BG_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 120;
      nodes.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        radius: 1.5 + Math.random() * 1.5,
        type: "bg",
        opacity: 0.15 + Math.random() * 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    nodesRef.current = nodes;

    let time = 0;
    function draw() {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Update positions — gentle drift
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        // soft boundary bounce
        if (n.x < 20 || n.x > width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > height - 20) n.vy *= -1;
      });

      // Draw connections between boss nodes (and occasional bg)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = (a.type === "boss" && b.type === "boss") ? 160 : 70;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (a.type === "boss" && b.type === "boss" ? 0.2 : 0.06);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(200, 149, 108, ${alpha})`;
            ctx.lineWidth = a.type === "boss" && b.type === "boss" ? 1 : 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = Math.sin(time * 2 + n.pulsePhase) * 0.15 + 1;
        const r = n.radius * pulse;

        if (n.type === "boss") {
          // Glow
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
          grad.addColorStop(0, `rgba(200, 149, 108, ${0.12 * n.opacity})`);
          grad.addColorStop(1, "rgba(200, 149, 108, 0)");
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          // Core
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 149, 108, ${n.opacity})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 160, 140, ${n.opacity})`;
          ctx.fill();
        }
      });

      // Central "you" node
      const youPulse = Math.sin(time * 1.5) * 0.2 + 1;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * youPulse);
      grad.addColorStop(0, "rgba(200, 149, 108, 0.25)");
      grad.addColorStop(1, "rgba(200, 149, 108, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * youPulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.accent;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 149, 108, ${0.3 + Math.sin(time * 2) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block" }}
    />
  );
}

/* ───────── Insight Preview Cards ───────── */
const PREVIEW_INSIGHTS = [
  {
    avatar: "陈", color: "#7a6b5a",
    label: "餐饮 · 华东",
    text: "有个和你行业相近的老板，去年也面对过渠道成本飙升。他砍掉了线下地推，把预算全压在私域——三个月后ROI翻了一倍。",
  },
  {
    avatar: "王", color: "#5a7a6b",
    label: "制造 · 长三角",
    text: "你上次提到的供应链备选方案，网络里另一位老板刚走过同样的弯路。他发现双供应商策略的隐性成本被严重低估了。",
  },
  {
    avatar: "刘", color: "#6b5a7a",
    label: "消费品 · 全国",
    text: "你在考虑的品牌年轻化，有位老板去年做了类似的事。他总结说关键不是换包装，是换掉内部对「年轻」的定义。",
  },
];

function InsightCard({ insight, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400 + index * 200);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
        background: "#fff",
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 14,
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Frosted left accent */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${insight.color}40, ${insight.color}10)`,
        borderRadius: "14px 0 0 14px",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: `${insight.color}18`,
          color: insight.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
          fontFamily: "'Noto Serif SC', serif",
        }}>
          {insight.avatar}
        </div>
        <div>
          <span style={{
            fontSize: 11, color: PALETTE.inkFaint, fontWeight: 500,
            letterSpacing: "0.03em",
          }}>
            {insight.label}
          </span>
        </div>
        <div style={{
          marginLeft: "auto",
          fontSize: 9, fontWeight: 600,
          color: PALETTE.accent, background: PALETTE.accentBg,
          padding: "2px 8px", borderRadius: 4,
          letterSpacing: "0.05em",
        }}>
          AI 代言
        </div>
      </div>

      <p style={{
        fontSize: 13, color: PALETTE.inkSoft, lineHeight: 1.75,
        fontFamily: "'Noto Sans SC', sans-serif",
      }}>
        {insight.text}
      </p>

      {/* Blur overlay — these are previews, not real */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 36,
        background: "linear-gradient(transparent, #fff)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

/* ───────── Narrative Blocks ───────── */
const AI_REALITIES = [
  {
    number: "01",
    headline: "AI时代，数据就是你自己",
    body: "未来所有老板都会有AI。区别不在于谁的AI更贵，在于谁的AI更懂自己。你今天喂给AI的每一场会议、每一份汇报、每一个判断，都在塑造一个越来越像你的数字分身。越早开始，壁垒越深。",
  },
  {
    number: "02",
    headline: "不是AI助理，是AI Agent互联网",
    body: "一个AI助理再聪明，也只是你一个人的工具。但当1000个老板的AI Agent互相连接，它就不再是助理——它是一张活的决策网络。每个节点都是一个真实老板的经验、判断和直觉。这是第一个由AI Agent构成的商业智慧网络。",
  },
  {
    number: "03",
    headline: "不是所有人都能进来",
    body: "这个网络的价值取决于每个节点的质量。你的AI必须足够懂你，才有资格代表你。不设付费门槛，设能力门槛——你和诸葛之间的关系深度，就是你的入场资格。",
  },
];

/* ───────── Main Component ───────── */
export default function NetworkVisionPage() {
  const [showAnnotations, setShowAnnotations] = useState(false);
  const scrollRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Noto Sans SC', -apple-system, sans-serif", background: PALETTE.sidebar }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .vision-fadeInUp { animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
        .vision-fadeIn { animation: fadeIn 0.5s ease-out both; }
        .vision-float { animation: float 4s ease-in-out infinite; }

        .vision-page::-webkit-scrollbar { width: 4px; }
        .vision-page::-webkit-scrollbar-track { background: transparent; }
        .vision-page::-webkit-scrollbar-thumb { background: ${PALETTE.border}; border-radius: 4px; }
      `}</style>

      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#161616", borderBottom: "1px solid #2a2a2a", padding: "7px 16px", flexShrink: 0,
      }}>
        <h1 style={{ color: "#ccc", fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}>
          Demo 8/8 · 人脉圈 Vision 页
        </h1>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#777", cursor: "pointer" }}>
          <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)}
            style={{ accentColor: PALETTE.accent, width: 13, height: 13 }} />
          批注
        </label>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Simulated Sidebar */}
        <div style={{ width: 256, background: PALETTE.sidebar, borderRight: "1px solid #2a2a2a", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #2a2a2a" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { key: "chat", icon: "💬", label: "对话", active: false },
                { key: "people", icon: "👥", label: "人脉", active: false, badge: "内测" },
                { key: "matters", icon: "🗂", label: "事项", active: false, badge: "内测" },
                { key: "network", icon: "🔗", label: "人脉圈", active: true, badge: "Vision" },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === "chat") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "01" } }));
                    }
                    if (item.key === "people") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "06" } }));
                    }
                    if (item.key === "matters") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "07" } }));
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "none", textAlign: "left", background: "transparent", cursor: "pointer",
                    ...(item.active
                      ? { background: PALETTE.sidebarActive, color: "#fff", boxShadow: `inset 3px 0 0 ${PALETTE.accent}` }
                      : { color: "#aaa" }),
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span style={{ marginLeft: "auto", fontSize: 10, background: item.active ? PALETTE.accent + "30" : "#333", color: item.active ? PALETTE.accent : "#888", padding: "2px 6px", borderRadius: 4 }}>{item.badge}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ Vision Page Content ══════════ */}
        <div
          ref={scrollRef}
          className="vision-page"
          style={{
            flex: 1, overflowY: "auto", background: PALETTE.parchment,
            position: "relative",
          }}
        >
          {/* ── Hero Section ── */}
          <div style={{
            position: "relative",
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: 48, paddingBottom: 24,
            textAlign: "center",
            overflow: "hidden",
          }}>
            {/* Ambient background */}
            <div style={{
              position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
              width: 500, height: 500,
              background: `radial-gradient(ellipse at center, ${PALETTE.accent}08 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />

            {showAnnotations && (
              <div className="vision-fadeIn" style={{
                fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg,
                borderRadius: 10, padding: "8px 14px", marginBottom: 20, maxWidth: 400,
                border: `1px solid ${PALETTE.accent}20`,
              }}>
                📌 Vision页的核心叙事：从「工具」到「圈子」。不是在卖功能，是在卖身份——「你的AI代表你存在于这个网络中」。用预览式的洞见卡让老板感受到未来的价值。
              </div>
            )}

            {/* Network animation */}
            <div className="vision-float" style={{ marginBottom: 8, position: "relative", zIndex: 1 }}>
              <NetworkConstellation width={300} height={220} />
            </div>

            {/* Headline */}
            <div className="vision-fadeInUp" style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.2em",
                color: PALETTE.accent, textTransform: "uppercase",
                marginBottom: 14,
              }}>
                COMING SOON
              </div>
              <h1 style={{
                fontSize: 28, fontWeight: 900, color: PALETTE.ink,
                fontFamily: "'Noto Serif SC', serif",
                lineHeight: 1.35, margin: 0,
                letterSpacing: "-0.02em",
              }}>
                你不是一个人在扛
              </h1>
              <p style={{
                fontSize: 15, color: PALETTE.inkMuted, marginTop: 12,
                lineHeight: 1.7, maxWidth: 340, margin: "12px auto 0",
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                1000个老板的真实经验，通过AI连接。<br />
                不是案例库，是有人正在和你扛一样的事。
              </p>
            </div>
          </div>

          {/* ── Insight Previews ── */}
          <div style={{ padding: "8px 32px 32px", maxWidth: 480, margin: "0 auto" }}>
            {showAnnotations && (
              <div className="vision-fadeIn" style={{
                fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg,
                borderRadius: 10, padding: "8px 14px", marginBottom: 16,
                border: `1px solid ${PALETTE.accent}20`,
              }}>
                📌 这些卡片是模拟的「未来体验预览」——老板能直觉感受到「如果有这个东西，我的决策会不一样」。注意措辞用的是「有个和你很像的人」而不是「案例库显示」。
              </div>
            )}

            <div style={{
              fontSize: 11, fontWeight: 600, color: PALETTE.inkFaint,
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: 14, textAlign: "center",
            }}>
              未来你可能收到的洞见
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PREVIEW_INSIGHTS.map((insight, i) => (
                <InsightCard key={i} insight={insight} index={i} />
              ))}
            </div>
          </div>

          {/* ── AI时代的三个现实 ── */}
          <div style={{ padding: "24px 32px 8px", maxWidth: 460, margin: "0 auto" }}>
            {showAnnotations && (
              <div className="vision-fadeIn" style={{
                fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg,
                borderRadius: 10, padding: "8px 14px", marginBottom: 16,
                border: `1px solid ${PALETTE.accent}20`,
              }}>
                📌 这三段不是功能说明，是叙事武器。第一段制造数据焦虑（你不积累就落后），第二段拔高技术想象（不是助理是网络），第三段锁死身份认同（不是谁都能进）。三层合力指向一个结论：你现在就该开始。
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {AI_REALITIES.map((item, i) => (
                <div key={i} style={{
                  padding: "24px 0",
                  borderBottom: i < AI_REALITIES.length - 1 ? `1px solid ${PALETTE.borderLight}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 28, fontWeight: 900, color: PALETTE.accent,
                      fontFamily: "'Noto Serif SC', serif",
                      opacity: 0.3, lineHeight: 1, letterSpacing: "-0.05em",
                    }}>
                      {item.number}
                    </span>
                    <h3 style={{
                      fontSize: 16, fontWeight: 700, color: PALETTE.ink,
                      fontFamily: "'Noto Serif SC', serif",
                      margin: 0, lineHeight: 1.3,
                    }}>
                      {item.headline}
                    </h3>
                  </div>
                  <p style={{
                    fontSize: 13, color: PALETTE.inkSoft, lineHeight: 1.85,
                    margin: 0, paddingLeft: 40,
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── The Big Narrative ── */}
          <div style={{
            padding: "24px 32px 32px", maxWidth: 420, margin: "0 auto",
            textAlign: "center",
          }}>
            <div style={{
              background: "#fff",
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16, padding: "28px 24px",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                width: 40, height: 3, borderRadius: 2,
                background: `linear-gradient(90deg, transparent, ${PALETTE.accent}, transparent)`,
              }} />
              <p style={{
                fontSize: 15, color: PALETTE.inkSoft,
                fontFamily: "'Noto Serif SC', serif",
                lineHeight: 2, fontWeight: 400,
                margin: 0, letterSpacing: "0.02em",
              }}>
                老板的孤独，<br />
                从来不只是「没人懂我的行业」。<br />
                <span style={{ color: PALETTE.ink, fontWeight: 700 }}>
                  更深的那层是——<br />
                  没人和我同时站在这个悬崖边上。
                </span>
              </p>
            </div>

            {showAnnotations && (
              <div className="vision-fadeIn" style={{
                fontSize: 11, color: PALETTE.accent, background: PALETTE.accentBg,
                borderRadius: 10, padding: "8px 14px", marginTop: 16,
                border: `1px solid ${PALETTE.accent}20`, textAlign: "left",
              }}>
                📌 这句话直接来自产品文档的核心洞察。前面三段是理性焦虑，这里转入感性共鸣。叙事节奏是：吓你 → 打动你 → 给你出路。
              </div>
            )}
          </div>

          {/* ── Qualification / Exclusivity CTA ── */}
          <div style={{
            padding: "0 32px 56px", maxWidth: 420, margin: "0 auto",
            textAlign: "center",
          }}>
            {/* Trust badges — three compact pills */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 8, marginBottom: 24,
            }}>
              {[
                { icon: "🛡", text: "端到端加密" },
                { icon: "🔐", text: "经验脱敏重组" },
                { icon: "👤", text: "完全匿名" },
              ].map((b, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11, color: PALETTE.inkMuted,
                  background: PALETTE.warmGray, border: `1px solid ${PALETTE.borderLight}`,
                  borderRadius: 20, padding: "5px 12px",
                }}>
                  <span style={{ fontSize: 12 }}>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: PALETTE.ink,
              borderRadius: 16, padding: "32px 24px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Ambient glow */}
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160, borderRadius: "50%",
                background: `radial-gradient(circle, ${PALETTE.accent}12, transparent)`,
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -60, left: -30,
                width: 120, height: 120, borderRadius: "50%",
                background: `radial-gradient(circle, ${PALETTE.accent}08, transparent)`,
                pointerEvents: "none",
              }} />

              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.15em",
                color: PALETTE.accent, textTransform: "uppercase",
                marginBottom: 10, position: "relative",
              }}>
                入网资格
              </p>
              <p style={{
                fontSize: 16, fontWeight: 700, color: "#e8e4de",
                fontFamily: "'Noto Serif SC', serif",
                marginBottom: 6, position: "relative",
                lineHeight: 1.5,
              }}>
                你的AI还不够像你
              </p>
              <p style={{
                fontSize: 12, color: "#999", lineHeight: 1.7,
                marginBottom: 24, position: "relative",
                maxWidth: 280, margin: "0 auto 24px",
              }}>
                继续和诸葛一起开会、看汇报、读文章。<br />
                它越懂你，就越有资格代表你。
              </p>

              {/* Qualification meter */}
              <div style={{
                background: "#2a2a2a", borderRadius: 14, padding: "18px 18px 14px",
                position: "relative",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 10,
                }}>
                  <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>AI理解深度</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: "#666", background: "#333",
                    padding: "2px 10px", borderRadius: 10,
                  }}>
                    尚未达标
                  </span>
                </div>

                {/* Multi-segment progress */}
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                  {[
                    { label: "会议", filled: 2, total: 5 },
                    { label: "汇报", filled: 1, total: 3 },
                    { label: "文章", filled: 0, total: 2 },
                  ].map((seg, i) => (
                    <div key={i} style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
                        {Array.from({ length: seg.total }).map((_, j) => (
                          <div key={j} style={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: j < seg.filled
                              ? `linear-gradient(90deg, ${PALETTE.accent}, #d4a574)`
                              : "#333",
                            transition: "background 0.5s",
                          }} />
                        ))}
                      </div>
                      <div style={{
                        fontSize: 9, color: "#555", textAlign: "center",
                        letterSpacing: "0.05em",
                      }}>
                        {seg.label} {seg.filled}/{seg.total}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  fontSize: 10, color: "#555", lineHeight: 1.6,
                  borderTop: "1px solid #333", paddingTop: 10,
                }}>
                  当诸葛对你的理解达到阈值，你将收到入网邀请。
                </div>
              </div>
            </div>

            {/* Footer whisper */}
            <p style={{
              fontSize: 11, color: PALETTE.inkFaint,
              marginTop: 24, lineHeight: 1.7,
            }}>
              全国首个AI Agent商业智慧网络<br />
              <span style={{ color: PALETTE.accent, fontWeight: 600 }}>混沌学园 × 诸葛</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
