import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   Design System (consistent with 03-会议分析Thread)
   ═══════════════════════════════════════════════════════ */
const P = {
  ink:"#1a1a1a", inkSoft:"#3d3d3d", inkMuted:"#6b6b6b", inkFaint:"#9a9a9a",
  warm:"#f7f5f2", warmDark:"#edeae5", parchment:"#fdfcfa",
  accent:"#c8956c", accentBg:"#fdf4ec", accentBorder:"#f0d4be",
  aGreen:"#5a8a6a", aGreenBg:"#edf5f0", aGreenBorder:"#b8d4c2",
  blue:"#4a72b0", blueBg:"#f0f4fa", blueBorder:"#c0d0e8",
  red:"#c45c5c", redBg:"#fef2f2",
  purple:"#6b5ba8", purpleBg:"#f0ecfa",
  amber:"#b8860b", amberBg:"#fdf8ec", amberBorder:"#f0e0b0",
  border:"#e8e4de", borderLight:"#f0ece6",
  sb:"#1e1e1e", sbHover:"#2a2a2a", sbActive:"#333",
};
const F = "'Noto Sans SC','PingFang SC',-apple-system,sans-serif";
const S = "'Noto Serif SC','Songti SC',serif";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');
@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}}
@keyframes pulseGlow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.anim-up{animation:fadeInUp .4s ease-out both}
.anim-in{animation:fadeIn .3s ease-out both}
.anim-slide{animation:slideUp .35s cubic-bezier(.16,1,.3,1) both}
.dot-1{animation:dotBounce 1s ease-in-out infinite}
.dot-2{animation:dotBounce 1s ease-in-out .15s infinite}
.dot-3{animation:dotBounce 1s ease-in-out .3s infinite}
.shimmer{background:linear-gradient(90deg,#f0ece6 25%,#fdfcfa 50%,#f0ece6 75%);background-size:200% 100%;animation:shimmer 1.8s ease-in-out infinite}
`;

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
const SUPPORTED_PLATFORMS = [
  { name: "公众号", pattern: /mp\.weixin\.qq\.com/ },
  { name: "小宇宙", pattern: /xiaoyuzhoufm\.com/ },
  { name: "抖音", pattern: /douyin\.com/ },
  { name: "小红书", pattern: /xiaohongshu\.com|xhslink\.com/ },
  { name: "混沌App", pattern: /hundun\.cn/ },
];

const RECOMMENDED_ARTICLES = [
  { id: "r1", title: "2026消费趋势深度报告：降级还是分化？", source: "虎嗅 · 李明远", summary: "体验溢价替代品牌溢价，消费者不是没钱了，是学聪明了", tag: "值得细读" },
  { id: "r2", title: "AI Agent 落地企业的三个真相", source: "36氪 · 张一鸣", summary: "95%的Agent项目死在没想清楚「谁做最终决策」", tag: "值得细读" },
  { id: "r3", title: "出海东南亚：下半场的新玩法", source: "晚点LatePost · 陈晓", summary: "不是复制中国模式，而是嫁接本地供应链", tag: "可以速览" },
  { id: "r4", title: "供应链金融的隐形门槛", source: "经济观察报 · 王磊", summary: "核心企业的信用传递效率决定了整个链条的融资成本", tag: "可以速览" },
  { id: "r5", title: "私域流量已死？2026年用户运营新范式", source: "刀法研究所 · 刘润", summary: "从「圈人」到「养关系」，CAC和LTV的算法要重写", tag: "值得细读" },
];

const ARTICLE_DATA = {
  title: "2026消费趋势深度报告：降级还是分化？",
  source: "虎嗅",
  author: "李明远",
  wordCount: "约8000字",
  tag: "值得细读",
};

// AI的关联判断（Thread第一屏）
const AI_ASSOCIATION = {
  text: "这篇文章的核心论点「体验溢价正在替代品牌溢价」，和你的业务直接相关——你做零售，客群正好处在这个转变的交叉点上。",
  subtext: "如果文章判断成立，你目前的品牌定价策略需要重新审视；但你线下门店的体验优势反而可能成为新的护城河。",
  strength: "strong",
};

const MODE_DATA = {
  decide: {
    key: "decide", label: "决策模式", icon: "⚖️", desc: "对我的生意意味着什么",
    oneLiner: "如果这个趋势成立，你的高端线逻辑需要重新审视——但线下体验是你的护城河。",
    impactPoints: [
      {
        direction: "warning",
        text: "你的「品牌溢价」定价策略可能面临挑战——消费者开始区分「品牌税」和「体验价值」",
        linkedAssumptionId: "ah-01",
      },
      {
        direction: "positive",
        text: "你的线下门店体验做得好，这反而是护城河——文章说「体验溢价」依然成立",
        linkedAssumptionId: "ah-02",
      },
      {
        direction: "watch",
        text: "建议关注：竞品是否开始打「同等体验、更低价格」的牌",
        linkedAssumptionId: null,
      },
    ],
    accumulate: true,
  },
  forward: {
    key: "forward", label: "转发模式", icon: "📤", desc: "生成转发语",
    targets: [
      { key: "subordinate", label: "下属", icon: "👥", text: "看看这个，尤其是第三部分关于「体验溢价 vs 品牌税」的分析，和我们Q2的定价策略直接相关。你看完后整理一下我们目前哪些SKU属于「品牌税」范畴。" },
      { key: "partner", label: "合伙人/股东", icon: "🤝", text: "推荐看一下这篇，里面关于消费降级的分析和我们之前讨论的方向一致。我比较关注第三部分，你怎么看？" },
      { key: "friend", label: "朋友", icon: "☕", text: "最近看到篇不错的分析，关于消费趋势的。第三部分关于体验溢价的观点挺有意思，推荐翻翻。" },
    ],
  },
  talk: {
    key: "talk", label: "谈资模式", icon: "🍷", desc: "一句饭局能用的话",
    expressionLevels: [
      {
        key: "plain",
        label: "大白话",
        hint: "更口语、更顺嘴",
        oneLiner: "最近看了篇文章，意思挺直白的: 不是大家突然没钱了，而是更会花钱了。该为体验买单还是愿意，但纯品牌税越来越难收，这事你看零售里已经很明显了。",
      },
      {
        key: "balanced",
        label: "平衡版",
        hint: "默认档，清楚有判断",
        oneLiner: "最近看了篇文章说，消费降级不是消费者没钱了，是他们学聪明了——愿意为体验付溢价，但不再为品牌税买单。你想想，星巴克被瑞幸打得够呛，但Costco的会员反而越卖越好，就是这个逻辑。",
      },
      {
        key: "expert",
        label: "懂行版",
        hint: "更专业、更克制",
        oneLiner: "这篇文章真正有意思的判断是，消费端不是简单降级，而是在重排支付意愿的结构: 体验溢价还在，但符号化品牌溢价在塌。对零售来说，这不是营销口径变化，是定价权来源在换。",
      },
    ],
  },
  stance: {
    key: "stance", label: "立场模式", icon: "🎯", desc: "这篇文章能信几分",
    credibility: "中等偏上",
    credColor: P.amber,
    credBg: P.amberBg,
    analysis: [
      { label: "数据基础", text: "引用了3份第三方报告，但样本主要集中在一二线城市，下沉市场覆盖不足" },
      { label: "作者立场", text: "李明远是消费基金合伙人，倾向于看好「性价比赛道」——他的钱投在这个方向上", icon: "⚠️", highlight: true },
      { label: "vs 主流观点", text: "和主流判断基本一致，但比多数人更激进——多数人说「消费分化」，他直接说「降级」" },
      { label: "盲区", text: "完全没讨论供给侧变化（国产替代、白牌崛起），只从需求侧分析" },
    ],
  },
};

const ACTIVE_ASSUMPTIONS = [
  {
    id: "ah-01",
    title: "高端线的定价权主要来自品牌势能",
    status: "活跃假设",
    note: "当前用于指导 Q2 高端 SKU 的价格带和传播重点。",
  },
  {
    id: "ah-02",
    title: "门店体验仍然能支撑高毛利和复购",
    status: "活跃假设",
    note: "当前用于指导线下门店投入和体验升级优先级。",
  },
];

/* ═══════════════════════════════════════════════════════
   Phase Management
   ═══════════════════════════════════════════════════════ */
const PHASES = {
  idle: "idle",
  dialog: "dialog",           // 弹框打开
  dialogFetching: "dialogFetching", // 弹框内抓取中
  dialogError: "dialogError",       // 弹框内抓取失败
  analyzing: "analyzing",     // 主对话区 typing
  result: "result",           // 卡片出来了
  thread: "thread",           // Thread 打开
};

/* ═══════════════════════════════════════════════════════
   UI Primitives
   ═══════════════════════════════════════════════════════ */
function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      {children}
    </div>
  );
}

function Pill({ children, bg, fg, border: bd }) {
  return <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 10, background: bg, color: fg, fontWeight: 500, whiteSpace: "nowrap", border: bd ? `1px solid ${bd}` : "none" }}>{children}</span>;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" style={{ height: 20 }}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`dot-${i}`} style={{ width: 5, height: 5, borderRadius: "50%", background: P.accent, display: "block" }} />
      ))}
    </span>
  );
}

function Annotation({ children, style: s }) {
  return (
    <div style={{ fontSize: 11, color: P.accent, background: P.accentBg, borderRadius: 8, padding: "8px 12px", marginBottom: 12, lineHeight: 1.6, ...s }}>
      📌 {children}
    </div>
  );
}

function getAssociationStrengthMeta(strength) {
  if (strength === "strong") {
    return { label: "强关联", fg: P.red, bg: P.redBg, border: "#f3caca" };
  }
  if (strength === "moderate") {
    return { label: "中关联", fg: P.amber, bg: P.amberBg, border: P.amberBorder };
  }
  return { label: "弱关联", fg: P.blue, bg: P.blueBg, border: P.blueBorder };
}

function getDirectionMeta(direction) {
  if (direction === "warning") {
    return {
      label: "削弱现有假设",
      fg: P.red,
      bg: P.redBg,
      border: "#f3caca",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M4.5 9.5L8 13L11.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    };
  }
  if (direction === "positive") {
    return {
      label: "增强机会判断",
      fg: P.aGreen,
      bg: P.aGreenBg,
      border: P.aGreenBorder,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 13V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M4.5 6.5L8 3L11.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    };
  }
  return {
    label: "继续观察",
    fg: P.amber,
    bg: P.amberBg,
    border: P.amberBorder,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      </svg>
    ),
  };
}

/* ═══════════════════════════════════════════════════════
   Article Input Dialog (弹框)
   ═══════════════════════════════════════════════════════ */
function ArticleDialog({ onClose, onSubmit, phase, showAnn }) {
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textContent, setTextContent] = useState("");
  const inputRef = useRef(null);

  const isFetching = phase === PHASES.dialogFetching;
  const isError = phase === PHASES.dialogError;

  // Auto-expand text input on error
  useEffect(() => {
    if (isError) setShowTextInput(true);
  }, [isError]);

  const validateLink = (url) => {
    if (!url.trim()) { setLinkError(""); return false; }
    try {
      const u = new URL(url.trim());
      if (!u.protocol.startsWith("http")) { setLinkError("请输入有效的网址"); return false; }
      const isSupported = SUPPORTED_PLATFORMS.some(p => p.pattern.test(u.hostname + u.pathname));
      if (!isSupported) { setLinkError("暂不支持该平台，试试粘贴文章内容？"); return false; }
      setLinkError(""); return true;
    } catch { setLinkError("链接格式不正确"); return false; }
  };

  const handleLinkChange = (val) => { setLink(val); if (val.trim()) validateLink(val); else setLinkError(""); };
  const canSubmitLink = link.trim() && !linkError && !isFetching;
  const canSubmitText = textContent.trim().length > 50 && !isFetching;

  return (
    <Overlay onClose={isFetching ? undefined : onClose}>
      <div className="anim-slide" style={{ width: 540, maxHeight: "85vh", background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: "20px 24px 0" }}>
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: 20 }}>📖</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: P.ink, fontFamily: S }}>文章提炼</h2>
          </div>
          <button onClick={isFetching ? undefined : onClose} style={{ background: "none", border: "none", cursor: isFetching ? "not-allowed" : "pointer", fontSize: 20, color: P.inkFaint, lineHeight: 1, opacity: isFetching ? 0.3 : 1 }}>×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "16px 24px 20px" }}>

          {showAnn && (
            <Annotation>
              <strong>弹框不在点击「分析」时关闭，而在抓取成功后关闭。</strong>抓取失败时，错误提示在弹框内出现，「粘贴文章内容」自动展开——老板的整个降级操作都在同一个容器内完成。
            </Annotation>
          )}

          {/* Link Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: P.inkMuted, fontWeight: 500, display: "block", marginBottom: 8 }}>粘贴文章链接</label>
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={link}
                onChange={e => handleLinkChange(e.target.value)}
                disabled={isFetching}
                placeholder="支持公众号、小宇宙、抖音、小红书、混沌App"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, fontFamily: F,
                  border: `1.5px solid ${linkError ? P.red : isError ? P.red : P.border}`,
                  background: isFetching ? P.warm : "#fff", color: P.ink, outline: "none",
                  opacity: isFetching ? 0.6 : 1,
                  transition: "border-color .2s",
                  boxSizing: "border-box",
                }}
                onFocus={e => { if (!linkError) e.target.style.borderColor = P.accent; }}
                onBlur={e => { if (!linkError) e.target.style.borderColor = P.border; }}
              />
              {isFetching && (
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <TypingDots />
                </div>
              )}
            </div>
            {linkError && <p style={{ fontSize: 12, color: P.red, marginTop: 6, paddingLeft: 2 }}>{linkError}</p>}
            {isFetching && <p style={{ fontSize: 12, color: P.accent, marginTop: 6, paddingLeft: 2 }}>正在获取文章内容…</p>}
            {isError && (
              <div className="anim-up" style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: P.redBg, border: `1px solid #f0c0c0` }}>
                <p style={{ fontSize: 13, color: P.red, fontWeight: 500 }}>这个链接暂时打不开</p>
                <p style={{ fontSize: 12, color: P.inkMuted, marginTop: 4 }}>可能是平台限制了访问。你可以把文章内容直接贴过来，效果一样。</p>
              </div>
            )}
          </div>

          {/* Submit Link Button */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => { if (canSubmitLink) onSubmit("link", link); }}
              disabled={!canSubmitLink}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 10, border: "none", fontSize: 14,
                fontWeight: 600, fontFamily: F, cursor: canSubmitLink ? "pointer" : "not-allowed",
                background: canSubmitLink ? P.ink : P.warmDark, color: canSubmitLink ? "#f5f5f5" : P.inkFaint,
                transition: "all .2s",
              }}
            >
              {isFetching ? "正在获取…" : "开始分析"}
            </button>
          </div>

          {/* Text Paste Fallback */}
          <div style={{ marginBottom: 20 }}>
            {!showTextInput ? (
              <button onClick={() => setShowTextInput(true)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: P.accent, fontFamily: F, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11 }}>▸</span> 或者，直接粘贴文章内容
              </button>
            ) : (
              <div className="anim-up">
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: P.inkMuted, fontWeight: 500 }}>粘贴文章内容</label>
                  {!isError && <button onClick={() => setShowTextInput(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: P.inkFaint }}>收起</button>}
                </div>
                <textarea
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                  disabled={isFetching}
                  placeholder="将文章全文粘贴到这里…"
                  style={{
                    width: "100%", height: 120, padding: "12px 14px", borderRadius: 12, fontSize: 13,
                    fontFamily: F, border: `1.5px solid ${P.border}`, background: "#fff", color: P.ink,
                    outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = P.accent}
                  onBlur={e => e.target.style.borderColor = P.border}
                />
                {textContent.trim() && textContent.trim().length < 50 && (
                  <p style={{ fontSize: 11, color: P.inkFaint, marginTop: 4 }}>内容太短，请粘贴完整的文章</p>
                )}
                <button
                  onClick={() => { if (canSubmitText) onSubmit("text", textContent); }}
                  disabled={!canSubmitText}
                  style={{
                    marginTop: 8, width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
                    fontSize: 14, fontWeight: 600, fontFamily: F,
                    cursor: canSubmitText ? "pointer" : "not-allowed",
                    background: canSubmitText ? P.aGreen : P.warmDark,
                    color: canSubmitText ? "#fff" : P.inkFaint, transition: "all .2s",
                  }}
                >
                  用文本分析
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: P.border }} />
            <span style={{ fontSize: 12, color: P.inkFaint, whiteSpace: "nowrap" }}>你可能想看</span>
            <div style={{ flex: 1, height: 1, background: P.border }} />
          </div>

          {showAnn && (
            <Annotation style={{ marginBottom: 10 }}>
              这个区域前期是编辑人工选的千人一面内容，<strong>命名为「你可能想看」而非「热门文章」</strong>，为后续个性化推荐留空间。等老板画像积累够了，会自然从编辑推荐进化为AI推荐。
            </Annotation>
          )}

          {/* Recommended Articles */}
          <div className="flex flex-col gap-1.5">
            {RECOMMENDED_ARTICLES.map(a => (
              <button key={a.id}
                onClick={() => onSubmit("recommend", a.id)}
                disabled={isFetching}
                className="transition-all duration-150"
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 12,
                  border: `1px solid ${P.borderLight}`, background: "#fff", cursor: isFetching ? "not-allowed" : "pointer",
                  fontFamily: F, opacity: isFetching ? 0.4 : 1,
                }}
                onMouseEnter={e => { if (!isFetching) { e.currentTarget.style.background = P.warm; e.currentTarget.style.borderColor = P.accentBorder; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = P.borderLight; }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 3, lineHeight: 1.4 }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: P.inkFaint, lineHeight: 1.4 }}>{a.summary}</p>
                    <p style={{ fontSize: 11, color: P.inkFaint, marginTop: 4 }}>{a.source}</p>
                  </div>
                  <Pill bg={a.tag === "值得细读" ? P.accentBg : P.warm} fg={a.tag === "值得细读" ? P.accent : P.inkFaint}>{a.tag}</Pill>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════════════
   Result Card in Main Chat
   ═══════════════════════════════════════════════════════ */
