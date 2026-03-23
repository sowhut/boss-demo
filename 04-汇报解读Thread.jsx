import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ═══════════════════════════════════════════════════════
   Design System (consistent with 03-会议分析Thread)
   ═══════════════════════════════════════════════════════ */
const P = {
  ink:"#1a1a1a", inkSoft:"#3d3d3d", inkMuted:"#6b6b6b", inkFaint:"#9a9a9a",
  warm:"#f7f5f2", warmDark:"#edeae5", parchment:"#fdfcfa",
  accent:"#c8956c", accentBg:"#fdf4ec", accentBorder:"#f0d4be",
  mAccent:"#d4845a", mBg:"#fef6f0", mBorder:"#f0d4be",
  blue:"#4a72b0", blueBg:"#f0f4fa",
  green:"#5a8a6a", greenBg:"#edf5f0",
  red:"#c45c5c", redBg:"#fef2f2", redBorder:"#f5d0d0",
  purple:"#6b5ba8", purpleBg:"#f0ecfa", purpleBorder:"#d8d0f0",
  amber:"#b08d3a", amberBg:"#fef9ec",
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
.anim-up{animation:fadeInUp .4s ease-out both}
.anim-in{animation:fadeIn .3s ease-out both}
.anim-slide{animation:slideUp .35s cubic-bezier(.16,1,.3,1) both}
.dot-1{animation:dotBounce 1s ease-in-out infinite}
.dot-2{animation:dotBounce 1s ease-in-out .15s infinite}
.dot-3{animation:dotBounce 1s ease-in-out .3s infinite}
.pulse-glow{animation:pulseGlow 2s ease-in-out infinite}
`;

/* ═══════════════════════════════════════════════════════
   Phases & Mock Data
   ═══════════════════════════════════════════════════════ */
const PH = {
  idle:"idle",
  submitPopup:"submitPopup",
  analyzing:"analyzing",
  error:"error",
  personConfirm:"personConfirm",
  replyPrep:"replyPrep",
  altStrategy:"altStrategy",
  replyDraft:"replyDraft",
  threadChat:"threadChat",
};

const REPORT_META = {
  title:"Q2渠道推广方案",
  time:"今天 15:20",
  ownerHint:"市场中心",
  ownerName:"张总",
  ownerDept:"市场部",
  format:"PPT · 18页",
};

const MAIN_ANALYSIS = {
  userMessage:"他想让你批 15 万渠道推广预算。这份方案我不建议直接批：上个月跟你说的转化率，这次悄悄换成了「用户活跃度」，而且你上次要的渠道评估报告只字未提。",
  findings:[
    {
      finding:"衡量指标从「转化率」换成了「用户活跃度」，但没有解释为什么换口径",
      evidence:"第二部分原文写的是「用户活跃度较上月提升 22%」。上月同一位置写的是「渠道转化率 15.3%」。两个指标衡量的不是一件事，汇报里也没有说明为什么改口径。",
    },
    {
      finding:"你上次明确要求的渠道评估报告，本次汇报没有回应",
      evidence:"上次批示里把渠道评估报告作为预算审批前置条件。本次 18 页里没有进度说明，也没有延期原因，这个前置条件实际上还没被补齐。",
    },
    {
      finding:"预算诉求在前，验证动作在后，顺序倒了",
      evidence:"方案先要求审批 15 万预算，再写「后续跑通模型后复盘」。也就是说关键假设还没验证，就希望你先做决定。",
    },
  ],
  contentDigest:"这是一份为 Q2 线下拓客申请预算的汇报。核心诉求是审批 15 万渠道推广预算。内容里用活跃度替代了上月持续跟踪的转化率，同时缺少你要求的渠道评估报告。整体更像在推动预算决策，而不是先补齐决策前提。",
  threadHint:"内容问题已经看清了。Thread 里下一步不是继续拆汇报，而是先确认这是谁的汇报，再判断回复策略要不要升级。",
};

const EXISTING_PEOPLE = [
  { id:"p1", name:"张总", dept:"市场部", avatar:"张", color:"#6b5ba8", bgColor:"#e8e0f8", reports:3 },
  { id:"p2", name:"李总", dept:"产品部", avatar:"李", color:"#4a72b0", bgColor:"#dce6f5", reports:5 },
  { id:"p3", name:"王总", dept:"运营部", avatar:"王", color:"#5a8a6a", bgColor:"#dff0e5", reports:2 },
];

const RELATION_OPTIONS = ["直接下属","平级同事","上级","客户","合作方","顾问/专家","候选人","其他"];

const REPLY_PREP = {
  threadMessage:[
    "张总的东西我看了几次了。他有个模式：承诺的时候激进，交付的时候打折。上次 12 万预算说 8 周搞定，最后拖了 16 周，ROI 也只做到预期的 40%。",
    "所以这次不是单纯「数据口径变了」这么简单。知道是张总之后，你的回复重点应该从追问指标口径，升级成先让他交代上次那笔预算的执行结果，再谈这次的新预算。",
  ],
  replyDirection:"不直接谈这次 15 万预算。先让他补上上次 12 万预算的执行复盘和渠道评估报告，两件前置条件说清楚，再讨论新方案。",
  alternativeStrategies:[
    {
      key:"partial",
      strategy:"有条件推进",
      rationale:"如果你不想卡太死，可以先批一小部分试跑一个城市，执行结果达标再放后续预算。这样不用等完整复盘，但风险敞口是锁住的。",
    },
    {
      key:"confront",
      strategy:"直接对质执行力",
      rationale:"如果你想一次把话说透，可以直接点明他上次预算执行打折的模式，要求这次把 milestone 和复盘口径写进方案里。",
    },
  ],
  contentDigest:"基于张总过往预算执行记录，这次汇报暴露的问题不再只是内容口径，而是同类承诺反复出现。主推回复方向是先卡住复盘和评估报告，再谈新预算。也提供了更柔和的有条件推进，以及更强硬的直接对质两种姿态。",
};

const ALT_STRATEGY_RESULTS = {
  partial: {
    selectedStrategy:"有条件推进",
    threadMessage:[
      "如果你这次不想把预算完全卡死，那可以把回复重点从「先复盘再讨论」改成「先小额试跑，再看结果放量」。这样既不给他一次性拿满预算，也不会让项目完全停住。",
      "但代价也要明说：你是在给他试错空间，不是在认可整套方案。回复里需要把试跑范围、阶段结果和下一次复盘节点卡得很死。",
    ],
    replyDirection:"可以先批一部分预算启动一个城市或一条渠道试跑，但必须同步要阶段目标、复盘时间点和后续放量条件。",
    contentDigest:"选定策略为有条件推进。核心变化是从阻塞预算转为阶段性放行，但需要更强的边界条件来控制风险。回复要把预算拆分、目标拆分和复盘节点一起写清楚。",
  },
  confront: {
    selectedStrategy:"直接对质执行力",
    threadMessage:[
      "如果你想把话一次说透，那就不要只问这份汇报哪里不清楚，直接点名张总上次预算执行打折的事实。这样做的好处是信号非常明确，他很难继续把问题包在新计划里。",
      "这个方向更强硬，也更容易让他进入防御姿态。所以回复里最好少讲情绪，多讲事实：上次花了多久、结果怎样、这次为什么还值得你继续给资源。",
    ],
    replyDirection:"直接把上次预算执行结果摆出来，要求他说明这次凭什么能做得更好，并把执行保障条款写进方案里。",
    contentDigest:"选定策略为直接对质执行力。回复重心从预算前提转向历史执行差距本身。适合需要一次性把信号传透的场景，但会牺牲一部分缓冲空间。",
  },
};

const REPLY_VARIANTS = {
  recommended: {
    title:"按主推方向起草",
    variants:[
      {
        label:"直接",
        text:"这次 15 万预算我先不批。你先把上次 12 万渠道预算的执行复盘发我，包括实际花了多少、周期多长、效果怎么样；另外我上次要的渠道评估报告也一起补齐。这两个前提说清楚，我们再谈这次的新方案。",
      },
      {
        label:"温和",
        text:"收到，这次方案我看过了。新预算先别急着往下走，麻烦你先把上次 12 万渠道预算的执行情况做个复盘发我，实际投入、周期和结果都说明一下；另外渠道评估报告也一并补上。前置条件齐了，我们再继续讨论这次的预算安排。",
      },
      {
        label:"简短",
        text:"这次 15 万先不批。先补上次 12 万预算复盘和渠道评估报告，材料齐了再谈新方案。",
      },
    ],
  },
  partial: {
    title:"按「有条件推进」起草",
    variants:[
      {
        label:"直接",
        text:"这次预算不一次性放满。你先按一个城市或一条渠道做试跑，我先放一部分启动资金；同时把阶段目标、复盘时间点和后续放量条件写清楚。试跑结果达标，再谈后面的预算。",
      },
      {
        label:"温和",
        text:"我理解这次项目有推进时效，所以预算可以不完全卡住。先按一个更小的范围试跑，我先批一部分启动资金；你把阶段目标、复盘节点和后续追加预算的条件补充完整，试跑结果合适我们再往下走。",
      },
      {
        label:"简短",
        text:"先小范围试跑，我先批一部分。把阶段目标、复盘节点和后续放量条件写清楚，再看后面预算。",
      },
    ],
  },
  confront: {
    title:"按「直接对质执行力」起草",
    variants:[
      {
        label:"直接",
        text:"这次方案先不谈预算本身，先谈执行。上次 12 万预算你承诺 8 周，最后拖到 16 周，结果也没做到预期；这次金额更大、周期更短，我需要你先说明凭什么能做成。把执行保障条款、阶段里程碑和复盘口径补进方案后，我们再继续。",
      },
      {
        label:"温和",
        text:"这次方案我先不急着批预算，想先把执行这件事说透。上次 12 万预算的推进节奏和结果跟最初承诺有不小偏差，这次金额更大、时间更紧，所以需要你把执行保障、阶段里程碑和复盘口径补充完整。把这部分说明白，我们再继续讨论资源。",
      },
      {
        label:"简短",
        text:"先别谈新预算。先说明上次 12 万为什么执行打折，这次的执行保障和 milestone 怎么做，补齐后再谈。",
      },
    ],
  },
};

const RELATED_MATTERS = [
  { source:"李总上周的汇报", text:"也提到 Q2 渠道推广，但他的假设是「需要新建团队」, 和张总「现有团队能搞定」的前提矛盾。", type:"conflict" },
  { source:"上月销售周会", text:"当时你明确说过「先看渠道评估再决定预算」, 这也是这次回复里应该继续卡住的前置条件。", type:"dependency" },
];

const SIDEBAR_THREADS = [
  { id:1, icon:"🎙", title:"今天的销售周会", summary:"李总对新业务态度有变化", time:"2小时前" },
  { id:3, icon:"📖", title:"消费降级趋势文章", summary:"如果趋势成立，高端线需重新评估", time:"昨天" },
];

/* ═══════════════════════════════════════════════════════
   UI Primitives
   ═══════════════════════════════════════════════════════ */
function Overlay({ children, onClose }) {
  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background:"rgba(0,0,0,.35)", backdropFilter:"blur(4px)", zIndex:9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {children}
    </div>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}

function Pill({ children, bg, fg }) {
  return (
    <span
      style={{
        fontSize:11,
        padding:"2px 8px",
        borderRadius:10,
        background:bg,
        color:fg,
        fontWeight:500,
        whiteSpace:"nowrap",
      }}
    >
      {children}
    </span>
  );
}

function AiAvatar({ size = 24 }) {
  return (
    <div
      style={{
        width:size,
        height:size,
        borderRadius:"50%",
        background:P.inkSoft,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        flexShrink:0,
      }}
    >
      <span style={{ fontSize:size * 0.33, color:"#fff", fontWeight:700 }}>AI</span>
    </div>
  );
}

function AiLabel() {
  return <span style={{ fontSize:11, color:P.inkFaint, display:"block", marginBottom:3 }}>诸葛</span>;
}

function Bubble({ children, maxW = 460 }) {
  return (
    <div
      style={{
        background:"#fff",
        border:`1px solid ${P.borderLight}`,
        borderRadius:"14px 14px 14px 4px",
        padding:"14px 18px",
        maxWidth:maxW,
        fontSize:14,
        color:P.inkSoft,
        lineHeight:1.65,
        fontFamily:F,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({ label, primary, onClick }) {
  return (
    <button
      onClick={onClick}
      className="transition-all duration-150"
      style={{
        padding:"8px 18px",
        borderRadius:20,
        border:primary ? "none" : `1px solid ${P.border}`,
        background:primary ? P.ink : "#fff",
        color:primary ? "#f5f5f5" : P.inkMuted,
        fontSize:13,
        fontWeight:primary ? 500 : 400,
        cursor:"pointer",
        fontFamily:F,
      }}
    >
      {label}
    </button>
  );
}

function NewContactDialog({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(RELATION_OPTIONS[0]);
  const [note, setNote] = useState("");
  const ok = name.trim() && relation;

  return (
    <Overlay onClose={onClose}>
      <div
        className="anim-slide"
        style={{
          width:520,
          maxHeight:"85vh",
          background:"#fff",
          borderRadius:20,
          boxShadow:"0 24px 80px rgba(0,0,0,.18)",
          overflow:"hidden",
          display:"flex",
          flexDirection:"column",
        }}
      >
        <div className="flex items-center justify-between shrink-0" style={{ padding:"20px 24px 0" }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:P.ink, fontFamily:S }}>新建联系人</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:P.inkFaint, lineHeight:1 }}>×</button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding:"20px 24px" }}>
          <div className="flex flex-col gap-5">
            <div>
              <div style={{ fontSize:13, color:P.inkMuted, marginBottom:10, fontWeight:500 }}>称呼</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：张三 / 周总 / 北区负责人"
                style={{
                  width:"100%",
                  padding:"10px 14px",
                  borderRadius:10,
                  border:`1px solid ${P.border}`,
                  background:P.warm,
                  fontSize:14,
                  color:P.ink,
                  fontFamily:F,
                  outline:"none",
                  boxSizing:"border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = P.mAccent;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = P.border;
                }}
              />
            </div>
            <div>
              <div style={{ fontSize:13, color:P.inkMuted, marginBottom:10, fontWeight:500 }}>关系</div>
              <div className="flex flex-wrap gap-2">
                {RELATION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRelation(opt)}
                    className="transition-all duration-150"
                    style={{
                      fontSize:13,
                      padding:"6px 14px",
                      borderRadius:16,
                      border:`1px solid ${relation === opt ? P.mAccent : P.border}`,
                      background:relation === opt ? "#fff" : P.warm,
                      color:relation === opt ? P.mAccent : P.inkMuted,
                      fontWeight:relation === opt ? 600 : 400,
                      fontFamily:F,
                      cursor:"pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:13, color:P.inkMuted, marginBottom:10, fontWeight:500 }}>备注</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="填写一切方便老板记住这个人的信息。"
                style={{
                  width:"100%",
                  minHeight:110,
                  padding:"12px 14px",
                  borderRadius:12,
                  border:`1px solid ${P.border}`,
                  background:P.warm,
                  fontSize:13,
                  color:P.ink,
                  fontFamily:F,
                  outline:"none",
                  resize:"vertical",
                  lineHeight:1.7,
                  boxSizing:"border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = P.mAccent;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = P.border;
                }}
              />
            </div>
          </div>
        </div>
        <div className="shrink-0 flex justify-end gap-3" style={{ padding:"16px 24px", borderTop:`1px solid ${P.borderLight}` }}>
          <button onClick={onClose} style={{ padding:"10px 24px", borderRadius:10, border:`1px solid ${P.border}`, background:"#fff", cursor:"pointer", fontSize:14, color:P.inkMuted, fontFamily:F }}>取消</button>
          <button
            onClick={() => onCreate({ name:name.trim(), relation, note:note.trim() })}
            disabled={!ok}
            style={{
              padding:"10px 28px",
              borderRadius:10,
              border:"none",
              cursor:ok ? "pointer" : "not-allowed",
              background:ok ? P.ink : P.warmDark,
              color:ok ? "#f5f5f5" : P.inkFaint,
              fontSize:14,
              fontWeight:600,
              fontFamily:F,
              opacity:ok ? 1 : 0.6,
            }}
          >
            确认创建
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════════════
   Submit Popup — Upload OR Paste (mutually exclusive)
   ═══════════════════════════════════════════════════════ */
function SubmitPopup({ onSubmit, onClose }) {
  const [mode, setMode] = useState(null);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [prog, setProg] = useState(0);
  const [uploading, setUploading] = useState(false);

  const simUpload = () => {
    setFile({ name:"Q2渠道推广方案.pptx", size:"3.2 MB", pages:18 });
    setMode("file");
    setUploading(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 20 + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setUploading(false);
      }
      setProg(Math.min(p, 100));
    }, 180);
  };

  const onText = (v) => {
    setText(v);
    if (v.trim()) setMode("text");
    else if (!file) setMode(null);
  };

  const ok = (mode === "file" && !uploading) || (mode === "text" && text.trim().length > 0);

  return (
    <Overlay onClose={onClose}>
      <div
        className="anim-slide"
        style={{
          width:500,
          background:"#fff",
          borderRadius:20,
          boxShadow:"0 24px 80px rgba(0,0,0,.18)",
          overflow:"hidden",
          display:"flex",
          flexDirection:"column",
        }}
      >
        <div className="flex items-center justify-between shrink-0" style={{ padding:"20px 24px 0" }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:P.ink, fontFamily:S }}>汇报解读</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:P.inkFaint, lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:"20px 24px" }}>
          {!file ? (
            <button
              onClick={simUpload}
              className="transition-all duration-200"
              disabled={mode === "text"}
              style={{
                width:"100%",
                padding:"32px 20px",
                borderRadius:14,
                border:`2px dashed ${mode === "text" ? P.warmDark : P.mBorder}`,
                background:mode === "text" ? P.warm : P.mBg,
                cursor:mode === "text" ? "not-allowed" : "pointer",
                textAlign:"center",
                opacity:mode === "text" ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (mode !== "text") e.currentTarget.style.borderColor = P.mAccent;
              }}
              onMouseLeave={(e) => {
                if (mode !== "text") e.currentTarget.style.borderColor = P.mBorder;
              }}
            >
              <div style={{ fontSize:24, marginBottom:6 }}>📎</div>
              <div style={{ fontSize:14, color:P.inkSoft, fontWeight:500, fontFamily:F }}>点击选择或拖拽文件到此处</div>
              <div style={{ fontSize:11, color:P.inkFaint, marginTop:6, fontFamily:F }}>支持 PPT / Word / PDF / 图片</div>
            </button>
          ) : (
            <div className="anim-up" style={{ padding:"14px 16px", borderRadius:14, border:`1px solid ${P.mBorder}`, background:P.mBg }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize:24 }}>📄</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize:14, fontWeight:500, color:P.ink, fontFamily:F }}>{file.name}</span>
                    <button
                      onClick={() => {
                        setFile(null);
                        setMode(null);
                        setProg(0);
                      }}
                      style={{ background:"none", border:"none", cursor:"pointer", color:P.inkFaint, fontSize:16 }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-3" style={{ marginTop:4 }}>
                    <span style={{ fontSize:11, color:P.inkFaint }}>{file.size}</span>
                    <span style={{ fontSize:11, color:P.inkFaint }}>{file.pages}页</span>
                    {!uploading && <span style={{ fontSize:11, color:P.green, fontWeight:500 }}>✓ 就绪</span>}
                  </div>
                  {uploading && (
                    <div style={{ marginTop:6, width:"100%", height:3, borderRadius:2, background:P.warmDark }}>
                      <div style={{ width:`${prog}%`, height:"100%", borderRadius:2, background:P.mAccent, transition:"width .2s ease" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3" style={{ margin:"16px 0" }}>
            <div style={{ flex:1, height:1, background:P.border }} />
            <span style={{ fontSize:12, color:P.inkFaint }}>或者</span>
            <div style={{ flex:1, height:1, background:P.border }} />
          </div>

          <textarea
            value={text}
            onChange={(e) => onText(e.target.value)}
            placeholder="直接粘贴汇报内容文本…"
            disabled={mode === "file"}
            style={{
              width:"100%",
              minHeight:100,
              padding:"14px 16px",
              borderRadius:14,
              border:`1px solid ${P.border}`,
              background:mode === "file" ? P.warmDark : P.warm,
              fontSize:13,
              color:P.ink,
              fontFamily:F,
              outline:"none",
              resize:"vertical",
              lineHeight:1.7,
              boxSizing:"border-box",
              opacity:mode === "file" ? 0.5 : 1,
            }}
            onFocus={(e) => {
              if (mode !== "file") e.target.style.borderColor = P.mAccent;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = P.border;
            }}
          />
        </div>
        <div className="shrink-0 flex justify-end gap-3" style={{ padding:"16px 24px", borderTop:`1px solid ${P.borderLight}` }}>
          <button onClick={onClose} style={{ padding:"10px 24px", borderRadius:10, border:`1px solid ${P.border}`, background:"#fff", cursor:"pointer", fontSize:14, color:P.inkMuted, fontFamily:F }}>取消</button>
          <button
            onClick={() => onSubmit()}
            disabled={!ok}
            className="transition-all duration-150"
            style={{
              padding:"10px 28px",
              borderRadius:10,
              border:"none",
              cursor:ok ? "pointer" : "not-allowed",
              background:ok ? P.ink : P.warmDark,
              color:ok ? "#f5f5f5" : P.inkFaint,
              fontSize:14,
              fontWeight:600,
              fontFamily:F,
              opacity:ok ? 1 : 0.6,
            }}
          >
            提交分析
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Chat Analysis Card
   ═══════════════════════════════════════════════════════ */
function ReportSummaryCard({ onOpenThread }) {
  return (
    <div
      className="anim-up"
      style={{
        background:"#fff",
        borderRadius:16,
        border:`1px solid ${P.mBorder}`,
        overflow:"hidden",
        maxWidth:440,
        cursor:"pointer",
      }}
      onClick={onOpenThread}
    >
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${P.borderLight}` }}>
        <div className="flex items-center gap-2" style={{ marginBottom:6 }}>
          <span style={{ fontSize:16 }}>📋</span>
          <span style={{ fontSize:15, fontWeight:600, color:P.ink, fontFamily:S }}>{REPORT_META.title}</span>
        </div>
        <div className="flex items-center gap-3" style={{ fontSize:12, color:P.inkFaint }}>
          <span>{REPORT_META.time}</span>
          <span>·</span>
          <span>{REPORT_META.ownerHint}</span>
          <span>·</span>
          <span>{REPORT_META.format}</span>
        </div>
      </div>

      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${P.borderLight}` }}>
        <p style={{ fontSize:14, color:P.ink, lineHeight:1.7, fontWeight:600, fontFamily:F }}>{MAIN_ANALYSIS.userMessage}</p>
      </div>

      <div style={{ padding:"10px 18px", background:P.warm }}>
        <span style={{ fontSize:12, color:P.mAccent, fontWeight:500, fontFamily:F }}>点击进入 Thread，看完整依据并确认人物</span>
      </div>
    </div>
  );
}

function FullAnalysisMsg({ showAnn }) {
  return (
    <div className="anim-up">
      {showAnn && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 主会话只放一句结论，Thread 首屏再展开成完整内容分析，避免主对话过重，同时保留“先看事、再看人”的顺序。
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div style={{ maxWidth:470 }}>
          <AiLabel />
          <div style={{ background:"#fff", border:`1px solid ${P.border}`, borderRadius:"14px 14px 14px 4px", overflow:"hidden" }}>
            <div className="flex items-center gap-2" style={{ padding:"14px 18px 0" }}>
              <span style={{ fontSize:14 }}>📌</span>
              <span style={{ fontSize:14, fontWeight:600, color:P.ink, fontFamily:S }}>内容分析</span>
            </div>
            <div style={{ padding:"12px 18px", borderBottom:`1px solid ${P.borderLight}` }}>
              <p style={{ fontSize:15, color:P.ink, lineHeight:1.7, fontWeight:600, fontFamily:F }}>{MAIN_ANALYSIS.userMessage}</p>
            </div>
            <div style={{ padding:"12px 18px", borderBottom:`1px solid ${P.borderLight}` }}>
              <div style={{ fontSize:11, color:P.inkFaint, marginBottom:8, fontWeight:500 }}>为什么这么判断</div>
              {MAIN_ANALYSIS.findings.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding:"10px 12px",
                    borderRadius:12,
                    background:index === 0 ? P.amberBg : P.warm,
                    border:`1px solid ${index === 0 ? "#f3e4b9" : P.borderLight}`,
                    marginBottom:index < MAIN_ANALYSIS.findings.length - 1 ? 8 : 0,
                  }}
                >
                  <div style={{ fontSize:13, color:P.ink, fontWeight:600, lineHeight:1.55, fontFamily:F }}>{item.finding}</div>
                  <p style={{ fontSize:12, color:P.inkMuted, lineHeight:1.65, marginTop:5, fontFamily:F }}>{item.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Thread Messages
   ═══════════════════════════════════════════════════════ */
function PersonConfirmMsg({ onConfirm, showAnn, completed, confirmedName }) {
  const [selected, setSelected] = useState(null);
  const [newProfile, setNewProfile] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const confirm = () => {
    const name = selected?.name || newProfile?.name || REPORT_META.ownerName;
    onConfirm(name);
  };

  return (
    <div className="anim-up">
      {showAnn && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 Thread 的入口改成「先对人」。内容问题主会话已经说完了，这里先把汇报人确认掉，再决定回复策略要不要升级。
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div style={{ maxWidth:460 }}>
          <AiLabel />
          <Bubble>
            <p style={{ marginBottom:12 }}>
              文档落款写的是「{REPORT_META.ownerHint}」，没有具名。先确认一下，这是谁的汇报？
            </p>
            {!completed ? (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {EXISTING_PEOPLE.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelected(p);
                        setNewProfile(null);
                      }}
                      className="flex items-center gap-1.5 transition-all duration-150"
                      style={{
                        padding:"6px 12px",
                        borderRadius:20,
                        fontSize:13,
                        cursor:"pointer",
                        fontFamily:F,
                        border:`1px solid ${selected?.id === p.id ? p.color : P.border}`,
                        background:selected?.id === p.id ? p.bgColor : "#fff",
                        color:selected?.id === p.id ? p.color : P.inkMuted,
                        fontWeight:selected?.id === p.id ? 600 : 400,
                      }}
                    >
                      <span
                        style={{
                          width:18,
                          height:18,
                          borderRadius:"50%",
                          background:p.bgColor,
                          display:"inline-flex",
                          alignItems:"center",
                          justifyContent:"center",
                          fontSize:10,
                          fontWeight:700,
                          color:p.color,
                        }}
                      >
                        {p.avatar}
                      </span>
                      {p.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="transition-all duration-150"
                    style={{
                      padding:"6px 12px",
                      borderRadius:20,
                      fontSize:13,
                      cursor:"pointer",
                      fontFamily:F,
                      border:`1px solid ${newProfile ? P.blue : P.border}`,
                      background:newProfile ? P.blueBg : "#fff",
                      color:newProfile ? P.blue : P.inkMuted,
                      fontWeight:newProfile ? 600 : 400,
                    }}
                  >
                    都不是？新建联系人
                  </button>
                </div>
                {newProfile && (
                  <div className="anim-in" style={{ marginTop:10, padding:"10px 12px", borderRadius:10, background:P.blueBg, border:`1px solid ${P.border}` }}>
                    <div style={{ fontSize:12, color:P.blue, fontWeight:600, marginBottom:4 }}>待创建联系人</div>
                    <div style={{ fontSize:13, color:P.ink, fontFamily:F }}>{newProfile.name} · {newProfile.relation}</div>
                    {newProfile.note && <div style={{ fontSize:12, color:P.inkMuted, marginTop:4, fontFamily:F }}>{newProfile.note}</div>}
                  </div>
                )}
                {(selected || newProfile) && (
                  <button
                    onClick={confirm}
                    className="anim-in transition-all duration-150"
                    style={{
                      marginTop:10,
                      padding:"6px 20px",
                      borderRadius:20,
                      border:"none",
                      background:P.ink,
                      color:"#f5f5f5",
                      fontSize:13,
                      fontWeight:500,
                      cursor:"pointer",
                      fontFamily:F,
                    }}
                  >
                    确认
                  </button>
                )}
              </div>
            ) : (
              <div className="anim-in flex items-center gap-2" style={{ padding:"6px 12px", borderRadius:10, background:P.greenBg }}>
                <span style={{ fontSize:11, color:P.green, fontWeight:500 }}>✓ 已确认：{confirmedName || selected?.name || newProfile?.name}</span>
              </div>
            )}
          </Bubble>
        </div>
      </div>
      {showCreateDialog && (
        <NewContactDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(profile) => {
            setNewProfile(profile);
            setSelected(null);
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}

function ReplyPreparationMsg({ onWriteReply, onSelectStrategy, onOpenChat, showAnn }) {
  return (
    <div className="anim-up">
      {showAnn && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 这里不再是“换个角度看汇报”。结构变成：thread_message 先告诉老板知道了是谁之后回复策略为什么变，再给 reply_direction，最后挂 1-2 个备选回复姿态。
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div style={{ maxWidth:470 }}>
          <AiLabel />
          <div style={{ background:"#fff", border:`1px solid ${P.border}`, borderRadius:"14px 14px 14px 4px", overflow:"hidden" }}>
            <div className="flex items-center gap-2" style={{ padding:"14px 18px 0" }}>
              <span style={{ fontSize:14 }}>💬</span>
              <span style={{ fontSize:14, fontWeight:600, color:P.ink, fontFamily:S }}>回复策略</span>
            </div>
            <div style={{ padding:"12px 18px", borderBottom:`1px solid ${P.borderLight}` }}>
              {REPLY_PREP.threadMessage.map((paragraph, index) => (
                <p key={index} style={{ fontSize:14, color:P.inkSoft, lineHeight:1.7, marginBottom:index < REPLY_PREP.threadMessage.length - 1 ? 10 : 0, fontFamily:F }}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div style={{ padding:"12px 18px", background:P.warm, borderBottom:`1px solid ${P.borderLight}` }}>
              <div style={{ fontSize:11, color:P.inkFaint, marginBottom:5, fontWeight:500 }}>推荐回复方向</div>
              <p style={{ fontSize:13, color:P.ink, lineHeight:1.6, fontWeight:600, fontFamily:F }}>{REPLY_PREP.replyDirection}</p>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop:10 }}>
            <ActionButton label="✍️ 帮我写回复" primary={true} onClick={onWriteReply} />
            <ActionButton label="💬 聊聊怎么回" onClick={onOpenChat} />
          </div>
          <div style={{ marginTop:14, padding:"10px 14px", borderRadius:12, background:P.warm, border:`1px solid ${P.borderLight}` }}>
            <div style={{ fontSize:11, color:P.inkFaint, marginBottom:8 }}>换个姿态回复：</div>
            <div className="flex flex-wrap gap-1.5">
              {REPLY_PREP.alternativeStrategies.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onSelectStrategy(item.key)}
                  className="transition-all duration-150"
                  style={{
                    fontSize:12,
                    padding:"5px 12px",
                    borderRadius:16,
                    border:`1px solid ${P.border}`,
                    background:"#fff",
                    color:P.inkMuted,
                    cursor:"pointer",
                    fontFamily:F,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = P.mBg;
                    e.currentTarget.style.borderColor = P.mBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = P.border;
                  }}
                >
                  {item.strategy}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlternativeStrategyMsg({ strategyKey, onWriteReply, onOpenChat, showAnn }) {
  const data = ALT_STRATEGY_RESULTS[strategyKey];
  if (!data) return null;

  return (
    <div className="anim-up">
      {showAnn && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 点击备选后，不是再来一张“分析卡”，而是围绕老板指定的策略重新组织判断。重点是“换了这个方向之后，有什么不同的考量”。
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div style={{ maxWidth:470 }}>
          <AiLabel />
          <div style={{ background:"#fff", border:`1px solid ${P.border}`, borderRadius:"14px 14px 14px 4px", overflow:"hidden" }}>
            <div style={{ padding:"14px 18px 0" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize:14 }}>🧭</span>
                <span style={{ fontSize:14, fontWeight:600, color:P.ink, fontFamily:S }}>{data.selectedStrategy}</span>
              </div>
            </div>
            <div style={{ padding:"12px 18px", borderBottom:`1px solid ${P.borderLight}` }}>
              {data.threadMessage.map((paragraph, index) => (
                <p key={index} style={{ fontSize:14, color:P.inkSoft, lineHeight:1.7, marginBottom:index < data.threadMessage.length - 1 ? 10 : 0, fontFamily:F }}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div style={{ padding:"12px 18px", background:P.blueBg }}>
              <div style={{ fontSize:11, color:P.blue, marginBottom:5, fontWeight:600 }}>按这个方向回</div>
              <p style={{ fontSize:13, color:P.ink, lineHeight:1.6, fontWeight:600, fontFamily:F }}>{data.replyDirection}</p>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop:10 }}>
            <ActionButton label="✍️ 按这个方向起草" primary={true} onClick={onWriteReply} />
            <ActionButton label="💬 聊聊这条路" onClick={onOpenChat} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyDraftMsg({ sourceKey, onOpenChat, showAnn }) {
  const data = REPLY_VARIANTS[sourceKey];
  const [active, setActive] = useState(data.variants[0].label);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActive(data.variants[0].label);
    setCopied(false);
  }, [sourceKey, data.variants]);

  const activeVariant = data.variants.find((item) => item.label === active) || data.variants[0];

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(activeVariant.text);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="anim-up">
      {showAnn && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 回复草稿现在只消费 `variants[]`。无论来自主推方向还是备选策略，前端都统一成“语气切换 + 可直接复制”的组件。
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div style={{ maxWidth:470 }}>
          <AiLabel />
          <div style={{ background:"#fff", border:`1px solid ${P.borderLight}`, borderRadius:"14px 14px 14px 4px", overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${P.borderLight}` }}>
              <div className="flex items-center justify-between gap-4" style={{ marginBottom:8 }}>
                <span style={{ fontSize:13, color:P.ink, fontWeight:600, fontFamily:S }}>{data.title}</span>
                <span style={{ fontSize:11, color:P.inkFaint }}>复制到微信 / 钉钉 / 邮件</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {data.variants.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActive(item.label)}
                    className="transition-all duration-150"
                    style={{
                      fontSize:12,
                      padding:"3px 12px",
                      borderRadius:16,
                      border:"none",
                      cursor:"pointer",
                      fontFamily:F,
                      background:active === item.label ? P.ink : P.warm,
                      color:active === item.label ? "#f5f5f5" : P.inkMuted,
                      fontWeight:active === item.label ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding:"14px 18px" }}>
              <p style={{ fontSize:14, color:P.inkSoft, lineHeight:1.7, fontFamily:F, whiteSpace:"pre-line" }}>{activeVariant.text}</p>
            </div>
            <div className="flex gap-2" style={{ padding:"10px 16px", borderTop:`1px solid ${P.borderLight}` }}>
              <button
                onClick={copy}
                className="transition-all duration-150"
                style={{
                  flex:1,
                  padding:"8px 0",
                  borderRadius:10,
                  border:"none",
                  cursor:"pointer",
                  fontSize:13,
                  fontWeight:500,
                  fontFamily:F,
                  background:copied ? P.greenBg : P.ink,
                  color:copied ? P.green : "#f5f5f5",
                }}
              >
                {copied ? "✓ 已复制" : "复制"}
              </button>
              <button
                onClick={onOpenChat}
                style={{ padding:"8px 16px", borderRadius:10, border:`1px solid ${P.border}`, background:"#fff", cursor:"pointer", fontSize:13, color:P.inkMuted, fontFamily:F }}
              >
                聊聊怎么回
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedMattersMsg({ showAnn }) {
  const ts = {
    conflict:{ label:"前提冲突", bg:P.redBg, fg:P.red },
    dependency:{ label:"前序依赖", bg:P.amberBg, fg:P.amber },
  };

  return (
    <div className="anim-up">
      {showAnn && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 关联事件保留，但它不再是单独的分析维度；它的价值是给回复策略补张力，告诉老板这条回复会和哪些旧上下文发生牵连。
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div style={{ maxWidth:460 }}>
          <AiLabel />
          <Bubble>
            <p style={{ fontSize:13, color:P.inkMuted, marginBottom:10, fontFamily:F }}>这份汇报和你最近的两条线索有直接关系：</p>
            {RELATED_MATTERS.map((r, index) => {
              const s = ts[r.type];
              return (
                <div key={index} style={{ padding:"10px 14px", borderRadius:10, background:P.warm, border:`1px solid ${P.borderLight}`, marginBottom:index < RELATED_MATTERS.length - 1 ? 8 : 0 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:P.inkSoft }}>{r.source}</span>
                    <Pill bg={s.bg} fg={s.fg}>{s.label}</Pill>
                  </div>
                  <p style={{ fontSize:13, color:P.inkSoft, lineHeight:1.6, fontFamily:F }}>{r.text}</p>
                </div>
              );
            })}
          </Bubble>
        </div>
      </div>
    </div>
  );
}

function ThreadChatOpening({ anchor, showAnn, triggered, onTrigger }) {
  return (
    <div>
      {showAnn && triggered && (
        <div style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:8, padding:"6px 10px", marginBottom:8 }}>
          📌 深聊入口不再沿用旧意图，而是沿着当前回复策略抛一个对话锚点，让老板从“该怎么回”继续追问下去。
        </div>
      )}
      {triggered && (
        <div className="flex items-start gap-2.5" style={{ marginBottom:16 }}>
          <AiAvatar />
          <div style={{ maxWidth:440 }}>
            <AiLabel />
            <Bubble maxW={420}>{anchor}</Bubble>
          </div>
        </div>
      )}
      <div style={{ marginTop:16 }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onTrigger}
            style={{
              flex:1,
              background:P.warm,
              border:`1px solid ${triggered ? P.border : P.mBorder}`,
              borderRadius:14,
              padding:"11px 18px",
              fontSize:14,
              color:P.inkFaint,
              fontFamily:F,
              textAlign:"left",
              cursor:"text",
            }}
          >
            继续聊这份汇报要怎么回…
          </button>
          <button style={{ background:P.ink, color:"#f5f5f5", borderRadius:14, padding:"11px 20px", fontSize:14, fontWeight:500, border:"none", cursor:"pointer", fontFamily:F }}>发送</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Thread Content — reply preparation flow
   ═══════════════════════════════════════════════════════ */
function ThreadContent({ phase, showAnn, onPhaseChange, scrollContainerRef }) {
  const [personDone, setPersonDone] = useState(false);
  const [confirmedName, setConfirmedName] = useState(REPORT_META.ownerName);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [replySource, setReplySource] = useState(null);
  const [showRelated, setShowRelated] = useState(false);
  const [chatPromptTriggered, setChatPromptTriggered] = useState(false);

  useEffect(() => {
    if (phase === PH.personConfirm) {
      setPersonDone(false);
      setConfirmedName(REPORT_META.ownerName);
      setSelectedStrategy(null);
      setReplySource(null);
      setShowRelated(false);
      setChatPromptTriggered(false);
      return;
    }

    if (phase === PH.replyPrep) {
      setPersonDone(true);
      setSelectedStrategy(null);
      setReplySource(null);
      setChatPromptTriggered(false);
    }

    if (phase === PH.altStrategy) {
      setPersonDone(true);
      setSelectedStrategy(REPLY_PREP.alternativeStrategies[0].key);
      setReplySource(null);
      setChatPromptTriggered(false);
    }

    if (phase === PH.replyDraft) {
      setPersonDone(true);
      setSelectedStrategy(null);
      setReplySource("recommended");
      setChatPromptTriggered(false);
    }

    if (phase === PH.threadChat) {
      setPersonDone(true);
      setSelectedStrategy(null);
      setReplySource("recommended");
    }
  }, [phase]);

  useEffect(() => {
    if (!personDone) {
      setShowRelated(false);
      return;
    }
    const t = setTimeout(() => setShowRelated(true), 600);
    return () => clearTimeout(t);
  }, [personDone, selectedStrategy, replySource]);

  useEffect(() => {
    if (!(personDone && (phase === PH.threadChat || replySource)) || chatPromptTriggered) return;
    const node = scrollContainerRef?.current;
    if (!node) return;

    const handleScroll = () => {
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
      if (distance <= 24) {
        setChatPromptTriggered(true);
      }
    };

    handleScroll();
    node.addEventListener("scroll", handleScroll);
    return () => node.removeEventListener("scroll", handleScroll);
  }, [personDone, phase, replySource, chatPromptTriggered, scrollContainerRef]);

  const confirmPerson = (name) => {
    setConfirmedName(name);
    setPersonDone(true);
    onPhaseChange(PH.replyPrep);
  };

  const selectStrategy = (key) => {
    setSelectedStrategy(key);
    setReplySource(null);
    onPhaseChange(PH.altStrategy);
  };

  const writeRecommended = () => {
    setReplySource("recommended");
    onPhaseChange(PH.replyDraft);
  };

  const writeStrategyDraft = () => {
    if (!selectedStrategy) return;
    setReplySource(selectedStrategy);
    onPhaseChange(PH.replyDraft);
  };

  const openChat = () => {
    onPhaseChange(PH.threadChat);
  };

  const anchor = selectedStrategy === "partial"
    ? "如果你真要给他先放一部分预算，你最担心他会在哪个环节失控？我可以帮你把那句话提前卡进回复里。"
    : selectedStrategy === "confront"
      ? "如果你直接把上次执行打折的事点出来，你更想传递的是提醒、施压，还是划边界？这会决定回复的力度。"
      : "你现在更想卡住的是哪件事：上次 12 万预算的复盘，还是这次方案里被换掉的数据口径？我可以顺着那个点继续帮你想。";

  return (
    <div style={{ maxWidth:560, margin:"0 auto", paddingBottom:40 }}>
      <div style={{ marginBottom:20 }}>
        <FullAnalysisMsg showAnn={showAnn} />
      </div>

      <div style={{ marginBottom:20 }}>
        <PersonConfirmMsg onConfirm={confirmPerson} showAnn={showAnn} completed={personDone} confirmedName={confirmedName} />
      </div>

      {personDone && (
        <div style={{ marginBottom:20 }}>
          <ReplyPreparationMsg
            onWriteReply={writeRecommended}
            onSelectStrategy={selectStrategy}
            onOpenChat={openChat}
            showAnn={showAnn}
          />
        </div>
      )}

      {personDone && selectedStrategy && (
        <div style={{ marginBottom:20 }}>
          <AlternativeStrategyMsg
            strategyKey={selectedStrategy}
            onWriteReply={writeStrategyDraft}
            onOpenChat={openChat}
            showAnn={showAnn}
          />
        </div>
      )}

      {personDone && replySource && (
        <div style={{ marginBottom:20 }}>
          <ReplyDraftMsg sourceKey={replySource} onOpenChat={openChat} showAnn={showAnn} />
        </div>
      )}

      {personDone && showRelated && (
        <div style={{ marginBottom:20 }}>
          <RelatedMattersMsg showAnn={showAnn} />
        </div>
      )}

      {personDone && showRelated && (
        <div style={{ textAlign:"center", fontSize:12, color:P.inkFaint, padding:"8px 0" }}>
          关于「{REPORT_META.ownerName}」的档案已更新 · 这份汇报关联到 {RELATED_MATTERS.length} 条已有线索
        </div>
      )}

      {personDone && (phase === PH.threadChat || replySource) && (
        <div style={{ marginTop:16 }}>
          <ThreadChatOpening anchor={anchor} showAnn={showAnn} triggered={chatPromptTriggered} onTrigger={() => setChatPromptTriggered(true)} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════════════════ */
export default function ReportThreadDemo() {
  const [phase, setPhase] = useState(PH.idle);
  const [showAnn, setShowAnn] = useState(true);
  const [showThread, setShowThread] = useState(false);
  const [msgs, setMsgs] = useState([{ role:"ai", text:"你好，选个场景开始，或者直接聊聊你现在在想的事。" }]);
  const chatEnd = useRef(null);
  const threadScrollRef = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, phase]);

  const handleSubmit = () => {
    setPhase(PH.analyzing);
    setMsgs((prev) => [...prev, { role:"system", text:"📋 已提交汇报解读" }]);
    setTimeout(() => {
      setPhase(PH.replyPrep);
      setMsgs((prev) => [...prev, { role:"ai", text:MAIN_ANALYSIS.userMessage, hasCard:true }]);
    }, 3000);
  };

  const triggerError = () => {
    setPhase(PH.error);
    if (!msgs.some((m) => m.text?.includes("已提交"))) {
      setMsgs((prev) => [...prev, { role:"system", text:"📋 已提交汇报解读" }]);
    }
    setTimeout(() => {
      setMsgs((prev) => [...prev, { role:"error", text:"文件解析失败：PPT 中包含大量图片，文字内容不足以进行有效分析。请尝试上传文字版汇报或直接粘贴内容。" }]);
    }, 1500);
  };

  const hasThread = phase !== PH.idle && phase !== PH.submitPopup;
  const threadPhases = [PH.personConfirm, PH.replyPrep, PH.altStrategy, PH.replyDraft, PH.threadChat];

  const openThreadAt = (nextPhase) => {
    setPhase(nextPhase);
    setShowThread(true);
    if (!msgs.some((m) => m.hasCard)) {
      const base = msgs.some((m) => m.text?.includes("已提交")) ? [] : [{ role:"system", text:"📋 已提交汇报解读" }];
      setMsgs((prev) => [...prev, ...base, { role:"ai", text:MAIN_ANALYSIS.userMessage, hasCard:true }]);
    }
  };

  const navItems = [
    { key:PH.idle, label:"主对话流", icon:"💬" },
    { key:PH.submitPopup, label:"提交弹窗", icon:"📋" },
    { sep:true, label:"── 提交后 ──" },
    { key:PH.analyzing, label:"分析中（typing）", icon:"⏳" },
    { key:PH.error, label:"分析失败", icon:"❌" },
    { sep:true, label:"── Thread 内 ──" },
    { key:PH.personConfirm, label:"人物确认", icon:"👤" },
    { key:PH.replyPrep, label:"回复准备", icon:"💬" },
    { key:PH.altStrategy, label:"备选策略", icon:"🧭" },
    { key:PH.replyDraft, label:"回复草稿", icon:"✍️" },
    { key:PH.threadChat, label:"深度对话", icon:"💭" },
  ];

  return (
    <>
      <style>{STYLE}</style>
      <div className="h-screen flex flex-col" style={{ background:P.sb, fontFamily:F }}>
        <div className="flex items-center justify-between shrink-0" style={{ background:"#161616", borderBottom:"1px solid #2a2a2a", padding:"7px 16px" }}>
          <span style={{ color:"#ccc", fontWeight:700, fontSize:13 }}>Demo 4/8 · 汇报解读 Thread — 回复准备流 v3</span>
          <label className="flex items-center gap-2" style={{ fontSize:12, color:"#777" }}>
            <input type="checkbox" checked={showAnn} onChange={(e) => setShowAnn(e.target.checked)} style={{ accentColor:P.accent }} /> 设计批注
          </label>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col shrink-0" style={{ width:240, background:P.sb, borderRight:"1px solid #2a2a2a" }}>
            <div style={{ padding:12, borderBottom:"1px solid #2a2a2a" }}>
              <div className="flex flex-col gap-0.5">
                {[{ key:"chat", icon:"💬", label:"对话" }, { key:"people", icon:"👥", label:"人脉", badge:"内测" }, { key:"matters", icon:"🗂", label:"事项", badge:"内测" }, { key:"network", icon:"🔗", label:"人脉圈", badge:"Vision" }].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
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
                      width:"100%",
                      padding:"8px 12px",
                      borderRadius:10,
                      fontSize:13,
                      fontWeight:500,
                      border:"none",
                      cursor:"pointer",
                      textAlign:"left",
                      fontFamily:F,
                      ...(item.key === "chat" && !showThread ? { background:P.sbActive, color:"#fff", boxShadow:`inset 3px 0 0 ${P.accent}` } : { background:"transparent", color:"#aaa" }),
                    }}
                    onMouseEnter={(e) => {
                      if (!(item.key === "chat" && !showThread)) e.currentTarget.style.background = P.sbHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!(item.key === "chat" && !showThread)) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize:16 }}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span style={{ marginLeft:"auto", fontSize:10, background:"#333", color:"#888", padding:"2px 6px", borderRadius:4 }}>{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ padding:12 }}>
              <div style={{ fontSize:10, color:"#666", letterSpacing:".1em", fontWeight:600, marginBottom:8, paddingLeft:4, textTransform:"uppercase" }}>进行中</div>
              {hasThread && (
                <div
                  onClick={() => {
                    if (threadPhases.includes(phase)) setShowThread(true);
                  }}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
                  style={{ background:showThread ? P.sbActive : "transparent", marginBottom:2, ...(showThread ? { boxShadow:`inset 3px 0 0 ${P.accent}` } : {}) }}
                  onMouseEnter={(e) => {
                    if (!showThread) e.currentTarget.style.background = P.sbHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!showThread) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="text-lg mt-0.5 shrink-0">📋</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={phase === PH.analyzing ? "pulse-glow" : ""} style={{ width:6, height:6, borderRadius:"50%", background:phase === PH.analyzing ? "#b08d3a" : phase === PH.error ? P.red : P.green, display:"inline-block", flexShrink:0 }} />
                      <span style={{ fontSize:13, fontWeight:500, color:"#e0e0e0", fontFamily:F }} className="truncate">{REPORT_META.title}</span>
                    </div>
                    <p style={{ fontSize:11, color:"#888", marginTop:2, fontFamily:F }} className="truncate">
                      {phase === PH.analyzing ? "正在分析…" : phase === PH.error ? "分析失败" : "先确认人，再想怎么回"}
                    </p>
                    <span style={{ fontSize:11, color:"#666" }}>刚刚</span>
                  </div>
                </div>
              )}
              {SIDEBAR_THREADS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
                  style={{ background:"transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = P.sbHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="text-lg mt-0.5 shrink-0">{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span style={{ width:6, height:6, borderRadius:"50%", background:P.green, display:"inline-block", flexShrink:0 }} />
                      <span style={{ fontSize:13, fontWeight:500, color:"#e0e0e0", fontFamily:F }} className="truncate">{t.title}</span>
                    </div>
                    <p style={{ fontSize:11, color:"#888", marginTop:2, fontFamily:F }} className="truncate">{t.summary}</p>
                    <span style={{ fontSize:11, color:"#666" }}>{t.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding:12, borderTop:"1px solid #2a2a2a" }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width:32, height:32, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${P.accent},#a07050)`, color:"#fff", fontSize:13, fontWeight:700 }}>夏</div>
                <div>
                  <div style={{ fontSize:13, color:"#e0e0e0", fontWeight:500 }}>夏总</div>
                  <div style={{ fontSize:11, color:"#777" }}>制造业 · 50人团队</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0" style={{ background:P.parchment }}>
            {showThread && (
              <div className="shrink-0 flex items-center gap-3" style={{ padding:"10px 24px", borderBottom:`1px solid ${P.border}`, background:"#fff" }}>
                <button onClick={() => setShowThread(false)} style={{ fontSize:12, color:P.inkFaint, background:"none", border:"none", cursor:"pointer" }}>← 主对话</button>
                <span style={{ color:P.border }}>|</span>
                <span style={{ fontSize:16 }}>📋</span>
                <span style={{ fontSize:14, fontWeight:600, color:P.ink, fontFamily:S }}>{REPORT_META.title}</span>
                <span style={{ fontSize:11, color:P.inkFaint }}>{REPORT_META.time} · {REPORT_META.ownerHint} · {REPORT_META.format}</span>
              </div>
            )}

            {showThread ? (
              <div ref={threadScrollRef} className="flex-1 overflow-y-auto" style={{ padding:"24px 28px" }}>
                <ThreadContent phase={phase} showAnn={showAnn} onPhaseChange={setPhase} scrollContainerRef={threadScrollRef} />
              </div>
            ) : (
              <>
                <div className="shrink-0 flex items-center gap-3" style={{ padding:"12px 24px", borderBottom:`1px solid ${P.border}` }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:P.inkSoft, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                    <span style={{ fontSize:11, color:"#fff", fontWeight:700 }}>AI</span>
                    <div style={{ position:"absolute", bottom:-1, right:-2, width:14, height:14, borderRadius:"50%", background:P.accent, color:"#fff", fontSize:7, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>AI</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize:15, fontWeight:700, color:P.ink, fontFamily:S }}>诸葛</span>
                      <span style={{ fontSize:9, fontWeight:700, background:P.accentBg, color:P.accent, padding:"2px 6px", borderRadius:4 }}>AI</span>
                      <span style={{ fontSize:10, fontWeight:500, background:P.greenBg, color:P.green, padding:"2px 8px", borderRadius:10 }}>在线</span>
                    </div>
                    <div style={{ fontSize:12, color:P.inkFaint, marginTop:1 }}>🎯 只站你这边</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ padding:"24px 28px" }}>
                  <div style={{ maxWidth:560, margin:"0 auto" }}>
                    {showAnn && phase === PH.idle && (
                      <div className="anim-in" style={{ fontSize:11, color:P.accent, background:P.accentBg, borderRadius:10, padding:"8px 12px", marginBottom:16 }}>
                        📌 主会话现在直接给完整内容判断，不再靠“元数据卡片 + 钩子句”制造信息缺口。内容判断先解决“这份汇报值不值得操心”，Thread 再解决“知道是谁之后怎么回”。
                      </div>
                    )}
                    {msgs.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} anim-up`} style={{ marginBottom:16, animationDelay:`${index * 50}ms` }}>
                        <div style={{ maxWidth:460 }}>
                          {msg.role === "ai" && (
                            <div className="flex items-center gap-1.5" style={{ marginBottom:4 }}>
                              <div style={{ width:20, height:20, borderRadius:"50%", background:P.inkSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <span style={{ fontSize:8, color:"#fff", fontWeight:700 }}>AI</span>
                              </div>
                              <span style={{ fontSize:11, color:P.inkFaint }}>诸葛</span>
                            </div>
                          )}
                          {msg.hasCard ? (
                            <ReportSummaryCard onOpenThread={() => openThreadAt(PH.personConfirm)} />
                          ) : msg.role === "system" ? (
                            <div style={{ fontSize:12, color:P.inkMuted, background:P.warm, borderRadius:10, padding:"8px 14px", border:`1px solid ${P.borderLight}` }}>{msg.text}</div>
                          ) : msg.role === "error" ? (
                            <div style={{ fontSize:12, color:P.red, background:P.redBg, borderRadius:10, padding:"8px 14px", border:`1px solid ${P.redBorder}` }}>{msg.text}</div>
                          ) : (
                            <div style={{ borderRadius:msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding:"12px 16px", fontSize:14, lineHeight:1.65, fontFamily:F, ...(msg.role === "user" ? { background:P.ink, color:"#f0f0f0" } : { background:"#fff", color:P.inkSoft, border:`1px solid ${P.borderLight}` }) }}>{msg.text}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {phase === PH.analyzing && (
                      <div className="flex justify-start anim-in" style={{ marginBottom:16 }}>
                        <div>
                          <div className="flex items-center gap-1.5" style={{ marginBottom:4 }}>
                            <div style={{ width:20, height:20, borderRadius:"50%", background:P.inkSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <span style={{ fontSize:8, color:"#fff", fontWeight:700 }}>AI</span>
                            </div>
                            <span style={{ fontSize:11, color:P.inkFaint }}>诸葛</span>
                          </div>
                          <div style={{ background:"#fff", border:`1px solid ${P.borderLight}`, borderRadius:"14px 14px 14px 4px", padding:"12px 16px" }}>
                            <div className="flex items-center gap-1" style={{ padding:"4px 0" }}>
                              {[1, 2, 3].map((i) => (
                                <div key={i} className={`dot-${i}`} style={{ width:6, height:6, borderRadius:"50%", background:P.inkFaint }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEnd} />
                  </div>
                </div>

                <div className="shrink-0" style={{ padding:"12px 28px 16px", borderTop:`1px solid ${P.border}`, background:P.parchment }}>
                  {phase === PH.analyzing && (
                    <div className="anim-in flex items-center gap-3" style={{ padding:"8px 14px", borderRadius:10, background:P.mBg, border:`1px solid ${P.mBorder}`, marginBottom:10 }}>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`dot-${i}`} style={{ width:5, height:5, borderRadius:"50%", background:P.mAccent }} />
                        ))}
                      </div>
                      <span style={{ fontSize:13, color:P.mAccent, fontFamily:F }}>正在分析汇报内容…</span>
                    </div>
                  )}
                  <div className="flex gap-2" style={{ marginBottom:8 }}>
                    {[{ icon:"🎙", label:"会议" }, { icon:"📋", label:"汇报", active:true, onClick:() => setPhase(PH.submitPopup) }, { icon:"📖", label:"文章" }].map((s, index) => (
                      <button
                        key={index}
                        onClick={s.onClick}
                        className="flex items-center gap-1.5 transition-all duration-200"
                        style={{
                          fontSize:12,
                          color:s.active ? P.mAccent : P.inkMuted,
                          border:`1px solid ${s.active ? P.mBorder : P.border}`,
                          borderRadius:8,
                          padding:"5px 12px",
                          background:s.active ? P.mBg : "#fff",
                          cursor:s.onClick ? "pointer" : "default",
                          fontFamily:F,
                          fontWeight:s.active ? 500 : 400,
                        }}
                      >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ flex:1, background:P.warm, border:`1px solid ${P.border}`, borderRadius:14, padding:"11px 18px", fontSize:14, color:P.inkFaint, fontFamily:F }}>聊聊你现在脑子里最乱的一件事…</div>
                    <button style={{ background:P.ink, color:"#f5f5f5", borderRadius:14, padding:"11px 20px", fontSize:14, fontWeight:500, border:"none", cursor:"pointer", fontFamily:F }}>发送</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="shrink-0 flex flex-col" style={{ width:170, background:"#fff", borderLeft:`1px solid ${P.border}` }}>
            <div style={{ padding:"12px 10px 6px", fontSize:10, color:P.inkFaint, fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Demo 交互阶段</div>
            <div className="flex-1 overflow-y-auto" style={{ padding:"0 6px" }}>
              {navItems.map((s, index) => (
                s.sep ? (
                  <div key={index} style={{ padding:"6px 8px", fontSize:9, color:P.inkFaint, textAlign:"center" }}>{s.label}</div>
                ) : (
                  <button
                    key={s.key}
                    onClick={() => {
                      if (s.key === PH.idle) {
                        setPhase(PH.idle);
                        setShowThread(false);
                      } else if (s.key === PH.submitPopup) {
                        setPhase(PH.submitPopup);
                      } else if (s.key === PH.analyzing) {
                        setPhase(PH.analyzing);
                        if (!msgs.some((m) => m.text?.includes("已提交"))) {
                          setMsgs((prev) => [...prev, { role:"system", text:"📋 已提交汇报解读" }]);
                        }
                      } else if (s.key === PH.error) {
                        triggerError();
                      } else {
                        openThreadAt(s.key);
                      }
                    }}
                    className="transition-all duration-150"
                    style={{
                      display:"flex",
                      alignItems:"center",
                      gap:6,
                      padding:"5px 8px",
                      margin:"1px 0",
                      borderRadius:6,
                      border:"none",
                      cursor:"pointer",
                      textAlign:"left",
                      width:"100%",
                      background:phase === s.key ? P.accentBg : "transparent",
                      color:phase === s.key ? P.accent : P.inkMuted,
                      fontWeight:phase === s.key ? 600 : 400,
                      fontSize:11,
                      fontFamily:F,
                    }}
                  >
                    <span style={{ fontSize:12 }}>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        </div>

        {phase === PH.submitPopup && <SubmitPopup onSubmit={handleSubmit} onClose={() => setPhase(PH.idle)} />}
      </div>
    </>
  );
}
