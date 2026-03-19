import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   Design System
   ═══════════════════════════════════════════════════════ */
const P = {
  ink:"#1a1a1a", inkSoft:"#3d3d3d", inkMuted:"#6b6b6b", inkFaint:"#9a9a9a",
  warm:"#f7f5f2", warmDark:"#edeae5", parchment:"#fdfcfa",
  accent:"#c8956c", accentBg:"#fdf4ec", accentBorder:"#f0d4be",
  mAccent:"#d4845a", mBg:"#fef6f0", mBorder:"#f0d4be",
  blue:"#4a72b0", blueBg:"#f0f4fa",
  green:"#5a8a6a", greenBg:"#edf5f0",
  red:"#c45c5c", redBg:"#fef2f2",
  purple:"#6b5ba8", purpleBg:"#f0ecfa", purpleBorder:"#d8d0f0",
  border:"#e8e4de", borderLight:"#f0ece6",
  sb:"#1e1e1e", sbHover:"#2a2a2a", sbActive:"#333",
};
const F="'Noto Sans SC','PingFang SC',-apple-system,sans-serif";
const S="'Noto Serif SC','Songti SC',serif";

const STYLE=`
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');
@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}}
@keyframes pulseRec{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes pulseGlow{0%,100%{opacity:.6}50%{opacity:1}}
.anim-up{animation:fadeInUp .4s ease-out both}
.anim-in{animation:fadeIn .3s ease-out both}
.anim-slide{animation:slideUp .35s cubic-bezier(.16,1,.3,1) both}
.dot-1{animation:dotBounce 1s ease-in-out infinite}
.dot-2{animation:dotBounce 1s ease-in-out .15s infinite}
.dot-3{animation:dotBounce 1s ease-in-out .3s infinite}
.pulse-rec{animation:pulseRec 1.5s ease-in-out infinite}
.pulse-glow{animation:pulseGlow 2s ease-in-out infinite}
`;

/* ═══════════════════════════════════════════════════════ */
const MEETING_TYPES=["默认","用户访谈","项目评审","头脑风暴","团队会议","探索流"];
const PHASES={idle:"idle",entryPopup:"entryPopup",prepRealtime:"prepRealtime",prepUpload:"prepUpload",prepPaste:"prepPaste",recording:"recording",analyzing:"analyzing",result:"result"};

/* --- Data --- */
const INSIGHTS=[
  {id:1,cat:"隐含假设",icon:"🔍",text:"讨论Q2增长目标时，所有人默认「现有团队能支撑」，但没人提过产能瓶颈。",hasPremise:true,premise:{decision:"Q2投入300万推新业务",text:"现有渠道能复用",tension:"——但团队还没有任何人试过。"}},
  {id:2,cat:"言下之意",icon:"💬",confidence:"中",text:"李总说「这个方向我们可以探索一下」时，语速明显放慢——他可能并不想接这件事。"},
  {id:3,cat:"非共识",icon:"⚠️",text:"预算分配议题：3人明确支持，张总全程未表态（发言时长0），表面共识可能不牢靠。"},
  {id:4,cat:"隐含假设",icon:"🔍",hasPremise:true,premise:{decision:"Q2投入300万推新业务",text:"李总团队能承接",tension:"——但李总本人态度暧昧，还没明确接盘。"},text:"「李总团队来承接新业务」作为前提被所有人默认了，但李总本人始终没正面回应。"},
  {id:5,cat:"被跳过",icon:"⏭",text:"议程中的「竞品动态同步」被直接跳过，没有任何人提起。"},
];
const EXISTING_PEOPLE=[
  {id:"p1",name:"李总",avatar:"李",color:"#6b5ba8",bgColor:"#e8e0f8",meetings:3},
  {id:"p2",name:"王总",avatar:"王",color:"#4a72b0",bgColor:"#dce6f5",meetings:5},
  {id:"p3",name:"赵总",avatar:"赵",color:"#5a8a6a",bgColor:"#dff0e5",meetings:2},
  {id:"p4",name:"周敏",avatar:"周",color:"#9b6bcc",bgColor:"#eadcf8",meetings:1},
];
const RELATION_OPTIONS=["直接下属","平级同事","上级","客户","合作方","顾问/专家","候选人","其他"];
const SPEAKER_CARDS=[
  {
    id:"s1",
    speakerNum:1,
    roleLabel:"主导",
    signal:"整场会议只在开场做了流程介绍，此后未参与任何实质讨论，发言时长占比不到5%。",
    quote:"我们先把预算和新业务承接这两个议题过一遍，今天先不展开竞品。",
    quoteTopic:"会议开场",
    aiGuess:null,
    c07Existing:"这次他和过去几次一样，更多是在控流程而不是下判断。本次没有新增异常信号，可以先把他当作会议主持人而不是实质决策人。",
    c07New:"这次更多像在控流程而不是下判断。先按“会议主持型角色”建一个初步印象，后面再看他在关键议题上是否持续回避表态。",
  },
  {
    id:"s2",
    speakerNum:3,
    roleLabel:"质疑者",
    signal:"新业务讨论时全程沉默，但在预算议题上突然变得强势，两次打断别人发言。",
    quote:"我还是担心 Q2 直接把预算加到 300 万，渠道复用这件事没人拿过硬数据。",
    quoteTopic:"预算议题 T2",
    aiGuess:"李总",
    c07Existing:"和上次相比，他这次明显从“愿意试一试”转成了“先卡住预算再说”。上次他主动请缨负责新业务，这次却把讨论拉回到数据证据，态度是实质性收紧。",
    c07New:"这次最强的信号是“对预算明显更谨慎”。如果先建档，可以记成：在资源承诺前会先追问证据，对自己要不要接盘保持保留。",
  },
  {
    id:"s3",
    speakerNum:5,
    roleLabel:"补充者",
    signal:"在讨论渠道策略时补了两次细节，但没有人明确接她的话，存在被边缘化的迹象。",
    quote:"如果北区渠道还是按去年的投法走，新增经销商这件事很可能起不来。",
    quoteTopic:"渠道策略 T3",
    aiGuess:"周敏",
    c07Existing:"她这次延续了“补细节但不抢结论”的风格。和历史记录一致，判断上偏谨慎，但在会上影响力还不够，经常提出风险却没人接球。",
    c07New:"先记一个初步印象：她会补关键执行细节，风险意识强，但当前在团队里的话语权偏弱，需要再观察她后续是否持续提出同类提醒。",
  },
];
const SIDEBAR_THREADS=[
  {id:2,type:"report",icon:"📋",title:"张总的Q2汇报",status:"active",time:"10分钟前",summary:"可信度中等，第二部分数据口径有变化"},
  {id:3,type:"article",icon:"📖",title:"消费降级趋势文章",status:"active",time:"1小时前",summary:"如果趋势成立，高端线需要重新评估"},
];


