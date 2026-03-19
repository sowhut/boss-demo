import { useState, useEffect, useRef } from "react";

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
   Phases & Data
   ═══════════════════════════════════════════════════════ */
const PH = { idle:"idle", submitPopup:"submitPopup", analyzing:"analyzing", error:"error", personConfirm:"personConfirm", intentResult:"intentResult", switchedIntent:"switchedIntent", replyDraft:"replyDraft", threadChat:"threadChat" };

const INTENTS = [
  { key:"check", label:"检查汇报", icon:"🔍", desc:"防糊弄、查可信度" },
  { key:"decide", label:"支撑决策", icon:"⚖️", desc:"该不该批" },
  { key:"person", label:"看清这个人", icon:"👤", desc:"综合判断" },
  { key:"know", label:"了解新人", icon:"📋", desc:"建立初步印象" },
  { key:"prepare", label:"准备谈话", icon:"💬", desc:"准备和他聊" },
];

const EXISTING_PEOPLE = [
  { id:"p1", name:"张总", dept:"市场部", avatar:"张", color:"#6b5ba8", bgColor:"#e8e0f8", reports:3 },
  { id:"p2", name:"李总", dept:"产品部", avatar:"李", color:"#4a72b0", bgColor:"#dce6f5", reports:5 },
  { id:"p3", name:"王总", dept:"运营部", avatar:"王", color:"#5a8a6a", bgColor:"#dff0e5", reports:2 },
];

const JUDGMENTS = {
  check: "可信度中等。数据口径和上周不一致，而且上次要的渠道评估报告这次没提。",
  decide: "他要你批15万。支持理由存在，但方案的前提假设没有验证过。",
  person: "这是你第三次看他的汇报。综合来看，他有个模式：承诺激进，交付打折。",
  know: "这是你第一次收到他的材料，我帮你建个初步印象。",
  prepare: "基于前几次汇报的信号，我帮你准备和他聊的要点。",
};

const CHECK_DATA = {
  intention: "批准15万渠道推广预算，用于Q2线下拓客",
  credibility: { score:"中", reason:"数据口径与上周不一致，第三部分缺少数据来源" },
  problems: [
    { type:"logic", label:"逻辑问题", text:"转化率假设基于去年数据，但今年渠道结构已经变了" },
    { type:"honesty", label:"诚意问题", text:"上月说转化率15%，这次换成了「用户活跃度提升」——指标偷换了" },
    { type:"missing", label:"信息缺失", text:"竞品动态只字未提，但这是上次你要求补充的" },
  ],
  commitment: "上次承诺月底完成渠道评估报告，这次只字未提",
};

const DECIDE_DATA = {
  rows: [
    { label:"决策点", text:"他要你决定：是否批准15万渠道推广预算", icon:"📎" },
    { label:"支持理由", text:"如果渠道跑通，Q2获客成本有望降30%，打开线下增量空间", icon:"✅", bg:P.greenBg },
    { label:"反对理由", text:"上次类似预算批了12万，ROI只有预期的40%。同一个人，同一类方案", icon:"❌", bg:P.redBg },
    { label:"风险点", text:"执行团队人手不足，即便预算批了也可能花不出去", icon:"⚠️", bg:P.amberBg },
    { label:"关键假设", text:"方案成立的前提：现有转化率能维持——但数据口径刚被换过，这个前提本身存疑", icon:"💡", bg:P.purpleBg },
    { label:"信息缺口", text:"缺少竞品在同渠道的投放数据。没有这个参照，「15万够不够」无从判断", icon:"❓" },
  ],
};

const PERSON_DATA = {
  status:"下滑", pattern:"承诺激进，交付打折",
  details: [
    "过去3次承诺的deadline都延期了，平均延期12天",
    "汇报中习惯用大词（「突破性进展」「显著提升」），但数据支撑偏弱",
    "遇到追问时倾向于转移话题到新计划，回避旧承诺",
  ],
  thisTime: "本次汇报印证了「偷换指标」的模式——转化率不好看就换成活跃度",
};

const REPLY_TONES = [
  { key:"direct", label:"直接", text:"收到。两个问题：第二部分数据口径为什么和上周不一样？上次说月底完成的渠道评估报告进展如何？这两个说清楚再聊预算。" },
  { key:"gentle", label:"委婉", text:"收到，整体方向不错。有两个地方想再了解一下：第二部分的数据统计方式和上周有些不同，方便说明一下变化原因吗？另外渠道评估报告的进度也同步一下。" },
  { key:"short", label:"简短", text:"收到。数据口径为什么换了？渠道评估报告呢？回复后再聊预算。" },
];

const TALK_TONES = [
  { key:"pressure", label:"施压", text:"张总，有几件事想当面聊。上次说月底完成的渠道评估，现在什么进度？另外这次汇报的数据口径和上次不一样，什么原因？我需要一个明确的时间表。" },
  { key:"explore", label:"探底", text:"张总，最近渠道这块推得怎么样？我看汇报里数据维度有些调整，是业务逻辑变了还是有其他考量？另外上次聊的渠道评估，你那边遇到什么卡点了？" },
  { key:"support", label:"支持", text:"张总，渠道推广这块我知道不容易，想听听你现在最大的困难是什么。数据这块如果需要分析支持可以找数据组协助，别一个人扛。" },
];

const RELATED_MATTERS = [
  { source:"李总上周的汇报", text:"也提到Q2渠道推广，但他的假设是「需要新建团队」——和张总「现有团队能搞定」的前提矛盾", type:"conflict" },
  { source:"上月销售周会", text:"讨论Q2预算时，你当时说「先看渠道评估再做决定」——这个评估张总还没交", type:"dependency" },
];

const SIDEBAR_THREADS = [
  { id:1, icon:"🎙", title:"今天的销售周会", summary:"李总对新业务态度有变化", time:"2小时前" },
  { id:3, icon:"📖", title:"消费降级趋势文章", summary:"如果趋势成立，高端线需重新评估", time:"昨天" },
];


/* ═══════════════════════════════════════════════════════
   UI Primitives
   ═══════════════════════════════════════════════════════ */
