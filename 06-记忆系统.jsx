import { useState } from "react";

const PEOPLE = [
  {
    id: 1, name: "李总", role: "副总裁·新业务", avatar: "李", color: "indigo",
    status: "需要关注",
    pattern: "态度由积极转为沉默，可能对新业务方向有保留",
    signals: [
      { date: "2/25 销售周会", text: "新业务讨论时全程未发言", type: "warning" },
      { date: "2/18 产品评审", text: "用「可以探索」表达保留意见", type: "warning" },
      { date: "2/11 战略会", text: "主动请缨负责新业务板块", type: "positive" },
    ],
    behaviors: [
      "习惯用「我们可以探索一下」表达保留意见",
      "在跨部门协作议题上倾向于沉默",
      "上两次用「可以探索」句式的事，后来都没推进",
    ],
    commitments: [
      { text: "负责新业务板块的前期调研", deadline: "3月15日", status: "at_risk" },
    ],
    interactions: 8,
  },
  {
    id: 2, name: "张总", role: "销售总监", avatar: "张", color: "orange",
    status: "持续关注",
    pattern: "承诺激进，交付打折",
    signals: [
      { date: "2/25 Q2汇报", text: "数据指标从「转化率」偷换成「活跃度」", type: "warning" },
      { date: "2/20 周报", text: "承诺的渠道评估报告没有提及", type: "warning" },
      { date: "2/15 销售会", text: "承诺月底完成渠道评估", type: "neutral" },
    ],
    behaviors: [
      "汇报中习惯用大词（「突破性」「显著」），数据支撑偏弱",
      "遇到追问时倾向于转移话题到新计划",
      "过去3次承诺的deadline都延期了（平均12天）",
    ],
    commitments: [
      { text: "月底完成渠道评估报告", deadline: "2月28日", status: "overdue" },
      { text: "Q2推广方案修改版", deadline: "3月5日", status: "pending" },
    ],
    interactions: 12,
  },
];

const EVENTS = [
  {
    id: 1, name: "Q2投入300万推新业务",
    date: "2/25 销售周会",
    assumptions: [
      { text: "现有渠道能复用", status: "unverified", evidence: "尚无数据支撑" },
      { text: "李总团队能承接", status: "at_risk", evidence: "李总近期态度明显变化" },
      { text: "三个月内见效", status: "unverified", evidence: "上次类似投入花了六个月" },
    ],
  },
  {
    id: 2, name: "批准张总15万渠道预算",
    date: "待决策",
    assumptions: [
      { text: "转化率能维持当前水平", status: "at_risk", evidence: "数据口径刚被偷换" },
      { text: "团队人手足够执行", status: "unverified", evidence: "张总汇报未提人力规划" },
    ],
  },
];

const statusColors = {
  unverified: { bg: "bg-slate-100", text: "text-slate-600", label: "未验证" },
  at_risk: { bg: "bg-red-100", text: "text-red-600", label: "存疑" },
  verified: { bg: "bg-green-100", text: "text-green-600", label: "已验证" },
  disproven: { bg: "bg-red-200", text: "text-red-700", label: "已证伪" },
  overdue: { bg: "bg-red-100", text: "text-red-600", label: "已逾期" },
  pending: { bg: "bg-slate-100", text: "text-slate-600", label: "进行中" },
};

const avatarColors = {
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
};