/* ═══════════════════════════════════════════════════════
   UI Primitives
   ═══════════════════════════════════════════════════════ */
function Overlay({children,onClose}){return <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,.35)",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose?.()}}>{children}</div>}
function DialogShell({title,onClose,children,footer}){return <div className="anim-slide" style={{width:520,maxHeight:"85vh",background:"#fff",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,.18)",overflow:"hidden",display:"flex",flexDirection:"column"}}><div className="flex items-center justify-between shrink-0" style={{padding:"20px 24px 0"}}><h2 style={{fontSize:18,fontWeight:700,color:P.ink,fontFamily:S}}>{title}</h2><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:P.inkFaint,lineHeight:1}}>×</button></div><div className="flex-1 overflow-y-auto" style={{padding:"20px 24px"}}>{children}</div>{footer&&<div className="shrink-0 flex justify-end gap-3" style={{padding:"16px 24px",borderTop:`1px solid ${P.borderLight}`}}>{footer}</div>}</div>}
function PrimaryBtn({children,onClick,disabled}){return <button onClick={onClick} disabled={disabled} className="transition-all duration-150" style={{padding:"10px 28px",borderRadius:10,border:"none",cursor:disabled?"not-allowed":"pointer",background:disabled?P.warmDark:P.ink,color:disabled?P.inkFaint:"#f5f5f5",fontSize:14,fontWeight:600,fontFamily:F,opacity:disabled?0.6:1}}>{children}</button>}
function GhostBtn({children,onClick}){return <button onClick={onClick} style={{padding:"10px 24px",borderRadius:10,border:`1px solid ${P.border}`,background:"#fff",cursor:"pointer",fontSize:14,color:P.inkMuted,fontFamily:F}}>{children}</button>}
function Pill({children,bg,fg}){return <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:bg,color:fg,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>}
function MeetingTypeSelector({selected,onSelect}){return <div><div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>选择会议类型</div><div className="flex flex-wrap gap-2">{MEETING_TYPES.map(t=><button key={t} onClick={()=>onSelect(t)} className="transition-all duration-150" style={{fontSize:13,padding:"6px 16px",borderRadius:6,border:`1px solid ${selected===t?P.mAccent:P.border}`,background:selected===t?"#fff":P.warm,color:selected===t?P.mAccent:P.inkMuted,fontWeight:selected===t?600:400,fontFamily:F,cursor:"pointer"}}>{t}</button>)}</div></div>}
function TopicInput({topic,setTopic}){return <div><div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>其他补充信息</div><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="会议主题（可选）" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${P.border}`,background:P.warm,fontSize:14,color:P.ink,fontFamily:F,outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=P.mAccent} onBlur={e=>e.target.style.borderColor=P.border}/><textarea placeholder="简单描述会议目标或背景，帮助AI更好理解内容（可选）" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${P.border}`,marginTop:10,background:P.warm,fontSize:13,color:P.ink,fontFamily:F,outline:"none",resize:"none",height:70,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=P.mAccent} onBlur={e=>e.target.style.borderColor=P.border}/></div>}
function NewContactDialog({speakerNum,onClose,onCreate}){
  const[name,setName]=useState("");
  const[relation,setRelation]=useState(RELATION_OPTIONS[0]);
  const[note,setNote]=useState("");
  const ok=name.trim()&&relation;
  return <Overlay onClose={onClose}><DialogShell title={`为说话人 ${speakerNum} 新建联系人`} onClose={onClose} footer={<><GhostBtn onClick={onClose}>取消</GhostBtn><PrimaryBtn disabled={!ok} onClick={()=>onCreate({name:name.trim(),relation,note:note.trim()})}>确认创建</PrimaryBtn></>}>
    <div className="flex flex-col gap-5">
      <div>
        <div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>称呼</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="例如：李四 / 周总 / 北区负责人" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${P.border}`,background:P.warm,fontSize:14,color:P.ink,fontFamily:F,outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=P.mAccent} onBlur={e=>e.target.style.borderColor=P.border}/>
      </div>
      <div>
        <div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>关系</div>
        <div className="flex flex-wrap gap-2">{RELATION_OPTIONS.map(opt=><button key={opt} onClick={()=>setRelation(opt)} className="transition-all duration-150" style={{fontSize:13,padding:"6px 14px",borderRadius:16,border:`1px solid ${relation===opt?P.mAccent:P.border}`,background:relation===opt?"#fff":P.warm,color:relation===opt?P.mAccent:P.inkMuted,fontWeight:relation===opt?600:400,fontFamily:F,cursor:"pointer"}}>{opt}</button>)}</div>
      </div>
      <div>
        <div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>备注</div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="填写一切方便老板记住这个人的信息，例如：负责北区渠道、开会时总坐李总旁边、去年见过一次。" style={{width:"100%",minHeight:110,padding:"12px 14px",borderRadius:12,border:`1px solid ${P.border}`,background:P.warm,fontSize:13,color:P.ink,fontFamily:F,outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=P.mAccent} onBlur={e=>e.target.style.borderColor=P.border}/>
      </div>
    </div>
  </DialogShell></Overlay>;
}


/* ═══════════════════════════════════════════════════════
   Pre-analysis Dialogs
   ═══════════════════════════════════════════════════════ */
function EntryPopup({onSelect,onClose}){
  const opts=[{key:"realtime",icon:"🔴",title:"实时录制",desc:"开会时打开，实时录音分析",color:P.red},{key:"upload",icon:"📎",title:"上传音频",desc:"上传会议录音文件（MP3/WAV/M4A等）",color:P.blue},{key:"paste",icon:"📋",title:"粘贴文本",desc:"从通义听悟、飞书妙记等复制会议记录",color:P.green}];
  return <Overlay onClose={onClose}><div className="anim-slide" style={{width:400,background:"#fff",borderRadius:20,padding:24,boxShadow:"0 24px 80px rgba(0,0,0,.18)"}}><div className="flex items-center justify-between" style={{marginBottom:20}}><h2 style={{fontSize:18,fontWeight:700,color:P.ink,fontFamily:S}}>开始会议分析</h2><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:P.inkFaint}}>×</button></div><div className="flex flex-col gap-3">{opts.map((o,i)=><button key={o.key} onClick={()=>onSelect(o.key)} className="anim-up transition-all duration-200" style={{animationDelay:`${i*60}ms`,display:"flex",alignItems:"center",gap:14,padding:"16px 18px",borderRadius:14,border:`1px solid ${P.border}`,background:"#fff",cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=o.color;e.currentTarget.style.background=P.warm}} onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.background="#fff"}}><span style={{fontSize:24}}>{o.icon}</span><div><div style={{fontSize:15,fontWeight:600,color:P.ink,fontFamily:F}}>{o.title}</div><div style={{fontSize:12,color:P.inkMuted,marginTop:2,fontFamily:F}}>{o.desc}</div></div></button>)}</div></div></Overlay>;
}
function PrepRealtimeDialog({onStart,onClose}){const[type,setType]=useState("默认");const[topic,setTopic]=useState("");return<Overlay onClose={onClose}><DialogShell title="实时录制" onClose={onClose} footer={<><GhostBtn onClick={onClose}>取消</GhostBtn><PrimaryBtn onClick={()=>onStart({type,topic})}>开始会议</PrimaryBtn></>}><div className="flex flex-col gap-6"><MeetingTypeSelector selected={type} onSelect={setType}/><TopicInput topic={topic} setTopic={setTopic}/></div></DialogShell></Overlay>}
function PrepUploadDialog({onStart,onClose}){
  const[type,setType]=useState("默认");const[topic,setTopic]=useState("");const[files,setFiles]=useState([]);const[prog,setProg]=useState({});
  const addFiles=()=>{const f={id:Date.now(),name:files.length===0?"销售周会录音-part1.mp3":"销售周会录音-part2.mp3",size:files.length===0?"12.4 MB":"8.7 MB",dur:files.length===0?"32:15":"18:40",status:"uploading"};setFiles(prev=>[...prev,f]);setProg(prev=>({...prev,[f.id]:0}));let p=0;const iv=setInterval(()=>{p+=Math.random()*15+5;if(p>=100){p=100;clearInterval(iv);setFiles(prev=>prev.map(x=>x.id===f.id?{...x,status:"ready"}:x))}setProg(prev=>({...prev,[f.id]:Math.min(p,100)}))},200)};
  const allReady=files.length>0&&files.every(f=>f.status==="ready");
  return <Overlay onClose={onClose}><DialogShell title="上传音频" onClose={onClose} footer={<><GhostBtn onClick={onClose}>取消</GhostBtn><PrimaryBtn disabled={!allReady} onClick={()=>onStart({type,topic,files})}>开始转写</PrimaryBtn></>}><div className="flex flex-col gap-6"><MeetingTypeSelector selected={type} onSelect={setType}/><div><div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>上传音频</div><button onClick={addFiles} className="transition-all duration-200" style={{width:"100%",padding:"28px 20px",borderRadius:14,border:`2px dashed ${P.mBorder}`,background:P.mBg,cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor=P.mAccent} onMouseLeave={e=>e.currentTarget.style.borderColor=P.mBorder}><div style={{fontSize:20,marginBottom:6}}>📎</div><div style={{fontSize:14,color:P.inkSoft,fontWeight:500,fontFamily:F}}>点击选择或拖拽音频文件到此处</div><div style={{fontSize:11,color:P.inkFaint,marginTop:8,lineHeight:1.6,fontFamily:F}}>支持 .mp3 .wav .m4a .wma .aac .ogg .amr .flac<br/>最多5个文件，总大小≤500MB</div></button>{files.length>0&&<div className="flex flex-col gap-2" style={{marginTop:12}}>{files.map(f=><div key={f.id} className="anim-up flex items-center gap-3" style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${P.borderLight}`,background:"#fff"}}><span style={{fontSize:16}}>🎵</span><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><span style={{fontSize:13,fontWeight:500,color:P.ink,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span><button onClick={()=>setFiles(prev=>prev.filter(x=>x.id!==f.id))} style={{background:"none",border:"none",cursor:"pointer",color:P.inkFaint,fontSize:16}}>×</button></div><div className="flex items-center gap-3" style={{marginTop:4}}><span style={{fontSize:11,color:P.inkFaint}}>{f.size}</span><span style={{fontSize:11,color:P.inkFaint}}>{f.dur}</span>{f.status==="ready"&&<span style={{fontSize:11,color:P.green,fontWeight:500}}>✓ 就绪</span>}</div>{f.status==="uploading"&&<div style={{marginTop:6,width:"100%",height:3,borderRadius:2,background:P.warmDark}}><div style={{width:`${prog[f.id]||0}%`,height:"100%",borderRadius:2,background:P.mAccent,transition:"width .2s ease"}}/></div>}</div></div>)}</div>}</div><TopicInput topic={topic} setTopic={setTopic}/></div></DialogShell></Overlay>;
}
function PrepPasteDialog({onStart,onClose}){
  const[type,setType]=useState("默认");const[topic,setTopic]=useState("");const[text,setText]=useState("");
  return <Overlay onClose={onClose}><DialogShell title="粘贴会议记录" onClose={onClose} footer={<><GhostBtn onClick={onClose}>取消</GhostBtn><PrimaryBtn disabled={!text.trim()} onClick={()=>onStart({type,topic,text})}>开始分析</PrimaryBtn></>}><div className="flex flex-col gap-6"><MeetingTypeSelector selected={type} onSelect={setType}/><div><div style={{fontSize:13,color:P.inkMuted,marginBottom:10,fontWeight:500}}>粘贴会议记录</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="粘贴通义听悟、飞书妙记等工具导出的会议记录文本…" style={{width:"100%",minHeight:160,padding:"14px 16px",borderRadius:14,border:`1px solid ${P.border}`,background:P.warm,fontSize:13,color:P.ink,fontFamily:F,outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=P.mAccent} onBlur={e=>e.target.style.borderColor=P.border}/><div style={{fontSize:11,color:P.inkFaint,marginTop:6}}>也支持上传 TXT / Word 文件</div></div><TopicInput topic={topic} setTopic={setTopic}/></div></DialogShell></Overlay>;
}

/* ═══════════════════════════════════════════════════════
   Recording Widget
   ═══════════════════════════════════════════════════════ */
function RecordingWidget({onStop,duration}){
  const[paused,setPaused]=useState(false);const bars=useRef([...Array(24)].map(()=>Math.random()*16+4));const[,tick]=useState(0);
  useEffect(()=>{if(paused)return;const id=setInterval(()=>tick(n=>n+1),150);return()=>clearInterval(id)},[paused]);
  return <div className="anim-slide fixed z-50" style={{bottom:24,left:"50%",transform:"translateX(-50%)",background:"#fff",borderRadius:20,padding:"14px 24px",boxShadow:"0 8px 40px rgba(0,0,0,.15),0 0 0 1px rgba(0,0,0,.04)",display:"flex",alignItems:"center",gap:16,minWidth:340}}>
    <div className="flex items-center gap-2"><div className={paused?"":"pulse-rec"} style={{width:10,height:10,borderRadius:"50%",background:paused?P.inkFaint:P.red}}/><span style={{fontSize:13,fontWeight:600,color:paused?P.inkFaint:P.red,fontFamily:F}}>{paused?"已暂停":"录音中"}</span></div>
    <span style={{fontSize:22,fontWeight:600,color:P.ink,fontFamily:"'SF Mono','Menlo',monospace",letterSpacing:1,minWidth:64}}>{String(Math.floor(duration/60)).padStart(2,"0")}:{String(duration%60).padStart(2,"0")}</span>
    <div className="flex items-center gap-0.5" style={{height:28,flex:1}}>{bars.current.map((h,i)=><div key={i} style={{width:2,borderRadius:1,background:paused?P.warmDark:P.mAccent,height:paused?4:`${Math.sin(Date.now()/300+i*.5)*h*.5+h*.5}px`,transition:"height .15s ease,background .3s",opacity:paused?0.4:0.6+Math.random()*0.4}}/>)}</div>
    <div className="flex items-center gap-2"><button onClick={()=>setPaused(!paused)} style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${P.border}`,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{paused?"▶":"⏸"}</button><button onClick={onStop} style={{width:36,height:36,borderRadius:"50%",border:"none",background:P.red,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:12,height:12,borderRadius:2,background:"#fff"}}/></button></div>
  </div>;
}

/* ═══════════════════════════════════════════════════════
   Result Card (main chat) — pure metadata
   ═══════════════════════════════════════════════════════ */
function ResultCard({topic,onExpand}){
  return <div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.mBorder}`,overflow:"hidden",maxWidth:420,cursor:"pointer"}} onClick={onExpand}>
    <div style={{padding:"14px 18px"}}><div className="flex items-center gap-2" style={{marginBottom:6}}><span style={{fontSize:16}}>🎙</span><span style={{fontSize:15,fontWeight:600,color:P.ink,fontFamily:S}}>{topic||"销售周会"}</span></div><div className="flex items-center gap-3" style={{fontSize:12,color:P.inkFaint}}><span>今天 14:30</span><span>·</span><span>45分钟</span><span>·</span><span>5人参会（4人发言）</span></div></div>
    <div className="flex" style={{borderTop:`1px solid ${P.borderLight}`}}><button className="flex-1 transition-all duration-150" style={{padding:10,fontSize:13,color:P.mAccent,fontWeight:500,background:"none",border:"none",borderRight:`1px solid ${P.borderLight}`,cursor:"pointer",fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=P.mBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>展开看看</button><button className="flex-1 transition-all duration-150" style={{padding:10,fontSize:13,color:P.inkMuted,background:"none",border:"none",cursor:"pointer",fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=P.warm} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>聊聊这场会议</button></div>
  </div>;
}

/* ═══════════════════════════════════════════════════════
   Analysis Layer
   ═══════════════════════════════════════════════════════ */
function AnalysisLayer({showAnn}){
  const[disagreed,setDisagreed]=useState(new Set());const[tracking,setTracking]=useState(new Set());
  const cc={"隐含假设":{bg:"#fef6f0",fg:P.mAccent},"言下之意":{bg:P.blueBg,fg:P.blue},"非共识":{bg:"#fef9ec",fg:"#b08d3a"},"被跳过":{bg:P.warm,fg:P.inkMuted}};
  const cf={"高":{bg:P.greenBg,fg:P.green},"中":{bg:"#fef9ec",fg:"#b08d3a"},"低":{bg:P.redBg,fg:P.red}};
  return <div className="anim-up">
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:12}}>📌 分析层：一个面板，按重要性排列。类别是标签不是分组。「不太同意」校准精度，含前提的条目附带「帮我盯着」。</div>}
    <div style={{background:"#fff",borderRadius:18,border:`1px solid ${P.border}`,overflow:"hidden"}}>
      <div style={{padding:"18px 22px 14px",borderBottom:`1px solid ${P.borderLight}`}}><h3 style={{fontSize:16,fontWeight:700,color:P.ink,fontFamily:S,marginBottom:2}}>这场会议，你可能漏掉的</h3><p style={{fontSize:12,color:P.inkFaint}}>{INSIGHTS.length} 条洞察，按重要性排列</p></div>
      {INSIGHTS.map((item,i)=>{const c=cc[item.cat]||cc["被跳过"];const isD=disagreed.has(item.id);const isT=tracking.has(item.premise?.text);return(
        <div key={item.id} className="transition-all duration-200" style={{padding:"16px 22px",borderBottom:i<INSIGHTS.length-1?`1px solid ${P.borderLight}`:"none",opacity:isD?0.4:1,background:isD?P.warm:"#fff"}}>
          <div className="flex items-center justify-between" style={{marginBottom:8}}><div className="flex items-center gap-2"><span style={{fontSize:14}}>{item.icon}</span><Pill bg={c.bg} fg={c.fg}>{item.cat}</Pill>{item.confidence&&<Pill bg={cf[item.confidence].bg} fg={cf[item.confidence].fg}>置信度：{item.confidence}</Pill>}</div><button onClick={()=>setDisagreed(prev=>{const n=new Set(prev);n.has(item.id)?n.delete(item.id):n.add(item.id);return n})} className="transition-all duration-150" style={{fontSize:11,padding:"3px 10px",borderRadius:10,cursor:"pointer",border:`1px solid ${isD?P.warmDark:P.border}`,background:isD?P.warmDark:"#fff",color:isD?P.inkMuted:P.inkFaint,fontFamily:F}}>{isD?"已标记":"不太同意"}</button></div>
          <p style={{fontSize:14,color:P.inkSoft,lineHeight:1.7,fontFamily:F}}>{item.text}</p>
          {item.hasPremise&&item.premise&&<div className="anim-in" style={{marginTop:12,background:P.warm,borderRadius:12,padding:"12px 16px",border:`1px solid ${P.borderLight}`}}><div style={{fontSize:12,color:P.inkMuted,marginBottom:6,fontWeight:500}}>这件事要成，有个前提：</div><p style={{fontSize:14,color:P.ink,lineHeight:1.6,fontFamily:F,fontWeight:500}}>「{item.premise.text}」<span style={{color:P.mAccent,fontWeight:400}}>{item.premise.tension}</span></p><div className="flex items-center gap-2" style={{marginTop:10}}><button onClick={()=>setTracking(prev=>{const n=new Set(prev);n.has(item.premise.text)?n.delete(item.premise.text):n.add(item.premise.text);return n})} className="transition-all duration-150" style={{fontSize:12,padding:"5px 14px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:F,background:isT?P.greenBg:P.ink,color:isT?P.green:"#f5f5f5",fontWeight:500}}>{isT?"✓ 盯上了":"帮我盯着"}</button><button style={{fontSize:12,padding:"5px 14px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:F,background:P.warm,color:P.inkFaint}}>跳过</button></div></div>}
        </div>
      )})}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════
   People Cards
   ═══════════════════════════════════════════════════════ */
function PersonCard({card}){
  const[binding,setBinding]=useState(card.aiGuess||"");const[showDrop,setShowDrop]=useState(false);const[confirmed,setConfirmed]=useState(false);const[showHistory,setShowHistory]=useState(false);const[createdNew,setCreatedNew]=useState(false);const[newProfile,setNewProfile]=useState(null);const[showCreateDialog,setShowCreateDialog]=useState(false);const dropRef=useRef(null);
  useEffect(()=>{if(!showDrop)return;const h=e=>{if(dropRef.current&&!dropRef.current.contains(e.target))setShowDrop(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[showDrop]);
  const handleSelect=p=>{setBinding(p.name);setCreatedNew(false);setShowDrop(false);setConfirmed(true);setShowHistory(true)};
  const handleCreate=()=>{setShowDrop(false);setShowCreateDialog(true)};
  const handleConfirmGuess=()=>{setBinding(card.aiGuess||"");setCreatedNew(false);setConfirmed(true);setShowHistory(true)};
  const handleCreateSubmit=({name,relation,note})=>{setBinding(name);setNewProfile({name,relation,note});setCreatedNew(true);setConfirmed(true);setShowHistory(true);setShowCreateDialog(false)};
  const m=EXISTING_PEOPLE.find(p=>p.name===binding);
  return <><div className="anim-up" style={{background:"#fff",borderRadius:16,border:`1px solid ${P.border}`,overflow:"hidden"}}>
    <div style={{padding:"16px 20px",position:"relative"}}>
      {card.roleLabel&&<div style={{position:"absolute",top:16,right:20,fontSize:12,lineHeight:1,padding:"8px 12px",borderRadius:999,background:P.red,color:"#fff",fontWeight:700,fontFamily:F,boxShadow:"0 6px 18px rgba(196,92,92,.18)"}}>{card.roleLabel}</div>}
      <div className="flex items-start gap-3">
        <div className="relative" ref={dropRef}>
          <div style={{width:40,height:40,borderRadius:"50%",background:m?.bgColor||P.warm,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:m?.color||P.inkMuted,fontSize:16,fontFamily:S,cursor:"pointer",border:`2px ${confirmed?"solid":"dashed"} ${confirmed?(m?.color||P.inkMuted):P.mAccent}`}} onClick={()=>setShowDrop(!showDrop)}>{binding?binding[0]:confirmed&&createdNew?"+":`#${card.speakerNum}`}</div>
          {showDrop&&<div className="absolute z-20 anim-in" style={{top:46,left:0,width:220,background:"#fff",borderRadius:12,border:`1px solid ${P.border}`,boxShadow:"0 8px 30px rgba(0,0,0,.12)",overflow:"hidden"}}><div style={{padding:"8px 12px",fontSize:11,color:P.inkFaint,borderBottom:`1px solid ${P.borderLight}`}}>优先从已有联系人里匹配确认</div>{EXISTING_PEOPLE.map(p=><button key={p.id} onClick={()=>handleSelect(p)} className="flex items-center gap-2 w-full transition-all duration-100" style={{padding:"8px 12px",border:"none",background:binding===p.name?P.warm:"#fff",cursor:"pointer",textAlign:"left",fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=P.warm} onMouseLeave={e=>{if(binding!==p.name)e.currentTarget.style.background="#fff"}}><div style={{width:24,height:24,borderRadius:"50%",background:p.bgColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:p.color}}>{p.avatar}</div><span style={{fontSize:13,color:P.ink}}>{p.name}</span><span style={{fontSize:11,color:P.inkFaint,marginLeft:"auto"}}>{p.meetings}次</span></button>)}<button onClick={handleCreate} className="w-full transition-all duration-100" style={{padding:"8px 12px",border:"none",borderTop:`1px solid ${P.borderLight}`,background:"#fff",cursor:"pointer",textAlign:"left",fontSize:13,color:P.blue,fontFamily:F}} onMouseEnter={e=>e.currentTarget.style.background=P.blueBg} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>都不是？新建联系人</button></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap" style={{marginBottom:2,paddingRight:96}}><span style={{fontSize:15,fontWeight:600,color:P.ink,fontFamily:S}}>{`说话人 ${card.speakerNum}`}</span>{!confirmed&&<Pill bg={P.mBg} fg={P.mAccent}>待确认</Pill>}{confirmed&&m&&<Pill bg={P.purpleBg} fg={P.purple}>已关联历史</Pill>}{confirmed&&createdNew&&<Pill bg={P.blueBg} fg={P.blue}>新建联系人</Pill>}<button onClick={()=>setShowDrop(!showDrop)} style={{fontSize:11,color:P.blue,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>{confirmed?"重新确认":"去匹配联系人"}</button></div>
          {binding&&<div style={{fontSize:13,color:P.inkMuted,marginBottom:6,fontFamily:F}}>当前确认：{binding}</div>}
          {createdNew&&newProfile&&<div style={{fontSize:12,color:P.inkFaint,marginBottom:6,fontFamily:F}}>关系：{newProfile.relation}{newProfile.note?` · ${newProfile.note}`:""}</div>}
          {card.aiGuess&&!confirmed&&<div style={{fontSize:12,color:P.inkFaint,marginBottom:6}}>AI 猜测这位可能是「{card.aiGuess}」<button onClick={handleConfirmGuess} style={{color:P.green,background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:500,marginLeft:6}}>✓ 先按这个确认</button></div>}
        </div>
      </div>
      <div style={{marginTop:12,padding:"12px 14px",borderRadius:12,background:P.warm,border:`1px solid ${P.borderLight}`}}>
        <div style={{fontSize:12,color:P.inkMuted,marginBottom:8,fontWeight:500}}>会议关键发言</div>
        <div style={{borderLeft:`4px solid ${P.border}`,paddingLeft:12}}>
          <p style={{fontSize:15,color:P.ink,lineHeight:1.65,fontFamily:F,fontWeight:500}}>{card.quote}</p>
          <p style={{fontSize:12,color:P.inkFaint,marginTop:6,fontFamily:F}}>出现在：{card.quoteTopic}</p>
        </div>
      </div>
      {showHistory&&confirmed&&<div className="anim-up" style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:P.purpleBg,border:`1px solid ${P.purpleBorder}`,display:"flex",alignItems:"start",gap:10}}><span style={{fontSize:12,marginTop:1}}>💡</span><div className="flex-1"><div style={{fontSize:12,color:P.purple,marginBottom:4,fontWeight:600}}>历史关联比对</div><p style={{fontSize:13,color:P.purple,lineHeight:1.6,fontFamily:F}}>{m?card.c07Existing:card.c07New}</p><div className="flex gap-2" style={{marginTop:8}}><button style={{fontSize:12,color:P.purple,background:"#fff",border:`1px solid ${P.purpleBorder}`,borderRadius:16,padding:"4px 12px",cursor:"pointer",fontFamily:F}}>记住这个变化</button><button style={{fontSize:12,color:P.inkFaint,background:"none",border:"none",cursor:"pointer",fontFamily:F}}>知道了</button></div></div></div>}
    </div>
  </div>{showCreateDialog&&<NewContactDialog speakerNum={card.speakerNum} onClose={()=>setShowCreateDialog(false)} onCreate={handleCreateSubmit}/>}</>;
}

/* ═══════════════════════════════════════════════════════
   Thread Content (Analysis + Sedimentation + Chat)
   ═══════════════════════════════════════════════════════ */
function ThreadContent({showAnn}){
  return <div style={{maxWidth:600,margin:"0 auto"}}>
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"8px 12px",marginBottom:16}}>📌 Thread两层架构：<strong>分析层</strong>（补盲清单）+ <strong>沉淀层</strong>（人）。先看这次会议里的信号，再由老板确认身份，随后追加历史关联。</div>}
    <AnalysisLayer showAnn={showAnn}/>
    <div style={{margin:"28px 0",display:"flex",alignItems:"center",gap:12}}><div style={{flex:1,height:1,background:P.border}}/><span style={{fontSize:12,color:P.inkFaint,whiteSpace:"nowrap"}}>以下内容会沉淀到你的记忆中</span><div style={{flex:1,height:1,background:P.border}}/></div>
    {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:12}}>📌 沉淀层·人：每个关键人物都先给老板看本次会议信号和关键发言，方便把“说话人 1/2/3”对上联系人。确认后再 append 历史比对结果。</div>}
    <div style={{marginBottom:10}}><h3 style={{fontSize:15,fontWeight:600,color:P.ink,fontFamily:S}}>确认这场会议里的讲话人</h3><p style={{fontSize:12,color:P.inkFaint,marginTop:2}}>先根据会议里的关键发言确认是谁，确认后会自动补充历史关联</p></div>
    <div className="flex flex-col gap-3">{SPEAKER_CARDS.map(c=><PersonCard key={c.id} card={c}/>)}</div>
    <div style={{marginTop:28,textAlign:"center",fontSize:12,color:P.inkFaint}}>确认的人物会出现在「记忆」中，下次会议自动关联</div>
    {/* Thread Chat */}
    <div style={{marginTop:24,paddingBottom:8}}>
      {showAnn&&<div style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:8,padding:"6px 10px",marginBottom:12}}>📌 Thread内对话：AI带着会议上下文主动开场。老板可以追问分析中的任何一点。底层四阶段引擎根据对话状态动态切换。</div>}
      <div className="flex items-start gap-2.5" style={{marginBottom:16}}><div style={{width:24,height:24,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center",marginTop:2}}><span style={{fontSize:8,color:"#fff",fontWeight:700}}>AI</span></div><div><span style={{fontSize:11,color:P.inkFaint,display:"block",marginBottom:3}}>诸葛</span><div style={{background:"#fff",border:`1px solid ${P.borderLight}`,borderRadius:"14px 14px 14px 4px",padding:"12px 16px",fontSize:14,color:P.inkSoft,lineHeight:1.65,fontFamily:F,maxWidth:420}}>李总的态度变化是这场会议最值得关注的信号。你觉得他是对新业务方向本身有顾虑，还是有别的原因？</div></div></div>
      <div className="flex items-center gap-2"><div style={{flex:1,background:P.warm,border:`1px solid ${P.border}`,borderRadius:14,padding:"11px 18px",fontSize:14,color:P.inkFaint,fontFamily:F,cursor:"text"}}>对这场会议有什么想聊的…</div><button style={{background:P.ink,color:"#f5f5f5",borderRadius:14,padding:"11px 20px",fontSize:14,fontWeight:500,border:"none",cursor:"pointer",fontFamily:F}}>发送</button></div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════
   Analyzing Bar
   ═══════════════════════════════════════════════════════ */
function AnalyzingBar({topic}){
  return <div className="anim-up flex items-center gap-3" style={{padding:"10px 16px",borderRadius:12,background:P.mBg,border:`1px solid ${P.mBorder}`}}><span style={{fontSize:14}}>🎙</span><span style={{fontSize:13,fontWeight:500,color:P.mAccent,fontFamily:F}}>{topic||"会议录音"}</span><div style={{flex:1}}/><div className="flex items-center gap-1.5"><div className="flex gap-1"><span className="dot-1" style={{width:4,height:4,borderRadius:"50%",background:P.mAccent,display:"inline-block"}}/><span className="dot-2" style={{width:4,height:4,borderRadius:"50%",background:P.mAccent,display:"inline-block"}}/><span className="dot-3" style={{width:4,height:4,borderRadius:"50%",background:P.mAccent,display:"inline-block"}}/></div><span style={{fontSize:12,color:P.mAccent}}>正在分析…</span></div></div>;
}


/* ═══════════════════════════════════════════════════════
   ═══════ MAIN COMPONENT ═══════
   ═══════════════════════════════════════════════════════ */
export default function MeetingAnalysisDemo(){
  const[phase,setPhase]=useState(PHASES.idle);
  const[showAnn,setShowAnn]=useState(true);
  const[topic,setTopic]=useState("");
  const[recDur,setRecDur]=useState(0);
  const[msgs,setMsgs]=useState([{role:"ai",text:"你好，选个场景开始，或者直接聊聊你现在在想的事。"}]);
  const[showThread,setShowThread]=useState(false);
  const recIv=useRef(null);const chatEnd=useRef(null);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"})},[msgs,phase]);
  useEffect(()=>{if(phase===PHASES.recording){recIv.current=setInterval(()=>setRecDur(d=>d+1),1000)}else{clearInterval(recIv.current)}return()=>clearInterval(recIv.current)},[phase]);
  const[,fu]=useState(0);
  useEffect(()=>{if(phase!==PHASES.recording)return;const id=setInterval(()=>fu(n=>n+1),150);return()=>clearInterval(id)},[phase]);

  const handleEntry=k=>{if(k==="realtime")setPhase(PHASES.prepRealtime);else if(k==="upload")setPhase(PHASES.prepUpload);else setPhase(PHASES.prepPaste)};
  const pushResult=t=>{setTopic(t||"销售周会");setPhase(PHASES.analyzing);setMsgs(p=>[...p,{role:"system",text:`🎙 正在分析「${t||"销售周会"}」…`}]);setTimeout(()=>{setPhase(PHASES.result);setMsgs(p=>[...p,{role:"ai",text:"刚才的会议，李总对新业务的态度和上次明显不同——上次主动请缨，这次全程没接话。",hasCard:true}])},3500)};
  const startRec=({topic:t})=>{setTopic(t||"销售周会");setRecDur(0);setPhase(PHASES.recording)};
  const stopRec=()=>{setMsgs(p=>[...p,{role:"system",text:`🎙 「${topic||"销售周会"}」录制完成，共${Math.floor(recDur/60)}分${recDur%60}秒`}]);pushResult(topic)};

  const hasMeetingThread = phase===PHASES.recording||phase===PHASES.analyzing||phase===PHASES.result||showThread;

  /* Phase nav items for right panel */
  const navItems=[
    {key:PHASES.idle,label:"主对话流",icon:"💬"},
    {key:PHASES.entryPopup,label:"入口选择",icon:"🎙"},
    {sep:true,label:"── 三条路径 ──"},
    {key:PHASES.prepRealtime,label:"实时录制准备",icon:"🔴"},
    {key:PHASES.recording,label:"录音中",icon:"⏺"},
    {key:PHASES.prepUpload,label:"上传音频准备",icon:"📎"},
    {key:PHASES.prepPaste,label:"粘贴文本准备",icon:"📋"},
    {sep:true,label:"── 分析输出 ──"},
    {key:PHASES.analyzing,label:"AI分析中",icon:"⏳"},
    {key:PHASES.result,label:"结果 → Thread",icon:"✅"},
  ];

  return <>
    <style>{STYLE}</style>
    <div className="h-screen flex flex-col" style={{background:P.sb,fontFamily:F}}>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between shrink-0" style={{background:"#161616",borderBottom:"1px solid #2a2a2a",padding:"7px 16px"}}>
        <span style={{color:"#ccc",fontWeight:700,fontSize:13}}>Demo 3/6 · 会议分析 Thread — 完整交互流程 v2</span>
        <label className="flex items-center gap-2" style={{fontSize:12,color:"#777"}}><input type="checkbox" checked={showAnn} onChange={e=>setShowAnn(e.target.checked)} style={{accentColor:P.accent}}/> 设计批注</label>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* ═══════ LEFT SIDEBAR (matches 01-layout) ═══════ */}
        <div className="flex flex-col shrink-0" style={{width:240,background:P.sb,borderRight:"1px solid #2a2a2a"}}>
          {/* Nav */}
          <div style={{padding:12,borderBottom:"1px solid #2a2a2a"}}>
            <div className="flex flex-col gap-0.5">
              {[{key:"chat",icon:"💬",label:"对话"},{key:"memory",icon:"🧠",label:"记忆",badge:"内测"},{key:"network",icon:"🔗",label:"人脉圈",badge:"🔒"}].map(item=>(
                <button key={item.key} onClick={()=>{if(item.key==="chat"){setShowThread(false)}}}
                  className="flex items-center gap-2.5 transition-all duration-150"
                  style={{width:"100%",padding:"8px 12px",borderRadius:10,fontSize:13,fontWeight:500,border:"none",cursor:"pointer",textAlign:"left",fontFamily:F,
                    ...(item.key==="chat"&&!showThread?{background:P.sbActive,color:"#fff",boxShadow:`inset 3px 0 0 ${P.accent}`}:{background:"transparent",color:"#aaa"})
                  }}
                  onMouseEnter={e=>{if(!(item.key==="chat"&&!showThread))e.currentTarget.style.background=P.sbHover}}
                  onMouseLeave={e=>{if(!(item.key==="chat"&&!showThread))e.currentTarget.style.background="transparent"}}>
                  <span style={{fontSize:16}}>{item.icon}</span><span>{item.label}</span>
                  {item.badge&&<span style={{marginLeft:"auto",fontSize:10,background:"#333",color:"#888",padding:"2px 6px",borderRadius:4}}>{item.badge}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Thread area */}
          <div className="flex-1 overflow-y-auto" style={{padding:12}}>
            <div style={{fontSize:10,color:"#666",letterSpacing:".1em",fontWeight:600,marginBottom:8,paddingLeft:4,textTransform:"uppercase"}}>进行中</div>

            {/* Meeting thread entry — appears when recording/analyzing/result */}
            {hasMeetingThread && (
              <div onClick={()=>{if(phase===PHASES.result||showThread)setShowThread(true)}}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
                style={{background:showThread?P.sbActive:"transparent",marginBottom:2,...(showThread?{boxShadow:`inset 3px 0 0 ${P.accent}`}:{})}}
                onMouseEnter={e=>{if(!showThread)e.currentTarget.style.background=P.sbHover}}
                onMouseLeave={e=>{if(!showThread)e.currentTarget.style.background="transparent"}}>
                <span className="text-lg mt-0.5 shrink-0">🎙</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={phase===PHASES.recording?"pulse-glow":""} style={{width:6,height:6,borderRadius:"50%",background:phase===PHASES.recording?P.red:phase===PHASES.analyzing?"#b08d3a":P.green,display:"inline-block",flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500,color:"#e0e0e0",fontFamily:F}} className="truncate">{topic||"销售周会"}</span>
                  </div>
                  <p style={{fontSize:11,color:"#888",marginTop:2,fontFamily:F}} className="truncate">
                    {phase===PHASES.recording?"正在录音…":phase===PHASES.analyzing?"正在分析…":"分析完成"}
                  </p>
                  <span style={{fontSize:11,color:"#666"}}>{phase===PHASES.recording?"进行中":"刚刚"}</span>
                </div>
              </div>
            )}

            {/* Other existing threads */}
            {SIDEBAR_THREADS.map(t=>(
              <div key={t.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
                style={{background:"transparent"}}
                onMouseEnter={e=>e.currentTarget.style.background=P.sbHover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span className="text-lg mt-0.5 shrink-0">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{width:6,height:6,borderRadius:"50%",background:P.green,display:"inline-block",flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500,color:"#e0e0e0",fontFamily:F}} className="truncate">{t.title}</span>
                  </div>
                  <p style={{fontSize:11,color:"#888",marginTop:2,fontFamily:F}} className="truncate">{t.summary}</p>
                  <span style={{fontSize:11,color:"#666"}}>{t.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* User */}
          <div style={{padding:12,borderTop:"1px solid #2a2a2a"}}>
            <div className="flex items-center gap-2.5">
              <div style={{width:32,height:32,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${P.accent},#a07050)`,color:"#fff",fontSize:13,fontWeight:700}}>夏</div>
              <div><div style={{fontSize:13,color:"#e0e0e0",fontWeight:500}}>夏总</div><div style={{fontSize:11,color:"#777"}}>制造业 · 50人团队</div></div>
            </div>
          </div>
        </div>

        {/* ═══════ MIDDLE: Main content ═══════ */}
        <div className="flex-1 flex flex-col min-w-0" style={{background:P.parchment}}>
          {/* Thread header */}
          {showThread&&<div className="shrink-0 flex items-center gap-3" style={{padding:"10px 24px",borderBottom:`1px solid ${P.border}`,background:"#fff"}}>
            <button onClick={()=>setShowThread(false)} style={{fontSize:12,color:P.inkFaint,background:"none",border:"none",cursor:"pointer"}}>← 主对话</button>
            <span style={{color:P.border}}>|</span><span style={{fontSize:16}}>🎙</span>
            <span style={{fontSize:14,fontWeight:600,color:P.ink,fontFamily:S}}>{topic||"销售周会"}</span>
            <span style={{fontSize:11,color:P.inkFaint}}>今天 14:30 · 45分钟 · 5人参会</span>
          </div>}

          {showThread?(
            <div className="flex-1 overflow-y-auto" style={{padding:"24px 28px"}}><ThreadContent showAnn={showAnn}/></div>
          ):(
            <>
              {/* Chat header */}
              <div className="shrink-0 flex items-center gap-3" style={{padding:"12px 24px",borderBottom:`1px solid ${P.border}`}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  <span style={{fontSize:11,color:"#fff",fontWeight:700}}>AI</span>
                  <div style={{position:"absolute",bottom:-1,right:-2,width:14,height:14,borderRadius:"50%",background:P.accent,color:"#fff",fontSize:7,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>AI</div>
                </div>
                <div><div className="flex items-center gap-2"><span style={{fontSize:15,fontWeight:700,color:P.ink,fontFamily:S}}>诸葛</span><span style={{fontSize:9,fontWeight:700,background:P.accentBg,color:P.accent,padding:"2px 6px",borderRadius:4}}>AI</span><span style={{fontSize:10,fontWeight:500,background:P.greenBg,color:P.green,padding:"2px 8px",borderRadius:10}}>在线</span></div><div style={{fontSize:12,color:P.inkFaint,marginTop:1}}>🎯 只站你这边</div></div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto" style={{padding:"24px 28px"}}>
                <div style={{maxWidth:560,margin:"0 auto"}}>
                  {showAnn&&phase===PHASES.idle&&<div className="anim-in" style={{fontSize:11,color:P.accent,background:P.accentBg,borderRadius:10,padding:"8px 12px",marginBottom:16}}>📌 主对话流。结果卡片=纯元数据（识别层），一句话判断=60-80字钩子（行动层），制造信息缺口。</div>}
                  {msgs.map((msg,i)=>(
                    <div key={i} className={`flex ${msg.role==="user"?"justify-end":"justify-start"} anim-up`} style={{marginBottom:16,animationDelay:`${i*50}ms`}}>
                      <div style={{maxWidth:440}}>
                        {msg.role==="ai"&&<div className="flex items-center gap-1.5" style={{marginBottom:4}}><div style={{width:20,height:20,borderRadius:"50%",background:P.inkSoft,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#fff",fontWeight:700}}>AI</span></div><span style={{fontSize:11,color:P.inkFaint}}>诸葛</span></div>}
                        {msg.role==="system"?<div style={{fontSize:12,color:P.inkMuted,background:P.warm,borderRadius:10,padding:"8px 14px",border:`1px solid ${P.borderLight}`}}>{msg.text}</div>
                        :<div style={{borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.65,fontFamily:F,...(msg.role==="user"?{background:P.ink,color:"#f0f0f0"}:{background:"#fff",color:P.inkSoft,border:`1px solid ${P.borderLight}`})}}>{msg.text}</div>}
                        {msg.hasCard&&<div style={{marginTop:10}}><ResultCard topic={topic} onExpand={()=>setShowThread(true)}/></div>}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEnd}/>
                </div>
              </div>

              {/* Input bar */}
              <div className="shrink-0" style={{padding:"12px 28px 16px",borderTop:`1px solid ${P.border}`,background:P.parchment}}>
                {phase===PHASES.analyzing&&<div style={{marginBottom:10}}><AnalyzingBar topic={topic}/></div>}
                <div className="flex gap-2" style={{marginBottom:8}}>
                  {[{icon:"🎙",label:"会议",active:true,onClick:()=>setPhase(PHASES.entryPopup)},{icon:"📋",label:"汇报"},{icon:"📖",label:"文章"}].map((s,i)=>(
                    <button key={i} onClick={s.onClick} className="flex items-center gap-1.5 transition-all duration-200"
                      style={{fontSize:12,color:s.active?P.mAccent:P.inkMuted,border:`1px solid ${s.active?P.mBorder:P.border}`,borderRadius:8,padding:"5px 12px",background:s.active?P.mBg:"#fff",cursor:s.onClick?"pointer":"default",fontFamily:F,fontWeight:s.active?500:400}}>
                      <span>{s.icon}</span><span>{s.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2"><div style={{flex:1,background:P.warm,border:`1px solid ${P.border}`,borderRadius:14,padding:"11px 18px",fontSize:14,color:P.inkFaint,fontFamily:F}}>聊聊你现在脑子里最乱的一件事…</div><button style={{background:P.ink,color:"#f5f5f5",borderRadius:14,padding:"11px 20px",fontSize:14,fontWeight:500,border:"none",cursor:"pointer",fontFamily:F}}>发送</button></div>
              </div>
            </>
          )}
        </div>

        {/* ═══════ RIGHT: Phase Navigator (demo only) ═══════ */}
        <div className="shrink-0 flex flex-col" style={{width:170,background:"#fff",borderLeft:`1px solid ${P.border}`}}>
          <div style={{padding:"12px 10px 6px",fontSize:10,color:P.inkFaint,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Demo 交互阶段</div>
          <div className="flex-1 overflow-y-auto" style={{padding:"0 6px"}}>
            {navItems.map((s,i)=>s.sep
              ?<div key={i} style={{padding:"6px 8px",fontSize:9,color:P.inkFaint,textAlign:"center"}}>{s.label}</div>
              :<button key={s.key} onClick={()=>{
                setPhase(s.key);
                if(s.key===PHASES.result){setTopic(topic||"销售周会");if(!msgs.some(m=>m.hasCard))setMsgs(p=>[...p,{role:"ai",text:"李总对新业务的态度和上次明显不同。",hasCard:true}])}
                if(s.key===PHASES.recording){setRecDur(0);setTopic(topic||"销售周会")}
                if(s.key===PHASES.idle)setShowThread(false);
              }}
              className="transition-all duration-150"
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",margin:"1px 0",borderRadius:6,border:"none",cursor:"pointer",textAlign:"left",width:"100%",
                background:phase===s.key?P.accentBg:"transparent",color:phase===s.key?P.accent:P.inkMuted,fontWeight:phase===s.key?600:400,fontSize:11,fontFamily:F}}>
              <span style={{fontSize:12}}>{s.icon}</span><span>{s.label}</span>
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Popups */}
      {phase===PHASES.entryPopup&&<EntryPopup onSelect={handleEntry} onClose={()=>setPhase(PHASES.idle)}/>}
      {phase===PHASES.prepRealtime&&<PrepRealtimeDialog onStart={startRec} onClose={()=>setPhase(PHASES.idle)}/>}
      {phase===PHASES.prepUpload&&<PrepUploadDialog onStart={({topic:t})=>pushResult(t)} onClose={()=>setPhase(PHASES.idle)}/>}
      {phase===PHASES.prepPaste&&<PrepPasteDialog onStart={({topic:t})=>pushResult(t)} onClose={()=>setPhase(PHASES.idle)}/>}
      {phase===PHASES.recording&&<RecordingWidget onStop={stopRec} duration={recDur}/>}
    </div>
  </>;
}