function ArticleCard({ onClick }) {
  return (
    <div className="anim-up" onClick={onClick}
      style={{ maxWidth: 440, padding: "16px 20px", borderRadius: 16, background: "#fff", border: `1px solid ${P.aGreenBorder}`, cursor: "pointer", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(90,138,106,.12)`; e.currentTarget.style.borderColor = P.aGreen; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = P.aGreenBorder; }}
    >
      <div className="flex items-start gap-3">
        <span style={{ fontSize: 22, lineHeight: 1.2, marginTop: 1 }}>📖</span>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: P.ink, fontFamily: S }}>{ARTICLE_DATA.title}</span>
          </div>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <Pill bg={P.aGreenBg} fg={P.aGreen} border={P.aGreenBorder}>{ARTICLE_DATA.tag}</Pill>
            <span style={{ fontSize: 11, color: P.inkFaint }}>{ARTICLE_DATA.source} · {ARTICLE_DATA.author}</span>
          </div>
          <p style={{ fontSize: 13, color: P.inkSoft, lineHeight: 1.5 }}>
            「体验溢价正在替代品牌溢价」——和你的零售业务直接相关，值得细看。
          </p>
          <p style={{ fontSize: 12, color: P.accent, marginTop: 8, fontWeight: 500 }}>展开看看 →</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Thread Content
   ═══════════════════════════════════════════════════════ */
function ThreadView({ showAnn }) {
  const [activeMode, setActiveMode] = useState(null); // null = show association first
  const [forwardTarget, setForwardTarget] = useState("subordinate");
  const [talkLevel, setTalkLevel] = useState("balanced");
  const [copied, setCopied] = useState(false);
  const [accumulated, setAccumulated] = useState(null); // null | "agree" | "disagree"
  const [chatMsg, setChatMsg] = useState("");
  const scrollRef = useRef(null);
  const associationStrength = getAssociationStrengthMeta(AI_ASSOCIATION.strength);

  const handleCopy = (text) => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ background: P.parchment }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px 120px" }}>

        {/* Article Header */}
        <div className="anim-up" style={{ marginBottom: 20 }}>
          <div className="flex items-start gap-3">
            <span style={{ fontSize: 26, lineHeight: 1 }}>📖</span>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: P.ink, fontFamily: S, lineHeight: 1.4, marginBottom: 6 }}>{ARTICLE_DATA.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Pill bg={P.aGreenBg} fg={P.aGreen} border={P.aGreenBorder}>{ARTICLE_DATA.tag}</Pill>
                <span style={{ fontSize: 12, color: P.inkFaint }}>{ARTICLE_DATA.source} · {ARTICLE_DATA.author} · {ARTICLE_DATA.wordCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Association Judgment (第一屏) */}
        {showAnn && (
          <Annotation>
            <strong>Thread第一屏不是选模式，而是AI的「关联判断」</strong>——帮老板看见这篇文章和他自己的关系。这才是会议分析「主动抛判断」和汇报解读「AI赌意图」的真正对等物：不是猜格式，而是先给出关系判断。
          </Annotation>
        )}
        <div className="anim-up" style={{ background: "#fff", borderRadius: 16, border: `1px solid ${P.accentBorder}`, padding: "20px", marginBottom: 20, animationDelay: ".1s" }}>
          <div className="flex items-center justify-between gap-3" style={{ marginBottom: 10 }}>
            <div className="flex items-center gap-2">
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: P.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🧠</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: P.inkSoft }}>关联判断</span>
            </div>
            <Pill bg={associationStrength.bg} fg={associationStrength.fg} border={associationStrength.border}>
              关联强度 · {associationStrength.label}
            </Pill>
          </div>
          <div className="flex items-start gap-2.5" style={{ marginBottom: 10 }}>
            <div style={{ width: 28, flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: P.ink, lineHeight: 1.7, fontWeight: 500 }}>{AI_ASSOCIATION.text}</p>
          </div>
          <p style={{ fontSize: 13, color: P.inkMuted, lineHeight: 1.6, marginLeft: 38 }}>{AI_ASSOCIATION.subtext}</p>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: P.border }} />
          <span style={{ fontSize: 12, color: P.inkFaint }}>选择你想怎么用这篇文章</span>
          <div style={{ flex: 1, height: 1, background: P.border }} />
        </div>

        {showAnn && (
          <Annotation>
            四种武器化模式是<strong>第二层</strong>。老板看到关联判断后，再决定「怎么武装自己」。模式切换行为本身就是偏好数据——总切到哪种，说明他更关心什么。
          </Annotation>
        )}

        {/* Mode Switcher */}
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 20 }}>
          {[MODE_DATA.decide, MODE_DATA.forward, MODE_DATA.talk, MODE_DATA.stance].map(m => (
            <button key={m.key}
              onClick={() => setActiveMode(m.key)}
              className="transition-all duration-150"
              style={{
                padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${activeMode === m.key ? P.accent : P.border}`,
                background: activeMode === m.key ? P.accentBg : "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 13,
                color: activeMode === m.key ? P.accent : P.inkMuted, fontWeight: activeMode === m.key ? 600 : 400,
              }}
              onMouseEnter={e => { if (activeMode !== m.key) e.currentTarget.style.borderColor = P.accentBorder; }}
              onMouseLeave={e => { if (activeMode !== m.key) e.currentTarget.style.borderColor = P.border; }}
            >
              <span>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>

        {/* Mode Content */}
        {activeMode === "decide" && <DecideMode showAnn={showAnn} accumulated={accumulated} setAccumulated={setAccumulated} />}
        {activeMode === "forward" && <ForwardMode showAnn={showAnn} target={forwardTarget} setTarget={setForwardTarget} copied={copied} onCopy={handleCopy} />}
        {activeMode === "talk" && (
          <TalkMode
            showAnn={showAnn}
            copied={copied}
            onCopy={handleCopy}
            onBridge={() => setActiveMode("decide")}
            talkLevel={talkLevel}
            setTalkLevel={setTalkLevel}
          />
        )}
        {activeMode === "stance" && <StanceMode showAnn={showAnn} />}

        {!activeMode && (
          <div style={{ textAlign: "center", padding: "20px 0", color: P.inkFaint, fontSize: 13 }}>
            ↑ 选一种模式，看看这篇文章能怎么用
          </div>
        )}

      </div>

      {/* Thread Chat Input */}
      <div style={{ position: "sticky", bottom: 0, background: P.parchment, borderTop: `1px solid ${P.borderLight}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {showAnn && <Annotation style={{ marginBottom: 8 }}>底部对话框承载深度追问。AI带着文章上下文，不需要老板重新描述背景。</Annotation>}
          <div className="flex items-center gap-2">
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", borderRadius: 12, border: `1px solid ${P.border}`, padding: "10px 14px" }}>
              <input
                type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                placeholder="聊聊这篇文章…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: F, color: P.ink, background: "transparent" }}
              />
            </div>
            <button style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: P.ink, color: "#f5f5f5", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer", opacity: chatMsg.trim() ? 1 : 0.4 }}>发送</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mode: 决策 ── */
function DecideMode({ showAnn, accumulated, setAccumulated }) {
  const d = MODE_DATA.decide;
  return (
    <div className="anim-up">
      {showAnn && <Annotation>决策模式的闭环是<strong>认知积累</strong>——核心不是把文章拆细，而是把真正会影响判断的 `impact_points` 摆出来；如果已经碰到老板的活跃假设，就直接挂到对应点下面。</Annotation>}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${P.border}`, padding: "20px", marginBottom: 12 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{d.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.inkSoft }}>{d.desc}</span>
        </div>
        <p style={{ fontSize: 14, color: P.ink, lineHeight: 1.7, fontWeight: 500, marginBottom: 16 }}>{d.oneLiner}</p>
        <div className="flex flex-col gap-2.5">
          {d.impactPoints.map((item, i) => {
            const directionMeta = getDirectionMeta(item.direction);
            const linkedAssumption = ACTIVE_ASSUMPTIONS.find(assumption => assumption.id === item.linkedAssumptionId);
            return (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: directionMeta.bg, border: `1px solid ${directionMeta.border}` }}>
                <div className="flex items-start gap-10">
                  <div style={{ width: 18, height: 18, flexShrink: 0, color: directionMeta.fg, marginTop: 1 }}>
                    {directionMeta.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-8 flex-wrap" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: directionMeta.fg, letterSpacing: 0.2 }}>
                        {directionMeta.label}
                      </span>
                      {linkedAssumption && (
                        <span style={{ fontSize: 11, color: P.inkFaint }}>
                          关联活跃假设
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: P.inkSoft, lineHeight: 1.55 }}>{item.text}</p>
                    {linkedAssumption && (
                      <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "#fff", border: `1px solid ${P.borderLight}` }}>
                        <div className="flex items-center justify-between gap-3" style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: P.inkSoft }}>{linkedAssumption.status}</span>
                          <span style={{ fontSize: 11, color: P.inkFaint }}>{linkedAssumption.id}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: P.ink, lineHeight: 1.5, fontWeight: 500, marginBottom: 4 }}>{linkedAssumption.title}</p>
                        <p style={{ fontSize: 11.5, color: P.inkMuted, lineHeight: 1.5 }}>{linkedAssumption.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Accumulate Feedback */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${P.borderLight}` }}>
          <p style={{ fontSize: 12, color: P.inkFaint, marginBottom: 10 }}>这些判断对你有帮助吗？AI 会将这篇文章积累到你的商业认知库中。</p>
          <div className="flex gap-2">
            <button onClick={() => setAccumulated("agree")}
              style={{ padding: "7px 20px", borderRadius: 20, border: `1px solid ${accumulated === "agree" ? P.aGreen : P.border}`, background: accumulated === "agree" ? P.aGreenBg : "#fff", color: accumulated === "agree" ? P.aGreen : P.inkMuted, fontSize: 13, fontFamily: F, cursor: "pointer", fontWeight: accumulated === "agree" ? 600 : 400 }}>
              {accumulated === "agree" ? "✓ 已记录" : "👍 有帮助，记下来"}
            </button>
            <button onClick={() => setAccumulated("disagree")}
              style={{ padding: "7px 20px", borderRadius: 20, border: `1px solid ${accumulated === "disagree" ? P.red : P.border}`, background: accumulated === "disagree" ? P.redBg : "#fff", color: accumulated === "disagree" ? P.red : P.inkMuted, fontSize: 13, fontFamily: F, cursor: "pointer", fontWeight: accumulated === "disagree" ? 600 : 400 }}>
              {accumulated === "disagree" ? "✓ 已标记" : "🤔 不太相关"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mode: 转发 ── */
function ForwardMode({ showAnn, target, setTarget, copied, onCopy }) {
  const f = MODE_DATA.forward;
  const currentTarget = f.targets.find(t => t.key === target);
  return (
    <div className="anim-up">
      {showAnn && <Annotation>转发模式的第一选择是<strong>「发给谁」而非「什么语气」</strong>。角色模板（下属/合伙人/朋友）决定了转发语的关系定位和意图，这比「直接一点/委婉一点」重要得多。</Annotation>}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${P.border}`, padding: "20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>📤</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.inkSoft }}>转发给谁？</span>
        </div>
        {/* Target Selector */}
        <div className="flex gap-2" style={{ marginBottom: 16 }}>
          {f.targets.map(t => (
            <button key={t.key} onClick={() => setTarget(t.key)}
              className="transition-all duration-150"
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 12, border: `1.5px solid ${target === t.key ? P.blue : P.border}`,
                background: target === t.key ? P.blueBg : "#fff", cursor: "pointer", fontFamily: F, textAlign: "center",
              }}
              onMouseEnter={e => { if (target !== t.key) e.currentTarget.style.borderColor = P.blueBorder; }}
              onMouseLeave={e => { if (target !== t.key) e.currentTarget.style.borderColor = P.border; }}
            >
              <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: target === t.key ? 600 : 400, color: target === t.key ? P.blue : P.inkMuted }}>{t.label}</div>
            </button>
          ))}
        </div>
        {/* Generated Text */}
        <div style={{ background: P.warm, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ fontSize: 14, color: P.ink, lineHeight: 1.7 }}>{currentTarget.text}</p>
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onCopy}
            style={{ padding: "9px 24px", borderRadius: 20, border: "none", background: copied ? P.aGreenBg : P.blue, color: copied ? P.aGreen : "#fff", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer", transition: "all .2s" }}>
            {copied ? "✓ 已复制" : "复制转发语"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mode: 谈资 ── */
function TalkMode({ showAnn, copied, onCopy, onBridge, talkLevel, setTalkLevel }) {
  const t = MODE_DATA.talk;
  const currentLevel = t.expressionLevels.find(level => level.key === talkLevel) ?? t.expressionLevels[1];
  return (
    <div className="anim-up">
      {showAnn && <Annotation>谈资是<strong>即时消费</strong>——一句话现在就能用。「聊聊对业务的影响」自然桥接到决策模式，<strong>从即时消费切到延迟沉淀</strong>，符合老板真实的认知路径：先觉得有意思，然后觉得有用。</Annotation>}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${P.border}`, padding: "20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🍷</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.inkSoft }}>一句话能用的谈资</span>
        </div>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 14 }}>
          {t.expressionLevels.map(level => (
            <button
              key={level.key}
              onClick={() => setTalkLevel(level.key)}
              className="transition-all duration-150"
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: `1.5px solid ${talkLevel === level.key ? P.accent : P.border}`,
                background: talkLevel === level.key ? P.accentBg : "#fff",
                color: talkLevel === level.key ? P.accent : P.inkMuted,
                cursor: "pointer",
                fontFamily: F,
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600 }}>{level.label}</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{level.hint}</div>
            </button>
          ))}
        </div>
        <div style={{ background: P.warm, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ fontSize: 14, color: P.ink, lineHeight: 1.8 }}>"{currentLevel.oneLiner}"</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onCopy}
            style={{ padding: "9px 24px", borderRadius: 20, border: "none", background: copied ? P.aGreenBg : P.ink, color: copied ? P.aGreen : "#f5f5f5", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer", transition: "all .2s" }}>
            {copied ? "✓ 已复制" : "复制谈资"}
          </button>
          <button onClick={onBridge}
            style={{ padding: "9px 20px", borderRadius: 20, border: `1px solid ${P.accentBorder}`, background: P.accentBg, color: P.accent, fontSize: 13, fontWeight: 500, fontFamily: F, cursor: "pointer" }}>
            ⚖️ 聊聊对业务的影响
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mode: 立场 ── */
function StanceMode({ showAnn }) {
  const s = MODE_DATA.stance;
  return (
    <div className="anim-up">
      {showAnn && <Annotation>立场模式的作用是帮老板快速判断这篇文章该信到什么程度，而不是追踪作者或建立信息源档案。</Annotation>}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${P.border}`, padding: "20px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.inkSoft }}>这篇文章能信几分</span>
        </div>
        {/* Credibility Badge */}
        <div className="flex items-center justify-between" style={{ padding: "10px 16px", borderRadius: 12, background: s.credBg, border: `1px solid ${s.credColor}22`, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: P.inkSoft }}>论据可信度</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: s.credColor, padding: "2px 12px", borderRadius: 16, background: "#fff" }}>{s.credibility}</span>
        </div>
        {/* Analysis Items */}
        <div className="flex flex-col gap-2.5">
          {s.analysis.map((item, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: item.highlight ? "#fff5f5" : P.warm }}>
              <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
                {item.icon && <span style={{ fontSize: 12 }}>{item.icon}</span>}
                <span style={{ fontSize: 11, fontWeight: 600, color: item.highlight ? P.red : P.inkFaint, textTransform: "uppercase" }}>{item.label}</span>
              </div>
              <p style={{ fontSize: 13, color: P.inkSoft, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════════════ */
const SIDEBAR_THREADS = [
  { id: 1, type: "meeting", icon: "🎙", title: "今天的销售周会", status: "active", time: "30分钟前", summary: "李总对新业务态度暧昧" },
  { id: 2, type: "report", icon: "📋", title: "张总的Q2汇报", status: "active", time: "1小时前", summary: "可信度中等，数据口径有变化" },
];

/* ═══════════════════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════════════════ */
export default function ArticleThreadDemo() {
  const [phase, setPhase] = useState(PHASES.idle);
  const [showAnn, setShowAnn] = useState(true);
  const [showThread, setShowThread] = useState(false);
  const [simError, setSimError] = useState(false); // toggle for demo

  // Phase nav for demo
  const PHASE_NAV = [
    { sep: true, label: "── 提交任务前 ──" },
    { key: PHASES.idle, label: "主对话（空）", icon: "💬" },
    { key: PHASES.dialog, label: "弹框·输入链接", icon: "📖" },
    { key: PHASES.dialogFetching, label: "弹框·抓取中", icon: "⏳" },
    { key: PHASES.dialogError, label: "弹框·抓取失败", icon: "❌" },
    { sep: true, label: "── 提交任务后 ──" },
    { key: PHASES.analyzing, label: "AI 分析中", icon: "⏳" },
    { key: PHASES.result, label: "结果卡片", icon: "🃏" },
    { key: "thread", label: "Thread 展开", icon: "✅" },
  ];

  const handleDialogSubmit = (type, value) => {
    if (simError && type === "link") {
      setPhase(PHASES.dialogFetching);
      setTimeout(() => setPhase(PHASES.dialogError), 1500);
    } else {
      setPhase(PHASES.dialogFetching);
      setTimeout(() => {
        setPhase(PHASES.analyzing);
        setTimeout(() => setPhase(PHASES.result), 2000);
      }, 1200);
    }
  };

  const isDialogOpen = [PHASES.dialog, PHASES.dialogFetching, PHASES.dialogError].includes(phase);

  return (
    <>
      <style>{STYLE}</style>
      <div className="h-screen flex flex-col" style={{ background: P.sb, fontFamily: F }}>

        {/* Top Bar */}
        <div className="flex items-center justify-between shrink-0" style={{ background: "#161616", borderBottom: "1px solid #2a2a2a", padding: "7px 16px" }}>
          <span style={{ color: "#ccc", fontWeight: 700, fontSize: 13 }}>Demo 5/8 · 文章提炼 Thread — 完整交互流程 v2</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2" style={{ fontSize: 12, color: "#777" }}>
              <input type="checkbox" checked={simError} onChange={e => setSimError(e.target.checked)} style={{ accentColor: P.red }} /> 模拟抓取失败
            </label>
            <label className="flex items-center gap-2" style={{ fontSize: 12, color: "#777" }}>
              <input type="checkbox" checked={showAnn} onChange={e => setShowAnn(e.target.checked)} style={{ accentColor: P.accent }} /> 设计批注
            </label>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">

          {/* ═══ LEFT SIDEBAR ═══ */}
          <div className="flex flex-col shrink-0" style={{ width: 240, background: P.sb, borderRight: "1px solid #2a2a2a" }}>
            {/* Nav */}
            <div style={{ padding: 12, borderBottom: "1px solid #2a2a2a" }}>
              <div className="flex flex-col gap-0.5">
                {[
                  { key: "chat", icon: "💬", label: "对话" },
                  { key: "people", icon: "👥", label: "人脉", badge: "内测" },
                  { key: "matters", icon: "🗂", label: "事项", badge: "内测" },
                  { key: "network", icon: "🔗", label: "人脉圈", badge: "Vision" },
                ].map(item => (
                  <button key={item.key} onClick={() => {
                    if (item.key === "chat") {
                      window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "01" } }));
                      return;
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
                  }}
                    className="flex items-center gap-2.5 transition-all duration-150"
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 13,
                      fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left", fontFamily: F,
                      ...(item.key === "chat" && !showThread
                        ? { background: P.sbActive, color: "#fff", boxShadow: `inset 3px 0 0 ${P.accent}` }
                        : { background: "transparent", color: "#aaa" }),
                    }}
                    onMouseEnter={e => { if (!(item.key === "chat" && !showThread)) e.currentTarget.style.background = P.sbHover; }}
                    onMouseLeave={e => { if (!(item.key === "chat" && !showThread)) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span style={{ fontSize: 10, color: "#666", marginLeft: "auto" }}>{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Threads */}
            <div style={{ padding: "8px 12px", flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 11, color: "#555", padding: "4px 8px", marginBottom: 4 }}>进行中</div>
              {SIDEBAR_THREADS.map(t => (
                <div key={t.id} style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 2, background: "transparent", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = P.sbHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{t.title}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#666", marginLeft: 25, marginTop: 2 }}>{t.summary}</p>
                </div>
              ))}

              {/* Current article thread */}
              {(phase === PHASES.result || showThread) && (
                <div className="anim-in"
                  onClick={() => setShowThread(true)}
                  style={{
                    padding: "8px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
                    background: showThread ? P.sbActive : "transparent",
                    ...(showThread ? { boxShadow: `inset 3px 0 0 ${P.aGreen}` } : {}),
                  }}
                  onMouseEnter={e => { if (!showThread) e.currentTarget.style.background = P.sbHover; }}
                  onMouseLeave={e => { if (!showThread) e.currentTarget.style.background = showThread ? P.sbActive : "transparent"; }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13 }}>📖</span>
                    <span style={{ fontSize: 12, color: showThread ? "#fff" : "#ccc", fontWeight: 500 }}>消费降级趋势文章</span>
                  </div>
                  <p style={{ fontSize: 11, color: showThread ? "#aaa" : "#666", marginLeft: 25, marginTop: 2 }}>和你的零售业务直接相关</p>
                </div>
              )}
            </div>

            {/* User */}
            <div style={{ padding: 12, borderTop: "1px solid #2a2a2a" }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg,${P.accent},#a07050)`, color: "#fff", fontSize: 13, fontWeight: 700 }}>夏</div>
                <div><div style={{ fontSize: 13, color: "#e0e0e0", fontWeight: 500 }}>夏总</div><div style={{ fontSize: 11, color: "#777" }}>零售 · 80人团队</div></div>
              </div>
            </div>
          </div>

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="flex-1 flex flex-col min-w-0">
            {showThread ? (
              <ThreadView showAnn={showAnn} />
            ) : (
              /* Main Chat Area */
              <div className="flex-1 flex flex-col" style={{ background: P.parchment }}>
                <div className="flex-1 overflow-y-auto" style={{ padding: "24px 20px" }}>
                  <div style={{ maxWidth: 600, margin: "0 auto" }}>

                    {showAnn && phase === PHASES.idle && (
                      <Annotation>
                        主对话流。底部输入框旁边有「文章」图标入口。点击弹出任务对话框——和会议分析、汇报解读统一的交互范式。
                      </Annotation>
                    )}

                    {/* AI Welcome */}
                    <div className="flex items-start gap-3" style={{ marginBottom: 20 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧠</div>
                      <div style={{ background: "#fff", borderRadius: "4px 16px 16px 16px", padding: "14px 18px", border: `1px solid ${P.borderLight}` }}>
                        <p style={{ fontSize: 14, color: P.ink, lineHeight: 1.7 }}>有什么我能帮你的？</p>
                      </div>
                    </div>

                    {/* Analyzing State */}
                    {phase === PHASES.analyzing && (
                      <div className="anim-up flex items-start gap-3">
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧠</div>
                        <div style={{ background: "#fff", borderRadius: "4px 16px 16px 16px", padding: "14px 18px", border: `1px solid ${P.borderLight}` }}>
                          <div className="flex items-center gap-2">
                            <TypingDots />
                            <span style={{ fontSize: 13, color: P.inkFaint }}>正在提炼文章…</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result Card */}
                    {phase === PHASES.result && (
                      <div>
                        {showAnn && (
                          <Annotation>
                            卡片出现在主对话流中，包含：标题+一句话摘要+AI判断标签（值得细读/可以速览/和你关系不大）+一句谈资。点击打开Thread，dock在左侧任务区。
                          </Annotation>
                        )}
                        <div className="flex items-start gap-3">
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧠</div>
                          <div>
                            <p style={{ fontSize: 13, color: P.inkSoft, marginBottom: 10, lineHeight: 1.6 }}>帮你看了这篇文章——「体验溢价正在替代品牌溢价」，和你的业务直接相关。</p>
                            <ArticleCard onClick={() => setShowThread(true)} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Bar */}
                <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${P.borderLight}`, background: P.parchment }}>
                  <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    {phase === PHASES.analyzing && (
                      <div className="anim-up flex items-center gap-3" style={{ padding: "10px 16px", borderRadius: 12, background: P.aGreenBg, border: `1px solid ${P.aGreenBorder}`, marginBottom: 10 }}>
                        <span style={{ fontSize: 14 }}>📖</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: P.aGreen, fontFamily: F }}>文章提炼</span>
                        <div style={{ flex: 1 }} />
                        <div className="flex items-center gap-1.5">
                          <TypingDots />
                          <span style={{ fontSize: 12, color: P.aGreen }}>正在分析…</span>
                        </div>
                      </div>
                    )}
                    {/* Scene Entry Cards */}
                    <div className="flex gap-2" style={{ marginBottom: 8 }}>
                      {[
                        { icon: "🎙", label: "会议", active: false },
                        { icon: "📋", label: "汇报", active: false },
                        { icon: "📖", label: "文章", active: true, onClick: () => setPhase(PHASES.dialog) },
                      ].map((s, i) => (
                        <button key={i} onClick={s.onClick}
                          className="flex items-center gap-1.5 transition-all duration-200"
                          style={{
                            fontSize: 12, color: s.active ? P.aGreen : P.inkMuted,
                            border: `1px solid ${s.active ? P.aGreenBorder : P.border}`,
                            borderRadius: 8, padding: "5px 12px",
                            background: s.active ? P.aGreenBg : "#fff",
                            cursor: s.onClick ? "pointer" : "default",
                            fontFamily: F, fontWeight: s.active ? 500 : 400,
                          }}>
                          <span>{s.icon}</span><span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, background: P.warm, border: `1px solid ${P.border}`, borderRadius: 14, padding: "11px 18px", fontSize: 14, color: P.inkFaint, fontFamily: F }}>和 AI 合伙人聊聊…</div>
                      <button style={{ background: P.ink, color: "#f5f5f5", borderRadius: 14, padding: "11px 20px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: F, opacity: 0.4 }}>发送</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* ═══ RIGHT: Phase Navigator (demo only) ═══ */}
          <div className="shrink-0 flex flex-col" style={{ width: 170, background: "#fff", borderLeft: `1px solid ${P.border}` }}>
            <div style={{ padding: "12px 10px 6px", fontSize: 10, color: P.inkFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Demo 交互阶段</div>
            <div className="flex-1 overflow-y-auto" style={{ padding: "0 6px" }}>
              {PHASE_NAV.map((item, i) => item.sep ? (
                <div key={i} style={{ padding: "6px 8px", fontSize: 9, color: P.inkFaint, textAlign: "center" }}>{item.label}</div>
              ) : (
                <button key={item.key}
                  onClick={() => {
                    if (item.key === "thread") { setPhase(PHASES.result); setShowThread(true); }
                    else { setShowThread(false); setPhase(item.key); }
                  }}
                  className="transition-all duration-150"
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", margin: "1px 0",
                    borderRadius: 6, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                    background: (phase === item.key || (item.key === "thread" && showThread)) ? P.accentBg : "transparent",
                    color: (phase === item.key || (item.key === "thread" && showThread)) ? P.accent : P.inkMuted,
                    fontWeight: (phase === item.key || (item.key === "thread" && showThread)) ? 600 : 400,
                    fontSize: 11, fontFamily: F,
                  }}>
                  <span style={{ fontSize: 12 }}>{item.icon}</span><span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dialog Overlay */}
        {isDialogOpen && (
          <ArticleDialog
            phase={phase}
            showAnn={showAnn}
            onClose={() => setPhase(PHASES.idle)}
            onSubmit={handleDialogSubmit}
          />
        )}
      </div>
    </>
  );
}