function Overlay({children,onClose}){return<div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose?.()}}>{children}</div>}
function Pill({children,bg,fg}){return<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:bg,color:fg,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>}
function AiAvatar({size=24}){return<div style={{width:size,height:size,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:size*0.33,color:"#fff",fontWeight:700}}>AI</span></div>}
function AiLabel(){return<span style={{fontSize:11,color:P.inkFaint,display:"block",marginBottom:3}}>诸葛</span>}
function Bubble({children,maxW=460}){return<div style={{background:"#fff",border:`1px solid ${P.borderLight}`,borderRadius:"14px 14px 14px 4px",padding:"14px 18px",maxWidth:maxW,fontSize:14,color:P.inkSoft,lineHeight:1.65,fontFamily:F}}>{children}</div>}


/* ═══════════════════════════════════════════════════════
   Submit Popup — Upload OR Paste (mutually exclusive)
   ═══════════════════════════════════════════════════════ */
function SubmitPopup({onSubmit,onClose}){
  const[mode,setMode]=useState(null);
  const[file,setFile]=useState(null);
  const[text,setText]=useState("");
  const[prog,setProg]=useState(0);
  const[uploading,setUploading]=useState(false);

  const simUpload=()=>{
    setFile({name:"Q2渠道推广方案.pptx",size:"3.2 MB",pages:18});
    setMode("file"); setUploading(true);
    let p=0; const iv=setInterval(()=>{p+=Math.random()*20+10;if(p>=100){p=100;clearInterval(iv);setUploading(false)}setProg(Math.min(p,100))},180);
  };
  const onText=v=>{setText(v);if(v.trim())setMode("text");else if(!file)setMode(null)};
  const ok=(mode==="file"&&!uploading)||(mode==="text"&&text.trim().length>0);

  return<Overlay onClose={onClose}><div className="anim-slide" style={{width:500,background:"#fff",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,.18)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
    <div className="flex items-center justify-between shrink-0" style={{padding:"20px 24px 0"}}>
      <h2 style={{fontSize:18,fontWeight:700,color:P.ink,fontFamily:S}}>汇报解读</h2>
      <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:P.inkFaint,lineHeight:1}}>×</button>
    </div>
    <div style={{padding:"20px 24px"}}>
      {/* Upload zone */}
      {!file?<button onClick={simUpload} className="transition-all duration-200" disabled={mode==="text"} style={{width:"100%",padding:"32px 20px",borderRadius:14,border:`2px dashed ${mode==="text"?P.warmDark:P.mBorder}`,background:mode==="text"?P.warm:P.mBg,cursor:mode==="text"?"not-allowed":"pointer",textAlign:"center",opacity:mode==="text"?0.5:1}} onMouseEnter={e=>{if(mode!=="text")e.currentTarget.style.borderColor=P.mAccent}} onMouseLeave={e=>{if(mode!=="text")e.currentTarget.style.borderColor=P.mBorder}}>
        <div style={{fontSize:24,marginBottom:6}}>📎</div>
        <div style={{fontSize:14,color:P.inkSoft,fontWeight:500,fontFamily:F}}>点击选择或拖拽文件到此处</div>
        <div style={{fontSize:11,color:P.inkFaint,marginTop:6,fontFamily:F}}>支持 PPT / Word / PDF / 图片</div>
      </button>
      :<div className="anim-up" style={{padding:"14px 16px",borderRadius:14,border:`1px solid ${P.mBorder}`,background:P.mBg}}>
        <div className="flex items-center gap-3"><span style={{fontSize:24}}>📄</span><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><span style={{fontSize:14,fontWeight:500,color:P.ink,fontFamily:F}}>{file.name}</span><button onClick={()=>{setFile(null);setMode(null);setProg(0)}} style={{background:"none",border:"none",cursor:"pointer",color:P.inkFaint,fontSize:16}}>×</button></div><div className="flex items-center gap-3" style={{marginTop:4}}><span style={{fontSize:11,color:P.inkFaint}}>{file.size}</span><span style={{fontSize:11,color:P.inkFaint}}>{file.pages}页</span>{!uploading&&<span style={{fontSize:11,color:P.green,fontWeight:500}}>✓ 就绪</span>}</div>{uploading&&<div style={{marginTop:6,width:"100%",height:3,borderRadius:2,background:P.warmDark}}><div style={{width:`${prog}%`,height:"100%",borderRadius:2,background:P.mAccent,transition:"width .2s ease"}}/></div>}</div></div>
      </div>}

      <div className="flex items-center gap-3" style={{margin:"16px 0"}}><div style={{flex:1,height:1,background:P.border}}/><span style={{fontSize:12,color:P.inkFaint}}>或者</span><div style={{flex:1,height:1,background:P.border}}/></div>

      <textarea value={text} onChange={e=>onText(e.target.value)} placeholder="直接粘贴汇报内容文本…" disabled={mode==="file"} style={{width:"100%",minHeight:100,padding:"14px 16px",borderRadius:14,border:`1px solid ${P.border}`,background:mode==="file"?P.warmDark:P.warm,fontSize:13,color:P.ink,fontFamily:F,outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box",opacity:mode==="file"?0.5:1}} onFocus={e=>{if(mode!=="file")e.target.style.borderColor=P.mAccent}} onBlur={e=>e.target.style.borderColor=P.border}/>
    </div>
    <div className="shrink-0 flex justify-end gap-3" style={{padding:"16px 24px",borderTop:`1px solid ${P.borderLight}`}}>
      <button onClick={onClose} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${P.border}`,background:"#fff",cursor:"pointer",fontSize:14,color:P.inkMuted,fontFamily:F}}>取消</button>
      <button onClick={()=>onSubmit()} disabled={!ok} className="transition-all duration-150" style={{padding:"10px 28px",borderRadius:10,border:"none",cursor:ok?"pointer":"not-allowed",background:ok?P.ink:P.warmDark,color:ok?"#f5f5f5":P.inkFaint,fontSize:14,fontWeight:600,fontFamily:F,opacity:ok?1:0.6}}>提交分析</button>
    </div>
  </div></Overlay>;
}


/* ═══════════════════════════════════════════════════════
   Result Card (main chat — pure metadata)
   ═══════════════════════════════════════════════════════ */
function ReportResultCard({onExpand}){
  return<div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.mBorder}`,overflow:"hidden",maxWidth:420,cursor:"pointer"}} onClick={onExpand}>
    <div style={{padding:"14px 18px"}}><div className="flex items-center gap-2" style={{marginBottom:6}}><span style={{fontSize:16}}>📋</span><span style={{fontSize:15,fontWeight:600,color:P.ink,fontFamily:S}}>Q2渠道推广方案</span></div><div className="flex items-center gap-3" style={{fontSize:12,color:P.inkFaint}}><span>今天 15:20</span><span>·</span><span>张明（市场部）</span><span>·</span><span>PPT · 18页</span></div></div>
    <div className="flex" style={{borderTop:`1px solid ${P.borderLight}`}}><button className="flex-1 transition-all duration-150" style={{padding:10,fontSize:13,color:P.mAccent,fontWeight:500,background:"none",border:"none",borderRight:`1px solid ${P.borderLight}`,cursor:"pointer",fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=P.mBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>展开看看</button><button className="flex-1 transition-all duration-150" style={{padding:10,fontSize:13,color:P.inkMuted,background:"none",border:"none",cursor:"pointer",fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=P.warm} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>聊聊这份汇报</button></div>
  </div>;
}


/* ═══════════════════════════════════════════════════════
   Thread Messages
   ═══════════════════════════════════════════════════════ */

/* Person Confirm */
function PersonConfirmMsg({onConfirm,showAnn}){
  const[selected,setSelected]=useState(null);
  const[custom,setCustom]=useState("");
  const[done,setDone]=useState(false);
  const confirm=()=>{setDone(true);onConfirm(selected?.name||custom||"张总")};
  return<div className="anim-up">
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:8}}>📌 AI先把完整版结论吐出来，再补一张人物确认卡片。这样老板先看到分析价值，再顺手校正身份归属；同一个人第二次出现时几乎一键完成。</div>}
    <div className="flex items-start gap-2.5"><AiAvatar/><div style={{maxWidth:440}}><AiLabel/>
      <Bubble><p style={{marginBottom:12}}>文档落款写的是「市场中心」，没有具名。这是谁的汇报？</p>
        {!done?<div>
          <div className="flex items-center gap-2 flex-wrap">
            {EXISTING_PEOPLE.map(p=><button key={p.id} onClick={()=>{setSelected(p);setCustom("")}} className="flex items-center gap-1.5 transition-all duration-150" style={{padding:"6px 12px",borderRadius:20,fontSize:13,cursor:"pointer",fontFamily:F,border:`1px solid ${selected?.id===p.id?p.color:P.border}`,background:selected?.id===p.id?p.bgColor:"#fff",color:selected?.id===p.id?p.color:P.inkMuted,fontWeight:selected?.id===p.id?600:400}}>
              <span style={{width:18,height:18,borderRadius:"50%",background:p.bgColor,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:p.color}}>{p.avatar}</span>{p.name}
            </button>)}
            <input value={custom} onChange={e=>{setCustom(e.target.value);setSelected(null)}} placeholder="或输入姓名" style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${P.border}`,fontSize:13,color:P.ink,fontFamily:F,outline:"none",width:100,background:P.warm}} onFocus={e=>e.target.style.borderColor=P.mAccent} onBlur={e=>e.target.style.borderColor=P.border}/>
          </div>
          {(selected||custom.trim())&&<button onClick={confirm} className="anim-in transition-all duration-150" style={{marginTop:10,padding:"6px 20px",borderRadius:20,border:"none",background:P.ink,color:"#f5f5f5",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:F}}>确认</button>}
        </div>
        :<div className="anim-in flex items-center gap-2" style={{padding:"6px 12px",borderRadius:10,background:P.greenBg}}><span style={{fontSize:11,color:P.green,fontWeight:500}}>✓ 已确认：{selected?.name||custom}</span></div>}
      </Bubble>
    </div></div>
  </div>;
}

/* Full Analysis before person confirmation */
function FullConclusionMsg({showAnn}){
  return<div className="anim-up">
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:8}}>📌 主会话里先抛一句判断，Thread 打开后先补全成完整版分析，再进入人物确认。先让老板看到值，再让他做低成本校正。</div>}
    <div className="flex items-start gap-2.5"><AiAvatar/><div style={{maxWidth:460}}><AiLabel/>
      <div style={{background:"#fff",border:`1px solid ${P.border}`,borderRadius:"14px 14px 14px 4px",overflow:"hidden"}}>
        <div className="flex items-center gap-2" style={{padding:"14px 18px 0"}}><span style={{fontSize:14}}>📌</span><span style={{fontSize:14,fontWeight:600,color:P.ink,fontFamily:S}}>完整版结论</span></div>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${P.borderLight}`}}>
          <p style={{fontSize:15,color:P.ink,fontWeight:600,lineHeight:1.65,fontFamily:F}}>可信度中等。数据口径和上周不一致，而且上次要的渠道评估这次没提。</p>
        </div>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${P.borderLight}`}}>
          <div style={{fontSize:11,color:P.inkFaint,marginBottom:6,fontWeight:500}}>为什么这么判断</div>
          <div className="flex items-start gap-2" style={{marginBottom:8}}><Pill bg={P.amberBg} fg={P.amber}>口径变化</Pill><p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>这次把核心结果从「转化率」换成了「活跃度」，和上周不是同一套衡量方式，没法直接比较真实进展。</p></div>
          <div className="flex items-start gap-2"><Pill bg={P.redBg} fg={P.red}>承诺缺失</Pill><p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>你上次明确要的渠道评估报告，这次汇报完全没回应，说明关键前提还没被补齐。</p></div>
        </div>
        <div style={{padding:"12px 18px",background:P.warm}}>
          <div style={{fontSize:11,color:P.inkFaint,marginBottom:4,fontWeight:500}}>这意味着什么</div>
          <p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>这份汇报可以继续看，但还不够支撑你直接批预算。更像是在把坏消息往后拖，而不是把关键问题说清楚。</p>
        </div>
      </div>
    </div></div>
  </div>;
}

/* Intent Card: Check */
function CheckCard(){
  const d=CHECK_DATA;
  const cc={高:{bg:P.greenBg,fg:P.green},中:{bg:P.amberBg,fg:P.amber},低:{bg:P.redBg,fg:P.red}}[d.credibility.score];
  const tc={logic:{bg:P.amberBg,fg:P.amber},honesty:{bg:P.redBg,fg:P.red},missing:{bg:P.warm,fg:P.inkMuted}};
  return<div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.border}`,overflow:"hidden",maxWidth:460}}>
    <div className="flex items-center gap-2" style={{padding:"14px 18px 0"}}><span style={{fontSize:14}}>🔍</span><span style={{fontSize:14,fontWeight:600,color:P.ink,fontFamily:S}}>检查这份汇报</span></div>
    <div style={{padding:"12px 18px",borderBottom:`1px solid ${P.borderLight}`}}><div style={{fontSize:11,color:P.inkFaint,marginBottom:4,fontWeight:500}}>他想让你做什么</div><p style={{fontSize:14,color:P.ink,fontWeight:500,fontFamily:F}}>{d.intention}</p></div>
    <div style={{padding:"12px 18px",borderBottom:`1px solid ${P.borderLight}`}}><div className="flex items-center justify-between" style={{marginBottom:4}}><span style={{fontSize:11,color:P.inkFaint,fontWeight:500}}>可信度</span><Pill bg={cc.bg} fg={cc.fg}>{d.credibility.score}</Pill></div><p style={{fontSize:13,color:P.inkSoft,fontFamily:F}}>{d.credibility.reason}</p></div>
    <div style={{padding:"12px 18px",borderBottom:`1px solid ${P.borderLight}`}}><div style={{fontSize:11,color:P.inkFaint,marginBottom:8,fontWeight:500}}>问题点</div>{d.problems.map((p,i)=>{const c=tc[p.type];return<div key={i} className="flex items-start gap-2" style={{marginBottom:i<d.problems.length-1?8:0}}><Pill bg={c.bg} fg={c.fg}>{p.label}</Pill><p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>{p.text}</p></div>})}</div>
    <div style={{padding:"12px 18px",background:P.redBg}}><div className="flex items-center gap-1.5" style={{marginBottom:4}}><span style={{fontSize:11,color:P.red,fontWeight:600}}>承诺追踪</span><Pill bg="#fce4e4" fg={P.red}>新发现</Pill></div><p style={{fontSize:13,color:"#8b3a3a",fontFamily:F}}>{d.commitment}</p></div>
  </div>;
}