export default function MemoryDemo() {
  const [tab, setTab] = useState("people");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const person = PEOPLE.find(p => p.id === selectedPerson);
  const event = EVENTS.find(e => e.id === selectedEvent);

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between shrink-0">
        <h1 className="text-white font-bold text-sm">Demo 6/6：记忆系统（人和事）</h1>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)} className="rounded" />
          显示设计批注
        </label>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: List */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="flex border-b border-slate-100">
            {[
              { key: "people", label: "人", count: PEOPLE.length },
              { key: "events", label: "事", count: EVENTS.length },
            ].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSelectedPerson(null); setSelectedEvent(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-all ${tab === t.key ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}>
                {t.label} <span className="text-xs ml-1 bg-slate-100 px-1.5 py-0.5 rounded-full">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "people" && PEOPLE.map(p => (
              <button key={p.id} onClick={() => { setSelectedPerson(p.id); setSelectedEvent(null); }}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-all ${selectedPerson === p.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${avatarColors[p.color]}`}>{p.avatar}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.role}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{p.pattern}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "需要关注" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{p.status}</span>
                  <span className="text-xs text-slate-400">{p.interactions}次交互</span>
                </div>
              </button>
            ))}

            {tab === "events" && EVENTS.map(e => (
              <button key={e.id} onClick={() => { setSelectedEvent(e.id); setSelectedPerson(null); }}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-all ${selectedEvent === e.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                <div className="text-sm font-semibold text-slate-800">{e.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{e.date}</div>
                <div className="flex gap-1 mt-2">
                  {e.assumptions.map((a, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${a.status === "at_risk" ? "bg-red-400" : "bg-slate-300"}`} />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">{e.assumptions.length}个假设</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {!person && !event && (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              <div className="text-center">
                {showAnnotations && <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-left max-w-md">
                  [注] 记忆系统按「人」和「事」两个维度组织。<br/><br/>
                  「人」积累的不是档案信息，而是行为模式。<br/>
                  「事」追踪的不是项目进度，而是决策时的隐含假设。<br/><br/>
                  两者在「假设」层面交汇——用人的行为模式，检验事的隐含假设。<br/><br/>
                  事实类记忆静默入库，判断类记忆需老板确认。
                </div>}
                <p className="text-2xl mb-2">忆</p>
                <p>选择左侧的人或事查看详情</p>
              </div>
            </div>
          )}

          {person && (
            <div className="max-w-xl">
              {/* Person Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${avatarColors[person.color]}`}>{person.avatar}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{person.name}</h2>
                  <p className="text-sm text-slate-500">{person.role} · {person.interactions}次交互</p>
                </div>
                <span className={`ml-auto text-xs px-3 py-1 rounded-full ${person.status === "需要关注" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{person.status}</span>
              </div>

              {/* Pattern */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">行为模式</p>
                <p className="text-sm font-medium text-amber-800">{person.pattern}</p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">信号时间线</p>
                <div className="space-y-3">
                  {person.signals.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.type === "warning" ? "bg-amber-400" : s.type === "positive" ? "bg-green-400" : "bg-slate-300"}`} />
                      <div>
                        <p className="text-xs text-slate-400">{s.date}</p>
                        <p className="text-sm text-slate-700">{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behaviors */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">AI归纳的规律</p>
                {person.behaviors.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-slate-400 mt-0.5">·</span>
                    <p className="text-sm text-slate-600">{b}</p>
                  </div>
                ))}
              </div>

              {/* Commitments */}
              {person.commitments.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">承诺追踪</p>
                  {person.commitments.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-2">
                      <div>
                        <p className="text-sm text-slate-700">{c.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">截止：{c.deadline}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status]?.bg} ${statusColors[c.status]?.text}`}>
                        {statusColors[c.status]?.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="text-sm px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">帮我准备和他谈话</button>
                <button className="text-sm px-4 py-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">聊聊这个人</button>
              </div>
            </div>
          )}

          {event && (
            <div className="max-w-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">{event.name}</h2>
                <p className="text-sm text-slate-400 mt-1">决策于 {event.date}</p>
              </div>

              {showAnnotations && <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">[注] 「事」的本质不是项目进度，而是决策时的隐含假设。<br/>每个假设有状态——待验证/存疑/已验证/已证伪。当假设被证伪时主动提醒。</div>}

              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">隐含假设</p>
                <div className="space-y-3">
                  {event.assumptions.map((a, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800">{a.text}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[a.status]?.bg} ${statusColors[a.status]?.text}`}>
                          {statusColors[a.status]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{a.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="text-sm px-4 py-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">聊聊这个决策</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