/* Intent Card: Decide */
function DecideCard(){
  return<div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.border}`,overflow:"hidden",maxWidth:460}}>
    <div className="flex items-center gap-2" style={{padding:"14px 18px 0"}}><span style={{fontSize:14}}>⚖️</span><span style={{fontSize:14,fontWeight:600,color:P.ink,fontFamily:S}}>支撑决策</span></div>
    {DECIDE_DATA.rows.map((r,i)=><div key={i} style={{padding:"12px 18px",borderTop:i===0?"none":`1px solid ${P.borderLight}`,background:r.bg||"transparent"}}><div style={{fontSize:11,color:P.inkFaint,marginBottom:4,fontWeight:500}}>{r.icon} {r.label}</div><p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>{r.text}</p></div>)}
  </div>;
}

/* Intent Card: Person */
function PersonCard(){
  const d=PERSON_DATA;
  return<div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.border}`,overflow:"hidden",maxWidth:460}}>
    <div style={{padding:"14px 18px"}}>
      <div className="flex items-center gap-3" style={{marginBottom:12}}><div style={{width:40,height:40,borderRadius:"50%",background:"#e8e0f8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#6b5ba8",fontSize:16,fontFamily:S}}>张</div><div><div className="flex items-center gap-2"><span style={{fontSize:15,fontWeight:600,color:P.ink,fontFamily:S}}>张总</span><Pill bg={P.redBg} fg={P.red}>状态：{d.status}</Pill></div><span style={{fontSize:12,color:P.inkMuted}}>第3次收到他的汇报</span></div></div>
      <div style={{padding:"10px 14px",borderRadius:10,background:P.amberBg,marginBottom:12}}><span style={{fontSize:13,fontWeight:600,color:P.amber}}>行为模式：{d.pattern}</span></div>
      {d.details.map((t,i)=><div key={i} className="flex items-start gap-2" style={{marginBottom:i<d.details.length-1?6:0}}><span style={{color:P.inkFaint,marginTop:1,fontSize:13}}>·</span><p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>{t}</p></div>)}
    </div>
    <div style={{padding:"12px 18px",background:P.warm,borderTop:`1px solid ${P.borderLight}`}}><div style={{fontSize:11,color:P.inkFaint,marginBottom:4}}>本次汇报印证</div><p style={{fontSize:13,color:P.inkSoft,fontFamily:F}}>{d.thisTime}</p></div>
  </div>;
}

/* Placeholder card for unimplemented intents */
function PlaceholderCard({intent}){
  return<div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.border}`,padding:"32px 18px",textAlign:"center",maxWidth:460}}>
    <span style={{fontSize:24,display:"block",marginBottom:8}}>{intent.icon}</span>
    <span style={{fontSize:14,color:P.inkMuted}}>「{intent.label}」意图的完整输出结构</span>
    <p style={{fontSize:12,color:P.inkFaint,marginTop:4}}>详见产品方案文档</p>
  </div>;
}

/* Intent Message wrapper */
function IntentMsg({intentKey,isFirst,usedIntents,onSwitch,onAction,showAnn}){
  const intent=INTENTS.find(i=>i.key===intentKey);
  const isTalk=intentKey==="person"||intentKey==="prepare";
  const actionLabel=isTalk?"帮我准备谈话":"帮我写个回复";
  const chatLabel=intentKey==="person"?"聊聊这个人":intentKey==="decide"?"聊聊这个决策":"聊聊这份汇报";

  return<div className="anim-up">
    {showAnn&&isFirst&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:8}}>📌 AI先赌一个意图。完整卡片+一句话判断+行动按钮。底部备选意图只在第一条消息出现——已选变灰，未选可点。选择即提问，卡片即回答。每条消息都是一个自洽的「判断+行动」单元。</div>}
    <div className="flex items-start gap-2.5"><AiAvatar/><div style={{maxWidth:460}}><AiLabel/>
      {/* Judgment */}
      <div style={{background:"#fff",border:`1px solid ${P.borderLight}`,borderRadius:"14px 14px 14px 4px",padding:"12px 16px",marginBottom:8,fontSize:14,color:P.inkSoft,lineHeight:1.65,fontFamily:F}}>{JUDGMENTS[intentKey]}</div>
      {/* Card */}
      {intentKey==="check"&&<CheckCard/>}
      {intentKey==="decide"&&<DecideCard/>}
      {intentKey==="person"&&<PersonCard/>}
      {intentKey!=="check"&&intentKey!=="decide"&&intentKey!=="person"&&<PlaceholderCard intent={intent}/>}
      {/* Actions */}
      <div className="flex gap-2" style={{marginTop:10}}>
        <button onClick={()=>onAction(intentKey)} className="transition-all duration-150" style={{padding:"8px 18px",borderRadius:20,border:"none",background:P.ink,color:"#f5f5f5",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:F}}>
          {isTalk?"💬":"✍️"} {actionLabel}
        </button>
        <button className="transition-all duration-150" style={{padding:"8px 18px",borderRadius:20,border:`1px solid ${P.border}`,background:"#fff",color:P.inkMuted,fontSize:13,cursor:"pointer",fontFamily:F}}>
          💬 {chatLabel}
        </button>
      </div>
      {/* Intent switcher — first message only */}
      {isFirst&&<div style={{marginTop:14,padding:"10px 14px",borderRadius:12,background:P.warm,border:`1px solid ${P.borderLight}`}}>
        <div style={{fontSize:11,color:P.inkFaint,marginBottom:8}}>换个角度看这份汇报：</div>
        <div className="flex flex-wrap gap-1.5">{INTENTS.filter(i=>i.key!==intentKey).map(i=>{
          const used=usedIntents.includes(i.key);
          return<button key={i.key} onClick={()=>{if(!used)onSwitch(i.key)}} className="flex items-center gap-1 transition-all duration-150" style={{fontSize:12,padding:"5px 12px",borderRadius:16,border:`1px solid ${used?"transparent":P.border}`,background:used?P.warmDark:"#fff",color:used?P.inkFaint:P.inkMuted,cursor:used?"default":"pointer",fontFamily:F,opacity:used?0.5:1}} onMouseEnter={e=>{if(!used){e.currentTarget.style.background=P.mBg;e.currentTarget.style.borderColor=P.mBorder}}} onMouseLeave={e=>{if(!used){e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=P.border}}}><span>{i.icon}</span>{i.label}{used&&<span style={{fontSize:10}}>✓</span>}</button>
        })}</div>
      </div>}
    </div></div>
  </div>;
}

/* Reply Draft */
function ReplyDraftMsg({isTalk,showAnn}){
  const tones=isTalk?TALK_TONES:REPLY_TONES;
  const[active,setActive]=useState(tones[0].key);
  const[copied,setCopied]=useState(false);
  const copy=()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)};
  const t=tones.find(x=>x.key===active);
  return<div className="anim-up">
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:8}}>📌 口吻选择随着老板的习惯逐渐个性化——如果他总选「直接」，下次直接默认。复制→粘贴到微信→改几个字→发出去。</div>}
    <div className="flex items-start gap-2.5"><AiAvatar/><div style={{maxWidth:460}}><AiLabel/>
      <div style={{background:"#fff",border:`1px solid ${P.borderLight}`,borderRadius:"14px 14px 14px 4px",overflow:"hidden"}}>
        <div className="flex items-center gap-1" style={{padding:"10px 16px",borderBottom:`1px solid ${P.borderLight}`}}>
          <span style={{fontSize:12,color:P.inkFaint,marginRight:8}}>{isTalk?"谈话口吻":"回复口吻"}</span>
          {tones.map(tn=><button key={tn.key} onClick={()=>setActive(tn.key)} className="transition-all duration-150" style={{fontSize:12,padding:"3px 12px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:F,background:active===tn.key?P.ink:P.warm,color:active===tn.key?"#f5f5f5":P.inkMuted,fontWeight:active===tn.key?500:400}}>{tn.label}</button>)}
        </div>
        <div style={{padding:"14px 18px"}}><p style={{fontSize:14,color:P.inkSoft,lineHeight:1.7,fontFamily:F,whiteSpace:"pre-line"}}>{t.text}</p></div>
        <div className="flex gap-2" style={{padding:"10px 16px",borderTop:`1px solid ${P.borderLight}`}}>
          <button onClick={copy} className="transition-all duration-150" style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:F,background:copied?P.greenBg:P.ink,color:copied?P.green:"#f5f5f5"}}>{copied?"✓ 已复制":"复制"}</button>
          <button style={{padding:"8px 16px",borderRadius:10,border:`1px solid ${P.border}`,background:"#fff",cursor:"pointer",fontSize:13,color:P.inkMuted,fontFamily:F}}>{isTalk?"聊聊怎么谈":"聊聊怎么回"}</button>
        </div>
      </div>
    </div></div>
  </div>;
}

/* Related Matters (事 as relational network) */
function RelatedMattersMsg({showAnn}){
  const ts={conflict:{label:"前提冲突",bg:P.redBg,fg:P.red},dependency:{label:"前序依赖",bg:P.amberBg,fg:P.amber}};
  return<div className="anim-up">
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:8}}>📌 「事」不是聚合实体，是关联网络。不同人对同一件事的不同赌注、不同前提，正是老板最需要看到的张力。弱关联足矣——老板一眼就能确认对不对。</div>}
    <div className="flex items-start gap-2.5"><AiAvatar/><div style={{maxWidth:460}}><AiLabel/>
      <Bubble><p style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontFamily:F}}>这份汇报关联到你最近的两条线索——</p>
        {RELATED_MATTERS.map((r,i)=>{const s=ts[r.type];return<div key={i} style={{padding:"10px 14px",borderRadius:10,background:P.warm,border:`1px solid ${P.borderLight}`,marginBottom:i<RELATED_MATTERS.length-1?8:0}}>
          <div className="flex items-center gap-2" style={{marginBottom:4}}><span style={{fontSize:12,fontWeight:500,color:P.inkSoft}}>{r.source}</span><Pill bg={s.bg} fg={s.fg}>{s.label}</Pill></div>
          <p style={{fontSize:13,color:P.inkSoft,lineHeight:1.6,fontFamily:F}}>{r.text}</p>
        </div>})}
      </Bubble>
    </div></div>
  </div>;
}

/* Thread Chat opening */
function ThreadChatOpening({showAnn}){
  return<div>
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:8}}>📌 Thread内对话：AI带着汇报上下文主动开场。底层四阶段引擎根据对话状态动态切换。</div>}
    <div className="flex items-start gap-2.5"><AiAvatar/><div style={{maxWidth:440}}><AiLabel/>
      <Bubble maxW={420}>这份汇报有个地方值得聊：他把「转化率」换成了「活跃度」。你觉得是指标确实变了，还是在回避什么？</Bubble>
    </div></div>
    <div style={{marginTop:16}}><div className="flex items-center gap-2"><div style={{flex:1,background:P.warm,border:`1px solid ${P.border}`,borderRadius:14,padding:"11px 18px",fontSize:14,color:P.inkFaint,fontFamily:F}}>就这份汇报继续聊…</div><button style={{background:P.ink,color:"#f5f5f5",borderRadius:14,padding:"11px 20px",fontSize:14,fontWeight:500,border:"none",cursor:"pointer",fontFamily:F}}>发送</button></div></div>
  </div>;
}


/* ═══════════════════════════════════════════════════════
   Thread Content — full IM conversation flow
   ═══════════════════════════════════════════════════════ */
function ThreadContent({phase,showAnn}){
  const[personDone,setPersonDone]=useState(false);
  const[switched,setSwitched]=useState([]);
  const[reply,setReply]=useState(null);
  const[showRelated,setShowRelated]=useState(false);

  useEffect(()=>{
    if(phase===PH.intentResult||phase===PH.switchedIntent||phase===PH.replyDraft||phase===PH.threadChat){
      const t=setTimeout(()=>setShowRelated(true),600);return()=>clearTimeout(t);
    }
  },[phase]);

  const allUsed=["check",...switched];

  return<div style={{maxWidth:560,margin:"0 auto",paddingBottom:40}}>
    <div style={{marginBottom:20}}><FullConclusionMsg showAnn={showAnn}/></div>

    <div style={{marginBottom:20}}><PersonConfirmMsg onConfirm={()=>setPersonDone(true)} showAnn={showAnn}/></div>

    {(personDone||phase!==PH.personConfirm)&&<div style={{marginBottom:20}}>
      <IntentMsg intentKey="check" isFirst={true} usedIntents={allUsed} onSwitch={k=>{if(!switched.includes(k))setSwitched(p=>[...p,k])}} onAction={k=>setReply(k)} showAnn={showAnn}/>
    </div>}

    {switched.map(k=><div key={k} style={{marginBottom:20}}>
      <IntentMsg intentKey={k} isFirst={false} usedIntents={allUsed} onSwitch={()=>{}} onAction={k2=>setReply(k2)} showAnn={showAnn}/>
    </div>)}

    {reply&&<div style={{marginBottom:20}}><ReplyDraftMsg isTalk={reply==="person"||reply==="prepare"} showAnn={showAnn}/></div>}

    {showRelated&&<div style={{marginBottom:20}}><RelatedMattersMsg showAnn={showAnn}/></div>}

    {showRelated&&<div style={{textAlign:"center",fontSize:12,color:P.inkFaint,padding:"8px 0"}}>关于「张总」的档案已更新 · 这份汇报关联到 2 条已有线索</div>}

    {(phase===PH.threadChat||reply)&&<div style={{marginTop:16}}><ThreadChatOpening showAnn={showAnn}/></div>}
  </div>;
}


/* ═══════════════════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════════════════ */
export default function ReportThreadDemo(){
  const[phase,setPhase]=useState(PH.idle);
  const[showAnn,setShowAnn]=useState(true);
  const[showThread,setShowThread]=useState(false);
  const[msgs,setMsgs]=useState([{role:"ai",text:"你好，选个场景开始，或者直接聊聊你现在在想的事。"}]);
  const chatEnd=useRef(null);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"})},[msgs,phase]);

  const handleSubmit=()=>{
    setPhase(PH.analyzing);
    setMsgs(p=>[...p,{role:"system",text:"📋 已提交汇报解读"}]);
    setTimeout(()=>{setPhase(PH.intentResult);setMsgs(p=>[...p,{role:"ai",text:"可信度中等——数据口径和上周不一致，而且上次要的渠道评估这次没提。",hasCard:true}])},3000);
  };

  const triggerError=()=>{
    setPhase(PH.error);
    if(!msgs.some(m=>m.text?.includes("已提交")))setMsgs(p=>[...p,{role:"system",text:"📋 已提交汇报解读"}]);
    setTimeout(()=>setMsgs(p=>[...p,{role:"error",text:"文件解析失败：PPT中包含大量图片，文字内容不足以进行有效分析。请尝试上传文字版汇报或直接粘贴内容。"}]),1500);
  };

  const hasThread=phase!==PH.idle&&phase!==PH.submitPopup;

  const threadPhases=[PH.personConfirm,PH.intentResult,PH.switchedIntent,PH.replyDraft,PH.threadChat];
  const jumpToThread=(p)=>{
    setPhase(p);setShowThread(true);
    if(!msgs.some(m=>m.hasCard)){
      const base=msgs.some(m=>m.text?.includes("已提交"))?[]:[{role:"system",text:"📋 已提交汇报解读"}];
      setMsgs(prev=>[...prev,...base,{role:"ai",text:"可信度中等——数据口径和上周不一致，而且上次要的渠道评估这次没提。",hasCard:true}]);
    }
  };

  const navItems=[
    {key:PH.idle,label:"主对话流",icon:"💬"},
    {key:PH.submitPopup,label:"提交弹窗",icon:"📋"},
    {sep:true,label:"── 提交后 ──"},
    {key:PH.analyzing,label:"分析中（typing）",icon:"⏳"},
    {key:PH.error,label:"分析失败",icon:"❌"},
    {sep:true,label:"── Thread 内 ──"},
    {key:PH.personConfirm,label:"人物确认",icon:"👤"},
    {key:PH.intentResult,label:"意图卡片（默认）",icon:"🔍"},
    {key:PH.switchedIntent,label:"切换意图",icon:"⚖️"},
    {key:PH.replyDraft,label:"回复草稿",icon:"✍️"},
    {key:PH.threadChat,label:"深度对话",icon:"💬"},
  ];

  return <><style>{STYLE}</style>
  <div className="h-screen flex flex-col" style={{background:P.sb,fontFamily:F}}>
    {/* Top bar */}
    <div className="flex items-center justify-between shrink-0" style={{background:"#161616",borderBottom:"1px solid #2a2a2a",padding:"7px 16px"}}>
      <span style={{color:"#ccc",fontWeight:700,fontSize:13}}>Demo 4/6 · 汇报解读 Thread — 完整交互流程 v2</span>
      <label className="flex items-center gap-2" style={{fontSize:12,color:"#777"}}><input type="checkbox" checked={showAnn} onChange={e=>setShowAnn(e.target.checked)} style={{accentColor:P.accent}}/> 设计批注</label>
    </div>

    <div className="flex flex-1 min-h-0">
      {/* ═══════ LEFT SIDEBAR ═══════ */}
      <div className="flex flex-col shrink-0" style={{width:240,background:P.sb,borderRight:"1px solid #2a2a2a"}}>
        <div style={{padding:12,borderBottom:"1px solid #2a2a2a"}}><div className="flex flex-col gap-0.5">
          {[{key:"chat",icon:"💬",label:"对话"},{key:"memory",icon:"🧠",label:"记忆",badge:"内测"},{key:"network",icon:"🔗",label:"人脉圈",badge:"🔒"}].map(item=>
            <button key={item.key} onClick={()=>{if(item.key==="chat")setShowThread(false)}} className="flex items-center gap-2.5 transition-all duration-150" style={{width:"100%",padding:"8px 12px",borderRadius:10,fontSize:13,fontWeight:500,border:"none",cursor:"pointer",textAlign:"left",fontFamily:F,...(item.key==="chat"&&!showThread?{background:P.sbActive,color:"#fff",boxShadow:`inset 3px 0 0 ${P.accent}`}:{background:"transparent",color:"#aaa"})}} onMouseEnter={e=>{if(!(item.key==="chat"&&!showThread))e.currentTarget.style.background=P.sbHover}} onMouseLeave={e=>{if(!(item.key==="chat"&&!showThread))e.currentTarget.style.background="transparent"}}>
              <span style={{fontSize:16}}>{item.icon}</span><span>{item.label}</span>
              {item.badge&&<span style={{marginLeft:"auto",fontSize:10,background:"#333",color:"#888",padding:"2px 6px",borderRadius:4}}>{item.badge}</span>}
            </button>
          )}
        </div></div>

        <div className="flex-1 overflow-y-auto" style={{padding:12}}>
          <div style={{fontSize:10,color:"#666",letterSpacing:".1em",fontWeight:600,marginBottom:8,paddingLeft:4,textTransform:"uppercase"}}>进行中</div>
          {hasThread&&<div onClick={()=>{if(threadPhases.includes(phase)||phase===PH.intentResult)setShowThread(true)}} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200" style={{background:showThread?P.sbActive:"transparent",marginBottom:2,...(showThread?{boxShadow:`inset 3px 0 0 ${P.accent}`}:{})}} onMouseEnter={e=>{if(!showThread)e.currentTarget.style.background=P.sbHover}} onMouseLeave={e=>{if(!showThread)e.currentTarget.style.background="transparent"}}>
            <span className="text-lg mt-0.5 shrink-0">📋</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5"><span className={phase===PH.analyzing?"pulse-glow":""} style={{width:6,height:6,borderRadius:"50%",background:phase===PH.analyzing?"#b08d3a":phase===PH.error?P.red:P.green,display:"inline-block",flexShrink:0}}/><span style={{fontSize:13,fontWeight:500,color:"#e0e0e0",fontFamily:F}} className="truncate">Q2渠道推广方案</span></div>
              <p style={{fontSize:11,color:"#888",marginTop:2,fontFamily:F}} className="truncate">{phase===PH.analyzing?"正在分析…":phase===PH.error?"分析失败":"可信度中等，数据口径有变化"}</p>
              <span style={{fontSize:11,color:"#666"}}>刚刚</span>
            </div>
          </div>}
          {SIDEBAR_THREADS.map(t=><div key={t.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200" style={{background:"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=P.sbHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span className="text-lg mt-0.5 shrink-0">{t.icon}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span style={{width:6,height:6,borderRadius:"50%",background:P.green,display:"inline-block",flexShrink:0}}/><span style={{fontSize:13,fontWeight:500,color:"#e0e0e0",fontFamily:F}} className="truncate">{t.title}</span></div><p style={{fontSize:11,color:"#888",marginTop:2,fontFamily:F}} className="truncate">{t.summary}</p><span style={{fontSize:11,color:"#666"}}>{t.time}</span></div>
          </div>)}
        </div>

        <div style={{padding:12,borderTop:"1px solid #2a2a2a"}}><div className="flex items-center gap-2.5"><div style={{width:32,height:32,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${P.accent},#a07050)`,color:"#fff",fontSize:13,fontWeight:700}}>夏</div><div><div style={{fontSize:13,color:"#e0e0e0",fontWeight:500}}>夏总</div><div style={{fontSize:11,color:"#777"}}>制造业 · 50人团队</div></div></div></div>
      </div>

      {/* ═══════ MIDDLE: Main content ═══════ */}
      <div className="flex-1 flex flex-col min-w-0" style={{background:P.parchment}}>
        {showThread&&<div className="shrink-0 flex items-center gap-3" style={{padding:"10px 24px",borderBottom:`1px solid ${P.border}`,background:"#fff"}}>
          <button onClick={()=>setShowThread(false)} style={{fontSize:12,color:P.inkFaint,background:"none",border:"none",cursor:"pointer"}}>← 主对话</button>
          <span style={{color:P.border}}>|</span><span style={{fontSize:16}}>📋</span>
          <span style={{fontSize:14,fontWeight:600,color:P.ink,fontFamily:S}}>Q2渠道推广方案</span>
          <span style={{fontSize:11,color:P.inkFaint}}>今天 15:20 · 张总 · PPT · 18页</span>
        </div>}

        {showThread?<div className="flex-1 overflow-y-auto" style={{padding:"24px 28px"}}><ThreadContent phase={phase} showAnn={showAnn}/></div>
        :<>
          {/* Chat header */}
          <div className="shrink-0 flex items-center gap-3" style={{padding:"12px 24px",borderBottom:`1px solid ${P.border}`}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}><span style={{fontSize:11,color:"#fff",fontWeight:700}}>AI</span><div style={{position:"absolute",bottom:-1,right:-2,width:14,height:14,borderRadius:"50%",background:P.accent,color:"#fff",fontSize:7,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>AI</div></div>
            <div><div className="flex items-center gap-2"><span style={{fontSize:15,fontWeight:700,color:P.ink,fontFamily:S}}>诸葛</span><span style={{fontSize:9,fontWeight:700,background:P.accentBg,color:P.accent,padding:"2px 6px",borderRadius:4}}>AI</span><span style={{fontSize:10,fontWeight:500,background:P.greenBg,color:P.green,padding:"2px 8px",borderRadius:10}}>在线</span></div><div style={{fontSize:12,color:P.inkFaint,marginTop:1}}>🎯 只站你这边</div></div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto" style={{padding:"24px 28px"}}><div style={{maxWidth:560,margin:"0 auto"}}>
            {showAnn&&phase===PH.idle&&<div className="anim-in" style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:10,padding:"8px 12px",marginBottom:16}}>📌 主对话流。结果卡片=纯元数据（日期+汇报人+主题），一句话判断=独立消息作为钩子，制造信息缺口让老板点进Thread。</div>}
            {msgs.map((msg,i)=><div key={i} className={`flex ${msg.role==="user"?"justify-end":"justify-start"} anim-up`} style={{marginBottom:16,animationDelay:`${i*50}ms`}}><div style={{maxWidth:440}}>
              {msg.role==="ai"&&<div className="flex items-center gap-1.5" style={{marginBottom:4}}><div style={{width:20,height:20,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#fff",fontWeight:700}}>AI</span></div><span style={{fontSize:11,color:P.inkFaint}}>诸葛</span></div>}
              {msg.role==="system"?<div style={{fontSize:12,color:P.inkMuted,background:P.warm,borderRadius:10,padding:"8px 14px",border:`1px solid ${P.borderLight}`}}>{msg.text}</div>
              :msg.role==="error"?<div style={{fontSize:12,color:P.red,background:P.redBg,borderRadius:10,padding:"8px 14px",border:`1px solid ${P.redBorder}`}}>{msg.text}</div>
              :<div style={{borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.65,fontFamily:F,...(msg.role==="user"?{background:P.ink,color:"#f0f0f0"}:{background:"#fff",color:P.inkSoft,border:`1px solid ${P.borderLight}`})}}>{msg.text}</div>}
              {msg.hasCard&&<div style={{marginTop:10}}><ReportResultCard onExpand={()=>setShowThread(true)}/></div>}
            </div></div>)}
            {/* Typing */}
            {phase===PH.analyzing&&<div className="flex justify-start anim-in" style={{marginBottom:16}}><div><div className="flex items-center gap-1.5" style={{marginBottom:4}}><div style={{width:20,height:20,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#fff",fontWeight:700}}>AI</span></div><span style={{fontSize:11,color:P.inkFaint}}>诸葛</span></div><div style={{background:"#fff",border:`1px solid ${P.borderLight}`,borderRadius:"14px 14px 14px 4px",padding:"12px 16px"}}><div className="flex items-center gap-1" style={{padding:"4px 0"}}>{[1,2,3].map(i=><div key={i} className={`dot-${i}`} style={{width:6,height:6,borderRadius:"50%",background:P.inkFaint}}/>)}</div></div></div></div>}
            <div ref={chatEnd}/>
          </div></div>

          {/* Input bar */}
          <div className="shrink-0" style={{padding:"12px 28px 16px",borderTop:`1px solid ${P.border}`,background:P.parchment}}>
            {phase===PH.analyzing&&<div className="anim-in flex items-center gap-3" style={{padding:"8px 14px",borderRadius:10,background:P.mBg,border:`1px solid ${P.mBorder}`,marginBottom:10}}><div className="flex items-center gap-1">{[1,2,3].map(i=><div key={i} className={`dot-${i}`} style={{width:5,height:5,borderRadius:"50%",background:P.mAccent}}/>)}</div><span style={{fontSize:13,color:P.mAccent,fontFamily:F}}>正在分析汇报内容…</span></div>}
            <div className="flex gap-2" style={{marginBottom:8}}>
              {[{icon:"🎙",label:"会议"},{icon:"📋",label:"汇报",active:true,onClick:()=>setPhase(PH.submitPopup)},{icon:"📖",label:"文章"}].map((s,i)=><button key={i} onClick={s.onClick} className="flex items-center gap-1.5 transition-all duration-200" style={{fontSize:12,color:s.active?P.mAccent:P.inkMuted,border:`1px solid ${s.active?P.mBorder:P.border}`,borderRadius:8,padding:"5px 12px",background:s.active?P.mBg:"#fff",cursor:s.onClick?"pointer":"default",fontFamily:F,fontWeight:s.active?500:400}}><span>{s.icon}</span><span>{s.label}</span></button>)}
            </div>
            <div className="flex items-center gap-2"><div style={{flex:1,background:P.warm,border:`1px solid ${P.border}`,borderRadius:14,padding:"11px 18px",fontSize:14,color:P.inkFaint,fontFamily:F}}>聊聊你现在脑子里最乱的一件事…</div><button style={{background:P.ink,color:"#f5f5f5",borderRadius:14,padding:"11px 20px",fontSize:14,fontWeight:500,border:"none",cursor:"pointer",fontFamily:F}}>发送</button></div>
          </div>
        </>}
      </div>

      {/* ═══════ RIGHT: Phase Navigator ═══════ */}
      <div className="shrink-0 flex flex-col" style={{width:170,background:"#fff",borderLeft:`1px solid ${P.border}`}}>
        <div style={{padding:"12px 10px 6px",fontSize:10,color:P.inkFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Demo 交互阶段</div>
        <div className="flex-1 overflow-y-auto" style={{padding:"0 6px"}}>
          {navItems.map((s,i)=>s.sep?<div key={i} style={{padding:"6px 8px",fontSize:9,color:P.inkFaint,textAlign:"center"}}>{s.label}</div>
          :<button key={s.key} onClick={()=>{
            if(s.key===PH.idle){setPhase(PH.idle);setShowThread(false)}
            else if(s.key===PH.submitPopup){setPhase(PH.submitPopup)}
            else if(s.key===PH.analyzing){setPhase(PH.analyzing);if(!msgs.some(m=>m.text?.includes("已提交")))setMsgs(p=>[...p,{role:"system",text:"📋 已提交汇报解读"}])}
            else if(s.key===PH.error){triggerError()}
            else{jumpToThread(s.key)}
          }} className="transition-all duration-150" style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",margin:"1px 0",borderRadius:6,border:"none",cursor:"pointer",textAlign:"left",width:"100%",background:phase===s.key?P.accentBg:"transparent",color:phase===s.key?P.accent:P.inkMuted,fontWeight:phase===s.key?600:400,fontSize:11,fontFamily:F}}>
            <span style={{fontSize:12}}>{s.icon}</span><span>{s.label}</span>
          </button>)}
        </div>
      </div>
    </div>

    {phase===PH.submitPopup&&<SubmitPopup onSubmit={handleSubmit} onClose={()=>setPhase(PH.idle)}/>}
  </div></>;
}
