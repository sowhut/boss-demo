import { useEffect, useMemo, useState } from "react";

const STYLE = `
@keyframes memoryFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes memoryPulse {
  0%, 100% { opacity: .45; transform: scale(1); }
  50% { opacity: .9; transform: scale(1.04); }
}

@keyframes memoryBeam {
  0% { stroke-dashoffset: 0; opacity: .2; }
  50% { opacity: .9; }
  100% { stroke-dashoffset: -18; opacity: .25; }
}

.memory-float {
  animation: memoryFloat 5.4s ease-in-out infinite;
}

.memory-pulse {
  animation: memoryPulse 2.8s ease-in-out infinite;
}

.memory-beam {
  stroke-dasharray: 10 12;
  animation: memoryBeam 6s linear infinite;
}
`;

const PEOPLE = [
  {
    id: "zhang",
    name: "张总",
    avatar: "张",
    title: "销售负责人",
    relationship: "直属下级",
    aliases: ["张总", "销售老张", "北区负责人"],
    notes: "负责渠道与销售节奏，预算诉求多，推进速度快。",
    firstSeen: "2026-01-12 · 销售周会",
    confirmedAt: "2026-01-12",
    status: "focus",
    lastSignalAt: "2小时前",
    interactionCount: 12,
    summary: "承诺激进，交付容易打折，预算相关话题需要卡前提。",
    patternHeadline: "承诺兑现率低",
    patterns: [
      {
        label: "承诺兑现率低",
        confidence: "high",
        supportingCount: 5,
        description: "过去三次承诺里有两次延期，一次降低标准后交付。谈预算前更适合先看复盘，不适合只听新承诺。",
      },
      {
        label: "汇报口径会为结论服务",
        confidence: "medium",
        supportingCount: 3,
        description: "当核心指标不好看时，会优先替换成更有利的表述方式。涉及转化、活跃、渠道效率时要反查口径。",
      },
    ],
    commitments: [
      { title: "提交渠道评估报告", deadline: "2月28日", status: "overdue" },
      { title: "补交Q2推广方案修订版", deadline: "3月25日", status: "pending" },
    ],
    relatedMatters: [
      "Q2渠道预算审批",
      "北区线下拓客试点",
    ],
    signals: [
      {
        timestamp: "03/22 · 汇报",
        sceneType: "report",
        sourcePerspective: "evidence",
        contentType: "action",
        valence: "negative",
        confidence: "high",
        content: "把核心结果从“转化率”切换成“用户活跃度”。",
        evidence: "本次汇报第二部分使用活跃度，和上周持续跟踪的转化率口径不一致，且未解释更换原因。",
      },
      {
        timestamp: "03/20 · 对话",
        sceneType: "dialogue",
        sourcePerspective: "judgement",
        contentType: "stance",
        valence: "negative",
        confidence: "medium",
        content: "老板明确表达对他“先要预算、后补验证”的方式有戒心。",
        evidence: "对话里老板提到：‘他每次都先推预算，关键前提总想后补。’",
      },
      {
        timestamp: "03/14 · 销售会",
        sceneType: "meeting",
        sourcePerspective: "evidence",
        contentType: "action",
        valence: "neutral",
        confidence: "high",
        content: "承诺月底前补齐渠道评估报告。",
        evidence: "会议纪要里明确说由他负责在月底前交付评估报告，作为预算审批前置条件。",
      },
    ],
    network: { x: 76, y: 34, w: 246, accent: "#f199b9", halo: "#fde8ef" },
  },
  {
    id: "lin",
    name: "林时雨",
    avatar: "林",
    title: "运营同学",
    relationship: "下级",
    aliases: ["林时雨", "时雨", "运营林"],
    notes: "运营同学，偏谨慎，常把流程风险前置。",
    firstSeen: "2026-01-08 · 周例会",
    confirmedAt: "2026-01-08",
    status: "healthy",
    lastSignalAt: "昨天",
    interactionCount: 7,
    summary: "推进稳定，遇到风险会提前提醒，是运营线里最可靠的回路之一。",
    patternHeadline: "风险前置意识强",
    patterns: [
      {
        label: "风险前置意识强",
        confidence: "high",
        supportingCount: 4,
        description: "在排期、用户反馈和返工风险上总会先提边界条件，适合做预警型协同。",
      },
    ],
    commitments: [
      { title: "整理用户分层回收反馈", deadline: "3月26日", status: "pending" },
    ],
    relatedMatters: ["会员分层优化", "渠道转介绍流程"],
    signals: [
      {
        timestamp: "03/21 · 汇报",
        sceneType: "report",
        sourcePerspective: "evidence",
        contentType: "stance",
        valence: "positive",
        confidence: "high",
        content: "主动把反弹风险和返工成本写进汇报结尾。",
        evidence: "她在汇报里专门留了‘潜在返工点’，并给出需要产品支持的边界。",
      },
      {
        timestamp: "03/10 · 会议",
        sceneType: "meeting",
        sourcePerspective: "evidence",
        contentType: "relation",
        valence: "positive",
        confidence: "medium",
        content: "和产品、研发在排期上协调顺畅。",
        evidence: "周会中主动承接跨组动作，并把回收节点拆清楚。",
      },
    ],
    network: { x: 70, y: 12, w: 224, accent: "#7fcbbf", halo: "#e6f7f3" },
  },
  {
    id: "qi",
    name: "齐远",
    avatar: "齐",
    title: "研发搭档",
    relationship: "同事",
    aliases: ["齐远", "研发齐", "IM负责人"],
    notes: "负责IM消息流和通知链路，信息密度高。",
    firstSeen: "2026-01-18 · 项目对齐",
    confirmedAt: "2026-01-18",
    status: "healthy",
    lastSignalAt: "3天前",
    interactionCount: 6,
    summary: "技术判断稳，信息透明，但更愿意就事实说话，不会替业务兜结论。",
    patternHeadline: "事实导向",
    patterns: [
      {
        label: "事实导向",
        confidence: "medium",
        supportingCount: 3,
        description: "在模糊问题上倾向于先补日志、链路和约束，再表达态度。适合让他做技术真相校对。",
      },
    ],
    commitments: [],
    relatedMatters: ["消息通知重构", "客服回路监控"],
    signals: [
      {
        timestamp: "03/19 · 对话",
        sceneType: "dialogue",
        sourcePerspective: "judgement",
        contentType: "stance",
        valence: "positive",
        confidence: "medium",
        content: "老板判断他的话可作为技术底线参考。",
        evidence: "老板说：‘涉及消息链路的事，齐远的话我基本信。’",
      },
    ],
    network: { x: 88, y: 42, w: 208, accent: "#b99af5", halo: "#f1ebff" },
  },
  {
    id: "jiang",
    name: "江岚",
    avatar: "江",
    title: "市场 VP",
    relationship: "上级",
    aliases: ["江总", "江岚", "市场VP"],
    notes: "关注品牌外溢和渠道节奏，对市场投入的审美要求高。",
    firstSeen: "2026-01-05 · 品牌周会",
    confirmedAt: "2026-01-05",
    status: "steady",
    lastSignalAt: "5天前",
    interactionCount: 9,
    summary: "更看长期品牌势能，不喜欢为了短期数字牺牲节奏。",
    patternHeadline: "重节奏，不爱抢跑",
    patterns: [
      {
        label: "重节奏，不爱抢跑",
        confidence: "medium",
        supportingCount: 4,
        description: "对‘快速冲量’类方案天然谨慎，更容易被阶段规划、品牌一致性和节奏控制说服。",
      },
    ],
    commitments: [],
    relatedMatters: ["年度品牌节奏", "Q2渠道预算审批"],
    signals: [
      {
        timestamp: "03/18 · 会议",
        sceneType: "meeting",
        sourcePerspective: "evidence",
        contentType: "stance",
        valence: "neutral",
        confidence: "high",
        content: "对线下扩张速度保持保留。",
        evidence: "会上明确说‘如果节奏被打乱，渠道效率数字再好看也不值。’",
      },
    ],
    network: { x: 73, y: 58, w: 236, accent: "#8fd39a", halo: "#ecfaee" },
  },
  {
    id: "bai",
    name: "白芷",
    avatar: "白",
    title: "合作伙伴",
    relationship: "合作伙伴",
    aliases: ["白芷", "Workshop白芷"],
    notes: "培训合作者，擅长共创 workshop。",
    firstSeen: "2026-02-03 · 共创活动",
    confirmedAt: "2026-02-03",
    status: "steady",
    lastSignalAt: "一周前",
    interactionCount: 4,
    summary: "适合共同策划，不适合承担需要刚性推进的执行责任。",
    patternHeadline: "适合共创，不适合强推进",
    patterns: [
      {
        label: "适合共创，不适合强推进",
        confidence: "low",
        supportingCount: 2,
        description: "在开放式工作坊里表现好，但对长期推进型项目没有稳定证据。",
      },
    ],
    commitments: [],
    relatedMatters: ["品牌工作坊", "合作伙伴池"],
    signals: [
      {
        timestamp: "03/12 · 文章",
        sceneType: "article",
        sourcePerspective: "evidence",
        contentType: "relation",
        valence: "positive",
        confidence: "low",
        content: "主动转发活动总结并补充观点。",
        evidence: "活动结束后一周内持续互动，对后续 workshop 方向有参与意愿。",
      },
    ],
    network: { x: 32, y: 12, w: 220, accent: "#b48cf2", halo: "#f2ebff" },
  },
  {
    id: "li",
    name: "李四",
    avatar: "李",
    title: "业务负责人",
    relationship: "上级",
    aliases: ["李四", "李总"],
    notes: "判断简短，边界感强。",
    firstSeen: "2026-01-10 · 战略会",
    confirmedAt: "2026-01-10",
    status: "healthy",
    lastSignalAt: "4天前",
    interactionCount: 5,
    summary: "不轻易表态，但一旦点头通常意味着资源会跟上。",
    patternHeadline: "慢表态，重兑现",
    patterns: [
      {
        label: "慢表态，重兑现",
        confidence: "medium",
        supportingCount: 3,
        description: "前期沉默不代表反对，更像在等关键前提补齐。适合给他简洁、证据密的更新。",
      },
    ],
    commitments: [],
    relatedMatters: ["新业务投入", "季度资源协调"],
    signals: [
      {
        timestamp: "03/17 · 会议",
        sceneType: "meeting",
        sourcePerspective: "evidence",
        contentType: "stance",
        valence: "neutral",
        confidence: "high",
        content: "对扩张方案没有正面表态，但追问了人力承接。",
        evidence: "他只问了‘现有团队真能接吗’，没有顺着讲增长故事。",
      },
    ],
    network: { x: 48, y: 18, w: 208, accent: "#8ecb92", halo: "#ebf8ec" },
  },
  {
    id: "tang",
    name: "唐序",
    avatar: "唐",
    title: "行业观察者",
    relationship: "外部顾问",
    aliases: ["唐序", "唐老师"],
    notes: "提供行业对照和趋势判断。",
    firstSeen: "2026-02-09 · 外部对谈",
    confirmedAt: "2026-02-09",
    status: "steady",
    lastSignalAt: "两周前",
    interactionCount: 3,
    summary: "适合做趋势对照，不适合承接内部执行判断。",
    patternHeadline: "适合校准，不适合代决策",
    patterns: [
      {
        label: "适合校准，不适合代决策",
        confidence: "low",
        supportingCount: 2,
        description: "给出的行业参照有价值，但落到内部动作时需要二次翻译。",
      },
    ],
    commitments: [],
    relatedMatters: ["消费趋势判断"],
    signals: [
      {
        timestamp: "03/08 · 对话",
        sceneType: "dialogue",
        sourcePerspective: "judgement",
        contentType: "relation",
        valence: "positive",
        confidence: "low",
        content: "老板认为他适合做参照系，不适合当结论来源。",
        evidence: "对话中提到：‘跟他聊能知道外面怎么变，但最后还是得落回我们自己的盘子。’",
      },
    ],
    network: { x: 10, y: 44, w: 218, accent: "#8ec58d", halo: "#edf9eb" },
  },
  {
    id: "jiangwen",
    name: "蒋迟",
    avatar: "蒋",
    title: "外部顾问",
    relationship: "合作伙伴",
    aliases: ["蒋迟", "蒋老师"],
    notes: "擅长组织复杂访谈，帮助梳理外部线索。",
    firstSeen: "2026-02-22 · 顾问会",
    confirmedAt: "2026-02-22",
    status: "steady",
    lastSignalAt: "5天前",
    interactionCount: 4,
    summary: "在复杂信息梳理上可靠，但更适合辅助判断而不是替你拍板。",
    patternHeadline: "复杂线索梳理能力强",
    patterns: [
      {
        label: "复杂线索梳理能力强",
        confidence: "medium",
        supportingCount: 3,
        description: "面对杂乱外部信息时能快速归类成可讨论的问题，但最终优先级仍需要内部业务判断。",
      },
    ],
    commitments: [],
    relatedMatters: ["外部访谈整理"],
    signals: [
      {
        timestamp: "03/18 · 对话",
        sceneType: "dialogue",
        sourcePerspective: "judgement",
        contentType: "relation",
        valence: "positive",
        confidence: "medium",
        content: "老板认为他适合做复杂访谈的第一轮整理。",
        evidence: "对话记录里提到‘蒋迟整理脉络很快，适合先帮我把线索收住。’",
      },
    ],
    network: { x: 24, y: 28, w: 208, accent: "#9aa8f2", halo: "#eef1ff" },
  },
  {
    id: "zhaolin",
    name: "赵临",
    avatar: "赵",
    title: "重点客户",
    relationship: "客户",
    aliases: ["赵临", "北区大客户"],
    notes: "看重投入产出比，对试点方案容忍度低。",
    firstSeen: "2026-01-29 · 客户拜访",
    confirmedAt: "2026-01-29",
    status: "focus",
    lastSignalAt: "昨天",
    interactionCount: 5,
    summary: "对 ROI 极敏感，适合先拿结果再谈长期合作叙事。",
    patternHeadline: "结果先于故事",
    patterns: [
      {
        label: "结果先于故事",
        confidence: "medium",
        supportingCount: 3,
        description: "只要没有明确ROI或阶段性结果，任何宏大叙事都很难说服他。",
      },
    ],
    commitments: [],
    relatedMatters: ["北区试点", "渠道合作回款"],
    signals: [
      {
        timestamp: "03/22 · 对话",
        sceneType: "dialogue",
        sourcePerspective: "evidence",
        contentType: "stance",
        valence: "negative",
        confidence: "medium",
        content: "再次追问试点ROI，没有顺着长期合作愿景往下聊。",
        evidence: "客户在会中反复确认投入产出测算，对抽象品牌收益没有兴趣。",
      },
    ],
    network: { x: 22, y: 60, w: 204, accent: "#89bdf2", halo: "#edf5ff" },
  },
  {
    id: "shen",
    name: "沈卓",
    avatar: "沈",
    title: "客户接口人",
    relationship: "客户",
    aliases: ["沈卓", "沈经理"],
    notes: "最近两周频繁出现，态度在升温。",
    firstSeen: "2026-03-01 · 客户回访",
    confirmedAt: "2026-03-01",
    status: "healthy",
    lastSignalAt: "2天前",
    interactionCount: 4,
    summary: "愿意给窗口，但还处在试探期，需要持续稳定的反馈节奏。",
    patternHeadline: "窗口正在打开",
    patterns: [
      {
        label: "窗口正在打开",
        confidence: "low",
        supportingCount: 2,
        description: "最近两周互动频率上升，但还没有足够证据证明关系已稳定。",
      },
    ],
    commitments: [],
    relatedMatters: ["客户试点推进"],
    signals: [
      {
        timestamp: "03/21 · 对话",
        sceneType: "dialogue",
        sourcePerspective: "evidence",
        contentType: "relation",
        valence: "positive",
        confidence: "low",
        content: "连续两次主动约时间跟进试点。",
        evidence: "近两周由他主动发起的沟通明显增多，但还没进入实质合作阶段。",
      },
    ],
    network: { x: 30, y: 72, w: 210, accent: "#c4a5f7", halo: "#f6efff" },
  },
  {
    id: "wen",
    name: "温棋",
    avatar: "温",
    title: "产品负责人",
    relationship: "同事",
    aliases: ["温棋", "产品温"],
    notes: "会从产品边界出发问问题，是需求可行性的过滤器。",
    firstSeen: "2026-01-14 · 产品评审",
    confirmedAt: "2026-01-14",
    status: "healthy",
    lastSignalAt: "前天",
    interactionCount: 8,
    summary: "擅长用边界问题倒逼方案更清晰，是讨论复杂事项时的好搭档。",
    patternHeadline: "边界感强",
    patterns: [
      {
        label: "边界感强",
        confidence: "high",
        supportingCount: 4,
        description: "总能在热闹叙事里追问边界、约束和产品代价，适合做需求澄清。",
      },
    ],
    commitments: [
      { title: "梳理会员功能边界", deadline: "3月28日", status: "pending" },
    ],
    relatedMatters: ["会员分层优化", "Q2渠道预算审批"],
    signals: [
      {
        timestamp: "03/21 · 会议",
        sceneType: "meeting",
        sourcePerspective: "evidence",
        contentType: "stance",
        valence: "positive",
        confidence: "high",
        content: "主动追问版本边界和资源代价。",
        evidence: "会上首先问‘这个版本边界到底落在哪’，把需求收得更清楚。",
      },
    ],
    network: { x: 48, y: 72, w: 230, accent: "#93cf8d", halo: "#eef9ec" },
  },
  {
    id: "qiao",
    name: "乔旻",
    avatar: "乔",
    title: "办公室同学",
    relationship: "上级",
    aliases: ["乔旻", "乔总"],
    notes: "关注落地节奏和风险前置，是组织内的节奏守门人。",
    firstSeen: "2026-01-06 · 管理例会",
    confirmedAt: "2026-01-06",
    status: "steady",
    lastSignalAt: "6天前",
    interactionCount: 7,
    summary: "对节奏和风险敏感，适合用阶段性判断去同步，不适合给模糊故事。",
    patternHeadline: "风险前置型管理者",
    patterns: [
      {
        label: "风险前置型管理者",
        confidence: "medium",
        supportingCount: 3,
        description: "会优先关心着陆节奏、资源冲突和风险节点，喜欢看阶段性判断，不喜欢空泛进展。",
      },
    ],
    commitments: [],
    relatedMatters: ["季度重点排期", "Q2渠道预算审批"],
    signals: [
      {
        timestamp: "03/16 · 会议",
        sceneType: "meeting",
        sourcePerspective: "evidence",
        contentType: "stance",
        valence: "neutral",
        confidence: "medium",
        content: "提醒先把风险前置条件说透，再谈推进速度。",
        evidence: "对会上‘先抢进度后补细节’的提法明显不满意。",
      },
    ],
    network: { x: 70, y: 74, w: 222, accent: "#b58cf0", halo: "#f2ebff" },
  },
];

const ASSUMPTIONS = [
  {
    assumption_id: "asmp-001",
    content: "现有渠道可以复用到新业务",
    origin_context: "3月1日Q1战略会，批准新业务投入时默认沿用原来的渠道打法。",
    status: "active",
    created_at: "2026-03-01T10:00:00Z",
    source_scene_id: "C-20260301-001",
    related_people: ["zhang", "jiang"],
    inferred: false,
    evidence_chain: [
      {
        timestamp: "2026-03-15T14:00:00Z",
        scene_type: "report",
        scene_id: "R-20260315-002",
        source_call: "R01-b",
        summary: "张总汇报里渠道转化率只有 12%，新老客群重合度明显低于预期。",
      },
      {
        timestamp: "2026-03-20T09:00:00Z",
        scene_type: "article",
        scene_id: "A-20260320-001",
        source_call: "A01",
        summary: "行业报告提到同类渠道获客成本同比上涨 40%，复用效率正在变差。",
      },
      {
        timestamp: "2026-03-22T09:20:00Z",
        scene_type: "report",
        scene_id: "R-20260322-001",
        source_call: "R01-b",
        summary: "这次汇报把核心结果从转化率换成活跃度，侧面说明原渠道复用效果并不稳。",
      },
    ],
  },
  {
    assumption_id: "asmp-002",
    content: "现有团队能承接线下拓客带来的执行压力",
    origin_context: "3月12日渠道预算讨论里，默认认为不用新增人手也能接住线下拓客节奏。",
    status: "active",
    created_at: "2026-03-12T16:30:00Z",
    source_scene_id: "C-20260312-002",
    related_people: ["qiao", "wen", "zhang"],
    inferred: true,
    evidence_chain: [
      {
        timestamp: "2026-03-16T11:00:00Z",
        scene_type: "meeting",
        scene_id: "C-20260316-001",
        source_call: "C05",
        summary: "乔旻在管理例会上追问现有团队是否真能接住新增执行量。",
      },
      {
        timestamp: "2026-03-21T15:10:00Z",
        scene_type: "meeting",
        scene_id: "C-20260321-003",
        source_call: "C05",
        summary: "温棋继续追问版本边界和资源代价，说明团队承接能力还没有被说透。",
      },
      {
        timestamp: "2026-03-22T09:20:00Z",
        scene_type: "report",
        scene_id: "R-20260322-001",
        source_call: "R01-b",
        summary: "张总的新汇报没有补充新增人力安排，只写了现有团队可覆盖。",
      },
    ],
  },
  {
    assumption_id: "asmp-003",
    content: "运营侧能稳定承接会员分层后的回收动作",
    origin_context: "3月8日产品评审会上决定先推进会员分层时，默认运营能持续吃下回收和反馈闭环。",
    status: "confirmed",
    created_at: "2026-03-08T11:20:00Z",
    source_scene_id: "C-20260308-001",
    related_people: ["lin", "wen"],
    inferred: false,
    evidence_chain: [
      {
        timestamp: "2026-03-08T11:20:00Z",
        scene_type: "meeting",
        scene_id: "C-20260308-001",
        source_call: "C05",
        summary: "林时雨在会上主动给出回收节点和返工风险，说明运营准备度较高。",
      },
      {
        timestamp: "2026-03-14T14:30:00Z",
        scene_type: "meeting",
        scene_id: "C-20260314-002",
        source_call: "C05",
        summary: "二次讨论里她继续补充用户回收安排，没有出现执行侧退缩。",
      },
      {
        timestamp: "2026-03-21T10:05:00Z",
        scene_type: "report",
        scene_id: "R-20260321-001",
        source_call: "R01-b",
        summary: "最新汇报把返工风险和需要产品配合的边界讲清楚，运营承接路径保持稳定。",
      },
    ],
  },
  {
    assumption_id: "asmp-004",
    content: "高端线仍适合按原来的投放节奏推进",
    origin_context: "2月下旬高端线预算会里，默认认为市场节奏没有变，仍可按原计划投放。",
    status: "disproved",
    created_at: "2026-02-25T18:00:00Z",
    source_scene_id: "C-20260225-004",
    related_people: ["jiang", "tang"],
    inferred: false,
    evidence_chain: [
      {
        timestamp: "2026-03-18T08:40:00Z",
        scene_type: "article",
        scene_id: "A-20260318-001",
        source_call: "A01",
        summary: "文章提炼指出高端线客群消费意愿转弱，原投放节奏的效率假设被挑战。",
      },
      {
        timestamp: "2026-03-18T18:10:00Z",
        scene_type: "meeting",
        scene_id: "C-20260318-002",
        source_call: "C05",
        summary: "江岚在会上明确提醒，如果节奏被打乱，短期数字再好看也不值。",
      },
      {
        timestamp: "2026-03-22T20:30:00Z",
        scene_type: "dialogue",
        scene_id: "D-20260322-004",
        source_call: "D06",
        summary: "老板在对话里直接说高端线这套投放节奏已经不成立，要重新估。",
      },
    ],
  },
  {
    assumption_id: "asmp-005",
    content: "北区重点客户愿意接受先试点、后补 ROI 的推进方式",
    origin_context: "1月下旬客户推进会上，默认认为客户愿意先给窗口，再慢慢补充 ROI 证明。",
    status: "expired",
    created_at: "2026-01-29T09:30:00Z",
    source_scene_id: "C-20260129-001",
    related_people: ["zhaolin", "shen"],
    inferred: true,
    evidence_chain: [
      {
        timestamp: "2026-02-02T15:00:00Z",
        scene_type: "dialogue",
        scene_id: "D-20260202-002",
        source_call: "D06",
        summary: "赵临当时表示可以先看试点，但仍反复强调后续必须补 ROI。",
      },
      {
        timestamp: "2026-03-21T10:00:00Z",
        scene_type: "dialogue",
        scene_id: "D-20260321-003",
        source_call: "D06",
        summary: "最近沟通已经转向新的客户接口人，原来的推进方式不再是当前重点。",
      },
    ],
  },
];

const STATUS_STYLES = {
  focus: {
    label: "需要关注",
    chip: "bg-[#fff2e8] text-[#b55f33] border-[#f4d2bf]",
    dot: "#d4845a",
  },
  steady: {
    label: "稳定协作",
    chip: "bg-[#f4f6f7] text-[#66727d] border-[#d9dee4]",
    dot: "#94a0ab",
  },
  healthy: {
    label: "状态健康",
    chip: "bg-[#edf8f1] text-[#4d8b61] border-[#cfe8d8]",
    dot: "#6daf7f",
  },
};

const CONFIDENCE_STYLES = {
  high: { label: "高置信", chip: "bg-[#eef5ff] text-[#5076b5] border-[#cad9f0]" },
  medium: { label: "中置信", chip: "bg-[#f8f1e7] text-[#9b7a2c] border-[#ecd8ac]" },
  low: { label: "低置信", chip: "bg-[#f4f4f4] text-[#7f8790] border-[#d9dee4]" },
};

const ASSUMPTION_STYLES = {
  active: { label: "追踪中", chip: "bg-[#eef5ff] text-[#5076b5] border-[#cad9f0]", dot: "#6f98e5" },
  confirmed: { label: "已确认", chip: "bg-[#edf8f1] text-[#4d8b61] border-[#cfe8d8]", dot: "#6daf7f" },
  disproved: { label: "已证伪", chip: "bg-[#fff0ef] text-[#c2645f] border-[#f0d2d0]", dot: "#d47a72" },
  expired: { label: "已过期", chip: "bg-[#f4f4f4] text-[#7f8790] border-[#d9dee4]", dot: "#9da6b0" },
};

const PERSPECTIVE_LABELS = {
  evidence: "直接观察",
  judgement: "老板判断",
};

const CONTENT_TYPE_LABELS = {
  action: "动作",
  stance: "立场",
  relation: "关系",
};

const SECTION_ITEMS = [
  { key: "people", label: "人脉", description: "AI 合伙人替你经营的人脉判断" },
  { key: "matters", label: "事项", description: "AI 合伙人持续追踪的前提假设" },
];

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function useViewportSize() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1440 : window.innerWidth,
    height: typeof window === "undefined" ? 960 : window.innerHeight,
  }));

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}

function getStageScale({ viewportWidth, viewportHeight, baseWidth, baseHeight, widthOffset, heightOffset, minScale }) {
  const widthScale = (viewportWidth - widthOffset) / baseWidth;
  const heightScale = (viewportHeight - heightOffset) / baseHeight;
  return Math.max(minScale, Math.min(1, widthScale, heightScale));
}

function AppMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 shadow-[0_12px_30px_rgba(28,40,54,0.08)]">
        <div className="absolute inset-0 rounded-xl border border-white/70" />
        <div className="grid grid-cols-2 gap-[3px]">
          <span className="h-[5px] w-[5px] rounded-sm bg-[#1f1f22]" />
          <span className="h-[5px] w-[5px] rounded-sm bg-[#8899aa]" />
          <span className="h-[5px] w-[5px] rounded-sm bg-[#e5c4aa]" />
          <span className="h-[5px] w-[5px] rounded-sm bg-[#6eb88e]" />
        </div>
      </div>
      <div>
        <div className="text-[17px] font-semibold tracking-tight text-slate-900">Hundun Claw</div>
      </div>
    </div>
  );
}

function SidebarIcon({ active, children }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
        active
          ? "border-[#ecd8c8] bg-white text-slate-900 shadow-[0_14px_30px_rgba(30,41,59,0.08)]"
          : "border-transparent bg-transparent text-slate-400"
      )}
    >
      {children}
    </div>
  );
}

function ChatGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.8 17.2 3.8 20v-4A7.2 7.2 0 0 1 4 5.8C5.5 4.4 7.6 3.7 10 3.7h4c2.4 0 4.5.7 6 2.1a7.2 7.2 0 0 1 .2 10.2c-1.5 1.4-3.6 2.1-6 2.1H6.8Z" />
    </svg>
  );
}

function PersonGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.2 12.1a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
      <path d="M15.9 10.3a3 3 0 1 0 0-5.9" />
      <path d="M3.8 18.8c.6-3 3-4.8 5.4-4.8s4.7 1.8 5.3 4.8" />
      <path d="M15.1 14.3c1.9.1 3.7 1.2 4.6 3.2" />
    </svg>
  );
}

function MatterGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4.5h10.5a1.8 1.8 0 0 1 1.8 1.8v11.4a1.8 1.8 0 0 1-1.8 1.8H7.7a1.8 1.8 0 0 1-1.7-1.8V6.3A1.8 1.8 0 0 1 7.7 4.5Z" />
      <path d="M9 8.3h7" />
      <path d="M9 12h7" />
      <path d="M9 15.7h4.7" />
    </svg>
  );
}

function SettingsGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
      <path d="m19.2 13.5.8-1.5-.8-1.5-1.9-.2a5.9 5.9 0 0 0-.7-1.6l1.2-1.5-.6-1.7-1.9-.3-1.2 1.2c-.5-.1-1.1-.2-1.7-.2l-.9-1.7h-1.8l-.9 1.7c-.6 0-1.1.1-1.7.2L6.1 5.2l-1.9.3-.6 1.7 1.2 1.5c-.3.5-.5 1-.7 1.6l-1.9.2L1.4 12l.8 1.5 1.9.2c.1.6.4 1.1.7 1.6l-1.2 1.5.6 1.7 1.9.3 1.2-1.2c.5.1 1.1.2 1.7.2l.9 1.7h1.8l.9-1.7c.6 0 1.1-.1 1.7-.2l1.2 1.2 1.9-.3.6-1.7-1.2-1.5c.3-.5.5-1 .7-1.6l1.9-.2Z" />
    </svg>
  );
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.4 14.8A7.8 7.8 0 0 1 9.2 5.6a8.3 8.3 0 1 0 9.2 9.2Z" />
    </svg>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/82 p-4 shadow-[0_16px_34px_rgba(31,41,55,0.05)] backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-[13px] leading-6 text-slate-500">{helper}</div>
    </div>
  );
}

function SectionChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all",
        active
          ? "border-[#ead5c3] bg-[#fff6ef] text-[#a4683f]"
          : "border-[#e8e4de] bg-white text-slate-500 hover:bg-[#faf7f3]"
      )}
    >
      {children}
    </button>
  );
}

function PersonNodeCard({ person, active, onClick }) {
  const style = STATUS_STYLES[person.status];
  return (
    <button
      onClick={onClick}
      className={cn(
        "memory-float absolute rounded-[28px] border bg-white/84 p-5 text-left backdrop-blur-sm transition-all",
        active
          ? "border-[#d7c5b7] shadow-[0_22px_48px_rgba(43,57,71,0.12)]"
          : "border-white/80 shadow-[0_18px_44px_rgba(43,57,71,0.08)] hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(43,57,71,0.1)]"
      )}
      style={{
        left:`${person.network.x}%`,
        top:`${person.network.y}%`,
        width:Math.min(person.network.w, 220),
        transform:"translate(-50%, -50%)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base font-semibold"
          style={{ background:person.network.halo, color:person.network.accent }}
        >
          {person.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[18px] font-semibold tracking-tight text-slate-900">{person.name}</div>
              <div className="text-[13px] text-slate-400">{person.relationship}</div>
            </div>
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px]", style.chip)}>{style.label}</span>
          </div>
          <p className="mt-2.5 line-clamp-2 text-[13px] leading-5 text-slate-500">{person.summary}</p>
          <div className="mt-3 text-[13px] font-medium" style={{ color:person.network.accent }}>{person.patternHeadline}</div>
        </div>
      </div>
    </button>
  );
}

function MemoryNetwork({ people, onSelectPerson }) {
  const viewport = useViewportSize();
  const stats = useMemo(() => {
    const focusCount = people.filter((item) => item.status === "focus").length;
    const patternCount = people.reduce((count, item) => count + item.patterns.length, 0);
    return {
      total: people.length,
      focus: focusCount,
      signals: people.reduce((count, item) => count + item.signals.length, 0),
      patterns: patternCount,
    };
  }, [people]);
  const stageWidth = 1060;
  const stageHeight = 620;
  const stageScale = getStageScale({
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    baseWidth: stageWidth,
    baseHeight: stageHeight,
    widthOffset: 420,
    heightOffset: 300,
    minScale: 0.7,
  });

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-[#ebe4db] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#fbf8f3_38%,#f6f1e9_100%)] px-6 py-6 shadow-[0_32px_80px_rgba(31,41,55,0.08)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[16%] top-[18%] h-40 w-40 rounded-full bg-[#f2ebe3] blur-3xl" />
        <div className="absolute right-[12%] top-[20%] h-44 w-44 rounded-full bg-[#eff4f2] blur-3xl" />
        <div className="absolute bottom-[14%] left-[42%] h-36 w-36 rounded-full bg-[#f2ebff] blur-3xl" />
      </div>

      <div className="relative overflow-hidden rounded-[28px]" style={{ height: `${stageHeight * stageScale}px` }}>
        <div
          className="absolute left-1/2 top-0"
          style={{
            width: stageWidth,
            height: stageHeight,
            transform: `translateX(-50%) scale(${stageScale})`,
            transformOrigin: "top center",
          }}
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {people.map((person) => {
              const dx = person.network.x - 50;
              const dy = person.network.y - 50;
              const controlX = 50 + dx * 0.45;
              const controlY = 50 + dy * 0.08;
              return (
                <path
                  key={person.id}
                  className="memory-beam"
                  d={`M 50 50 Q ${controlX} ${controlY} ${person.network.x} ${person.network.y}`}
                  fill="none"
                  stroke={person.network.accent}
                  strokeWidth="0.24"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          <div
            className="absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-[#d9e4f3] bg-white/86 px-6 py-6 text-center shadow-[0_24px_64px_rgba(76,100,147,0.16)] backdrop-blur-md"
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">AI People Memory</div>
            <div className="mt-2.5 text-[34px] font-semibold tracking-tight text-slate-950">人脉</div>
            <div className="mt-2 text-[13px] leading-6 text-slate-500">AI 合伙人替你把会议、汇报、对话里的零散信号，持续整理成可行动的人脉判断。</div>
            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {[
                { label:"总人数", value:stats.total },
                { label:"需关注", value:stats.focus },
                { label:"信号数", value:stats.signals },
                { label:"模式数", value:stats.patterns },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[24px] font-semibold tracking-tight text-slate-900">{item.value}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {people.map((person) => (
            <PersonNodeCard key={person.id} person={person} onClick={() => onSelectPerson(person.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PeopleListCard({ person, onSelect }) {
  const style = STATUS_STYLES[person.status];
  return (
    <button
      onClick={() => onSelect(person.id)}
      className="w-full rounded-[24px] border border-[#ebe4db] bg-white/88 p-4 text-left shadow-[0_14px_34px_rgba(31,41,55,0.06)] transition-all hover:-translate-y-[1px] hover:shadow-[0_18px_40px_rgba(31,41,55,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold"
          style={{ background:person.network.halo, color:person.network.accent }}
        >
          {person.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[19px] font-semibold tracking-tight text-slate-900">{person.name}</div>
            <div className="text-[13px] text-slate-400">{person.relationship} · {person.title}</div>
            <span className={cn("rounded-full border px-2.5 py-1 text-[11px]", style.chip)}>{style.label}</span>
          </div>
          <div className="mt-2.5 text-[13px] leading-6 text-slate-500">{person.summary}</div>
          <div className="mt-3 grid gap-3 text-sm text-slate-500 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="rounded-2xl bg-[#faf7f3] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">AI 模式</div>
              <div className="mt-1 font-medium text-slate-700">{person.patternHeadline}</div>
            </div>
            <div className="rounded-2xl bg-[#faf7f3] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">最近信号</div>
              <div className="mt-1 font-medium text-slate-700">{person.lastSignalAt}</div>
            </div>
            <div className="rounded-2xl bg-[#faf7f3] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">互动次数</div>
              <div className="mt-1 font-medium text-slate-700">{person.interactionCount} 次</div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function PeopleList({ people, activeFilter, onFilterChange, onSelect }) {
  const filtered = useMemo(() => {
    if (activeFilter === "all") return people;
    if (activeFilter === "focus") return people.filter((item) => item.status === "focus");
    if (activeFilter === "recent") return people.filter((item) => item.lastSignalAt.includes("小时") || item.lastSignalAt.includes("昨天") || item.lastSignalAt.includes("前天"));
    return people;
  }, [activeFilter, people]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          { key:"all", label:"全部" },
          { key:"focus", label:"需要关注" },
          { key:"recent", label:"最近活跃" },
        ].map((item) => (
          <SectionChip key={item.key} active={activeFilter === item.key} onClick={() => onFilterChange(item.key)}>
            {item.label}
          </SectionChip>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((person) => (
          <PeopleListCard key={person.id} person={person} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function PersonDetail({ personId, onBack }) {
  const person = PEOPLE.find((item) => item.id === personId);
  if (!person) return null;

  const primaryPattern = person.patterns[0];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="rounded-full border border-[#e8e4de] bg-white px-4 py-2 text-sm text-slate-500 transition hover:bg-[#faf7f3]"
      >
        返回人脉总览
      </button>

      <div className="grid gap-5 min-[1540px]:grid-cols-[1.3fr_0.86fr]">
        <div className="rounded-[30px] border border-[#ebe4db] bg-white/86 p-6 shadow-[0_24px_58px_rgba(31,41,55,0.08)]">
          <div className="flex flex-wrap items-start gap-5">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[24px] text-[28px] font-semibold"
              style={{ background:person.network.halo, color:person.network.accent }}
            >
              {person.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[32px] font-semibold tracking-tight text-slate-950">{person.name}</h2>
                <span className={cn("rounded-full border px-3 py-1 text-xs", STATUS_STYLES[person.status].chip)}>{STATUS_STYLES[person.status].label}</span>
              </div>
              <div className="mt-1.5 text-[15px] text-slate-500">{person.relationship} · {person.title}</div>
              <div className="mt-4 max-w-3xl text-[14px] leading-7 text-slate-600">{person.summary}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <MetricCard label="首次出现" value={person.firstSeen.split(" · ")[0]} helper={person.firstSeen.split(" · ")[1]} />
            <MetricCard label="互动次数" value={`${person.interactionCount}`} helper="已确认场景累计交互" />
            <MetricCard label="最近信号" value={person.lastSignalAt} helper="最近一次进入记忆系统" />
            <MetricCard label="关联事项" value={`${person.relatedMatters.length}`} helper="正在牵连的事项判断" />
          </div>
        </div>

        <div className="rounded-[30px] border border-[#ebe4db] bg-[linear-gradient(180deg,#fffdf9_0%,#faf7f2_100%)] p-6 shadow-[0_20px_52px_rgba(31,41,55,0.06)]">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">AI 合伙人判断</div>
          <div className="mt-2.5 text-[24px] font-semibold tracking-tight text-slate-950">{primaryPattern.label}</div>
          <p className="mt-3 text-[14px] leading-7 text-slate-600">{primaryPattern.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn("rounded-full border px-3 py-1 text-xs", CONFIDENCE_STYLES[primaryPattern.confidence].chip)}>
              {CONFIDENCE_STYLES[primaryPattern.confidence].label}
            </span>
            <span className="rounded-full border border-[#e8e4de] bg-white px-3 py-1 text-xs text-slate-500">
              {primaryPattern.supportingCount} 条支持信号
            </span>
          </div>
          <div className="mt-6 rounded-[24px] border border-[#ebe4db] bg-white p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">这个人是谁</div>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">别名</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {person.aliases.map((alias) => (
                    <span key={alias} className="rounded-full bg-[#faf7f3] px-3 py-1 text-sm text-slate-600">{alias}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">备注</div>
                <div className="mt-2 leading-6">{person.notes}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">确认时间</div>
                <div className="mt-2">{person.confirmedAt}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 min-[1540px]:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#ebe4db] bg-white/88 p-5 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">AI 判断</div>
                <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">AI 怎么看他</div>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {person.patterns.map((pattern) => (
                <div key={pattern.label} className="rounded-[22px] border border-[#ebe4db] bg-[#fcfaf6] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-[17px] font-semibold tracking-tight text-slate-900">{pattern.label}</div>
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs", CONFIDENCE_STYLES[pattern.confidence].chip)}>
                      {CONFIDENCE_STYLES[pattern.confidence].label}
                    </span>
                    <span className="rounded-full border border-[#e8e4de] bg-white px-2.5 py-1 text-xs text-slate-500">
                      {pattern.supportingCount} 条支持信号
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-7 text-slate-600">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#ebe4db] bg-white/88 p-5 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">时间线</div>
            <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">最近发生了什么</div>
            <div className="mt-5 space-y-0">
              {person.signals.map((signal, index) => (
                <div key={`${signal.timestamp}-${index}`} className="relative flex gap-4 pb-6 pl-1 last:pb-0">
                  <div className="relative flex w-7 shrink-0 justify-center">
                    <div className="absolute top-0 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm" style={{ background:person.network.accent }} />
                    {index < person.signals.length - 1 && <div className="absolute top-4 bottom-0 w-px bg-[#e8e1d8]" />}
                  </div>
                  <div className="min-w-0 flex-1 rounded-[20px] border border-[#ebe4db] bg-[#fffdf9] px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{signal.timestamp}</span>
                      <span className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[11px] text-slate-500">{PERSPECTIVE_LABELS[signal.sourcePerspective]}</span>
                      <span className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[11px] text-slate-500">{CONTENT_TYPE_LABELS[signal.contentType]}</span>
                      <span className={cn("rounded-full border px-2.5 py-1 text-[11px]", CONFIDENCE_STYLES[signal.confidence].chip)}>
                        {CONFIDENCE_STYLES[signal.confidence].label}
                      </span>
                    </div>
                    <div className="mt-3 text-[17px] font-medium tracking-tight text-slate-900">{signal.content}</div>
                    <p className="mt-2 text-[14px] leading-7 text-slate-600">{signal.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#ebe4db] bg-white/88 p-5 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">关联事项</div>
            <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">这个人牵连到哪些判断</div>
            <div className="mt-5 space-y-3">
              {person.relatedMatters.map((matter) => (
                <div key={matter} className="rounded-[22px] border border-[#ebe4db] bg-[#fffdf9] p-4">
                  <div className="text-[16px] font-medium text-slate-900">{matter}</div>
                  <div className="mt-2 text-[14px] leading-6 text-slate-500">AI 合伙人会把这个人的行为模式带入事项判断，决定你应该追问、卡住，还是继续推进。</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#ebe4db] bg-[linear-gradient(180deg,#fffdf8_0%,#faf5ee_100%)] p-5 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">下一步</div>
            <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">AI 合伙人会继续替你盯着他</div>
            <div className="mt-3 text-[14px] leading-7 text-slate-600">MVP 阶段先展示，不直接触发动作。正式版里，这里会接到“帮我准备怎么和他谈”“聊聊这个人”等行动入口。</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-[#c8956c] px-5 py-2.5 text-sm font-medium text-white">帮我准备怎么和他谈</button>
              <button className="rounded-full border border-[#e8e4de] bg-white px-5 py-2.5 text-sm text-slate-500">聊聊这个人</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimestampValue(timestamp) {
  return Date.parse(timestamp) || 0;
}

function formatDateTime(timestamp) {
  const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return timestamp;
  return `${match[2]}/${match[3]} ${match[4]}:${match[5]}`;
}

function formatDate(timestamp) {
  const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return timestamp;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function getSceneTypeLabel(sceneType) {
  if (sceneType === "meeting") return "会议";
  if (sceneType === "report") return "汇报";
  if (sceneType === "article") return "文章";
  return "对话";
}

function getLatestEvidence(assumption) {
  return [...assumption.evidence_chain].sort((left, right) => getTimestampValue(right.timestamp) - getTimestampValue(left.timestamp))[0];
}

function getOrderedAssumptions() {
  return [...ASSUMPTIONS].sort((left, right) => {
    if (left.status === "active" && right.status !== "active") return -1;
    if (left.status !== "active" && right.status === "active") return 1;
    return getTimestampValue(getLatestEvidence(right)?.timestamp ?? right.created_at) - getTimestampValue(getLatestEvidence(left)?.timestamp ?? left.created_at);
  });
}

function AssumptionSelectorCard({ assumption, active, onClick }) {
  const latestEvidence = getLatestEvidence(assumption);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-[24px] border p-4 text-left transition-all",
        active
          ? "border-[#d7c5b7] bg-white shadow-[0_18px_42px_rgba(31,41,55,0.08)]"
          : "border-[#ebe4db] bg-white/72 hover:bg-white hover:shadow-[0_16px_36px_rgba(31,41,55,0.05)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="line-clamp-2 text-[16px] font-semibold tracking-tight text-slate-900">{assumption.content}</div>
          <div className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500">{assumption.origin_context}</div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[11px]", ASSUMPTION_STYLES[assumption.status].chip)}>
          {ASSUMPTION_STYLES[assumption.status].label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
        <span>{assumption.inferred ? "AI 推断" : "老板明确"}</span>
        <span>·</span>
        <span>{assumption.evidence_chain.length} 条证据</span>
        {latestEvidence && (
          <>
            <span>·</span>
            <span>{getSceneTypeLabel(latestEvidence.scene_type)}</span>
          </>
        )}
      </div>
    </button>
  );
}

function AssumptionOrbitView({ selectedAssumptionId, onSelectAssumption, onOpenDetail }) {
  const viewport = useViewportSize();
  const orderedAssumptions = useMemo(() => getOrderedAssumptions(), []);
  const selectedAssumption = orderedAssumptions.find((item) => item.assumption_id === selectedAssumptionId) ?? orderedAssumptions[0];
  const activeCount = ASSUMPTIONS.filter((item) => item.status === "active").length;
  const totalEvidenceCount = ASSUMPTIONS.reduce((count, item) => count + item.evidence_chain.length, 0);
  const stageWidth = 960;
  const stageHeight = 640;
  const stageScale = getStageScale({
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    baseWidth: stageWidth,
    baseHeight: stageHeight,
    widthOffset: 640,
    heightOffset: 320,
    minScale: 0.64,
  });
  const orbitPositions = [
    { left: 18, top: 24, width: 196 },
    { left: 82, top: 22, width: 196 },
    { left: 84, top: 70, width: 204 },
    { left: 16, top: 72, width: 204 },
    { left: 50, top: 12, width: 184 },
    { left: 50, top: 86, width: 184 },
  ];

  return (
    <div className="grid gap-5 min-[1120px]:grid-cols-[260px_minmax(0,1fr)] min-[1440px]:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-[30px] border border-[#ebe4db] bg-[radial-gradient(circle_at_top_left,rgba(118,214,176,0.18),transparent_42%),rgba(255,255,255,0.92)] p-5 shadow-[0_20px_52px_rgba(31,41,55,0.06)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#29a36a]">Assumption Memory</div>
          <div className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">把前提放在视野中央</div>
          <p className="mt-3 text-[14px] leading-7 text-slate-600">
            AI 合伙人替你盯住的是这条前提本身，以及后来一条条落在它身上的证据。
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <MetricCard label="总前提" value={`${ASSUMPTIONS.length}`} helper="已进入长期记忆" />
            <MetricCard label="追踪中" value={`${activeCount}`} helper="仍在持续观察" />
            <MetricCard label="证据数" value={`${totalEvidenceCount}`} helper="后来追加的记录" />
          </div>
        </div>

        <div className="space-y-3">
          {orderedAssumptions.map((assumption) => (
            <AssumptionSelectorCard
              key={assumption.assumption_id}
              assumption={assumption}
              active={selectedAssumption?.assumption_id === assumption.assumption_id}
              onClick={() => onSelectAssumption(assumption.assumption_id)}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[36px] border border-[#ebe4db] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#fbf8f3_38%,#f6f1e9_100%)] px-4 py-4 shadow-[0_32px_80px_rgba(31,41,55,0.08)] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[18%] top-[16%] h-40 w-40 rounded-full bg-[#f2ebe3] blur-3xl" />
          <div className="absolute right-[12%] top-[24%] h-44 w-44 rounded-full bg-[#eff4f2] blur-3xl" />
          <div className="absolute bottom-[14%] left-[38%] h-36 w-36 rounded-full bg-[#f2ebff] blur-3xl" />
        </div>

        <div className="relative overflow-hidden rounded-[28px]" style={{ height: `${stageHeight * stageScale}px` }}>
          <div
            className="absolute left-1/2 top-0"
            style={{
              width: stageWidth,
              height: stageHeight,
              transform: `translateX(-50%) scale(${stageScale})`,
              transformOrigin: "top center",
            }}
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {selectedAssumption.evidence_chain.map((entry, index) => {
                const position = orbitPositions[index % orbitPositions.length];
                const dx = position.left - 50;
                const dy = position.top - 50;
                const controlX = 50 + dx * 0.42;
                const controlY = 50 + dy * 0.1;
                return (
                  <path
                    key={`${entry.scene_id}-${index}`}
                    className="memory-beam"
                    d={`M 50 50 Q ${controlX} ${controlY} ${position.left} ${position.top}`}
                    fill="none"
                    stroke={ASSUMPTION_STYLES[selectedAssumption.status].dot}
                    strokeWidth="0.24"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            <div className="absolute left-1/2 top-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-[#d9e4f3] bg-white/88 px-6 py-6 text-center shadow-[0_24px_64px_rgba(76,100,147,0.16)] backdrop-blur-md">
              <div className="flex justify-center">
                <span className={cn("rounded-full border px-3 py-1 text-xs", ASSUMPTION_STYLES[selectedAssumption.status].chip)}>
                  {ASSUMPTION_STYLES[selectedAssumption.status].label}
                </span>
              </div>
              <div className="mt-4 text-[29px] font-semibold tracking-tight text-slate-950">{selectedAssumption.content}</div>
              <div className="mt-3 text-[14px] leading-7 text-slate-600">{selectedAssumption.origin_context}</div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-[#e8e4de] bg-white px-3 py-1 text-xs text-slate-500">{selectedAssumption.inferred ? "AI 推断" : "老板明确"}</span>
                <span className="rounded-full border border-[#e8e4de] bg-white px-3 py-1 text-xs text-slate-500">{selectedAssumption.related_people.length} 位相关人</span>
                <span className="rounded-full border border-[#e8e4de] bg-white px-3 py-1 text-xs text-slate-500">{selectedAssumption.evidence_chain.length} 条证据</span>
              </div>
              <button
                onClick={() => onOpenDetail(selectedAssumption.assumption_id)}
                className="mt-6 rounded-full bg-[#c8956c] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-[0.98]"
              >
                查看完整证据链
              </button>
            </div>

            {selectedAssumption.evidence_chain.map((entry, index) => {
              const position = orbitPositions[index % orbitPositions.length];
              return (
                <button
                  key={`${entry.scene_id}-${index}`}
                  onClick={() => onOpenDetail(selectedAssumption.assumption_id)}
                  className="memory-float absolute rounded-[24px] border border-white/80 bg-white/86 p-4 text-left shadow-[0_18px_44px_rgba(43,57,71,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(43,57,71,0.1)]"
                  style={{
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                    width: position.width,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] uppercase tracking-[0.18em] text-slate-400">{formatDateTime(entry.timestamp)}</div>
                    <span className="rounded-full bg-[#f4f6f8] px-2.5 py-1 text-[11px] text-slate-500">{getSceneTypeLabel(entry.scene_type)}</span>
                  </div>
                  <div className="mt-3 line-clamp-3 text-[14px] leading-6 text-slate-700">{entry.summary}</div>
                  <div className="mt-3 text-[12px] text-slate-400">{entry.source_call} · {entry.scene_id}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssumptionsList({ onSelectAssumption }) {
  const orderedAssumptions = useMemo(() => getOrderedAssumptions(), []);

  return (
    <div className="space-y-4">
      {orderedAssumptions.map((assumption) => {
        const latestEvidence = getLatestEvidence(assumption);
        return (
          <button
            key={assumption.assumption_id}
            onClick={() => onSelectAssumption(assumption.assumption_id)}
            className="w-full rounded-[28px] border border-[#ebe4db] bg-white/88 p-5 text-left shadow-[0_16px_38px_rgba(31,41,55,0.05)] transition-all hover:-translate-y-[1px] hover:shadow-[0_18px_42px_rgba(31,41,55,0.07)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="text-[24px] font-semibold tracking-tight text-slate-950">{assumption.content}</div>
                  <span className={cn("rounded-full border px-2.5 py-1 text-xs", ASSUMPTION_STYLES[assumption.status].chip)}>
                    {ASSUMPTION_STYLES[assumption.status].label}
                  </span>
                  <span className="rounded-full border border-[#e8e4de] bg-white px-2.5 py-1 text-xs text-slate-500">
                    {assumption.inferred ? "AI 推断" : "老板明确"}
                  </span>
                </div>
                <div className="mt-3 max-w-4xl text-[14px] leading-7 text-slate-600">{assumption.origin_context}</div>
              </div>
              <div className="rounded-[20px] bg-[#faf7f3] px-4 py-3 text-right">
                <div className="text-[22px] font-semibold tracking-tight text-slate-900">{assumption.evidence_chain.length}</div>
                <div className="mt-1 text-xs text-slate-400">证据条数</div>
              </div>
            </div>

            {latestEvidence && (
              <div className="mt-5 rounded-[22px] border border-[#ebe4db] bg-[#fffdfa] p-4">
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
                  <span>{formatDateTime(latestEvidence.timestamp)}</span>
                  <span>·</span>
                  <span>{getSceneTypeLabel(latestEvidence.scene_type)}</span>
                  <span>·</span>
                  <span>{latestEvidence.source_call}</span>
                </div>
                <div className="mt-2 text-[15px] leading-7 text-slate-700">{latestEvidence.summary}</div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {assumption.related_people.map((personId) => {
                const person = PEOPLE.find((item) => item.id === personId);
                if (!person) return null;
                return (
                  <span key={person.id} className="rounded-full bg-[#f5f1eb] px-3 py-1 text-xs text-slate-500">
                    {person.name}
                  </span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AssumptionDetail({ assumptionId, onBack, onOpenPerson }) {
  const assumption = ASSUMPTIONS.find((item) => item.assumption_id === assumptionId);
  if (!assumption) return null;

  const latestEvidence = getLatestEvidence(assumption);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="rounded-full border border-[#e8e4de] bg-white px-4 py-2 text-sm text-slate-500 transition hover:bg-[#faf7f3]"
      >
        返回前提总览
      </button>

      <div className="grid gap-5 min-[1540px]:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-[#ebe4db] bg-white/88 p-6 shadow-[0_24px_58px_rgba(31,41,55,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full border px-3 py-1 text-xs", ASSUMPTION_STYLES[assumption.status].chip)}>
              {ASSUMPTION_STYLES[assumption.status].label}
            </span>
            <span className="rounded-full border border-[#e8e4de] bg-white px-3 py-1 text-xs text-slate-500">
              {assumption.inferred ? "AI 推断出来的前提" : "老板明确说过的前提"}
            </span>
          </div>
          <div className="mt-4 text-[34px] font-semibold tracking-tight text-slate-950">{assumption.content}</div>
          <div className="mt-4 rounded-[24px] border border-[#ebe4db] bg-[#fffdfa] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">它最早从哪里来</div>
            <div className="mt-3 text-[15px] leading-7 text-slate-700">{assumption.origin_context}</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard label="创建时间" value={formatDate(assumption.created_at)} helper="进入记忆系统的时间" />
            <MetricCard label="来源场景" value={assumption.source_scene_id} helper="最早写入它的 scene_id" />
            <MetricCard label="证据总数" value={`${assumption.evidence_chain.length}`} helper="后来追加到这条前提的记录" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[32px] border border-[#ebe4db] bg-[linear-gradient(180deg,#fffdf9_0%,#faf7f2_100%)] p-6 shadow-[0_20px_52px_rgba(31,41,55,0.06)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">当前状态</div>
            <div className="mt-2.5 text-[26px] font-semibold tracking-tight text-slate-950">{ASSUMPTION_STYLES[assumption.status].label}</div>
            <div className="mt-3 text-[14px] leading-7 text-slate-600">
              {assumption.status === "active" && "这条前提还在持续追踪里，后续新的汇报、会议、文章和对话都会继续往上挂证据。"}
              {assumption.status === "confirmed" && "这条前提已经被确认成立，当前更多是作为长期背景保留。"}
              {assumption.status === "disproved" && "这条前提已经被明确证伪，后续分析会把它视为过去判断失效的背景。"}
              {assumption.status === "expired" && "这条前提已经过期，不再作为当前判断的活跃背景继续追踪。"}
            </div>
            {latestEvidence && (
              <div className="mt-5 rounded-[22px] border border-[#ebe4db] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">最近一条证据</div>
                <div className="mt-3 text-[14px] leading-7 text-slate-700">{latestEvidence.summary}</div>
                <div className="mt-3 text-[12px] text-slate-400">
                  {formatDateTime(latestEvidence.timestamp)} · {getSceneTypeLabel(latestEvidence.scene_type)} · {latestEvidence.scene_id}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-[#ebe4db] bg-white/88 p-6 shadow-[0_20px_52px_rgba(31,41,55,0.06)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">相关人</div>
            <div className="mt-2.5 text-[24px] font-semibold tracking-tight text-slate-950">谁和这条前提有关</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {assumption.related_people.map((personId) => {
                const person = PEOPLE.find((item) => item.id === personId);
                if (!person) return null;
                return (
                  <button
                    key={person.id}
                    onClick={() => onOpenPerson(person.id)}
                    className="flex items-center gap-3 rounded-full border border-[#ebe4db] bg-[#fffdfa] px-3.5 py-2 text-left transition hover:bg-white"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background:person.network.halo, color:person.network.accent }}
                    >
                      {person.avatar}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-slate-900">{person.name}</span>
                      <span className="block text-xs text-slate-400">{person.relationship}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-[#ebe4db] bg-white/88 p-5 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">证据链</div>
        <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">后来有哪些记录落在它上面</div>
        <div className="mt-5 space-y-0">
          {[...assumption.evidence_chain]
            .sort((left, right) => getTimestampValue(right.timestamp) - getTimestampValue(left.timestamp))
            .map((entry, index, entries) => (
              <div key={`${entry.scene_id}-${index}`} className="relative flex gap-4 pb-6 pl-1 last:pb-0">
                <div className="relative flex w-7 shrink-0 justify-center">
                  <div
                    className="absolute top-0 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ background:ASSUMPTION_STYLES[assumption.status].dot }}
                  />
                  {index < entries.length - 1 && <div className="absolute top-4 bottom-0 w-px bg-[#e8e1d8]" />}
                </div>
                <div className="min-w-0 flex-1 rounded-[20px] border border-[#ebe4db] bg-[#fffdf9] px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{formatDateTime(entry.timestamp)}</span>
                    <span className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[11px] text-slate-500">{getSceneTypeLabel(entry.scene_type)}</span>
                    <span className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[11px] text-slate-500">{entry.source_call}</span>
                    <span className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[11px] text-slate-500">{entry.scene_id}</span>
                  </div>
                  <div className="mt-3 text-[16px] leading-7 text-slate-700">{entry.summary}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function MattersPage({ assumptionView, selectedAssumptionId, onChangeAssumptionView, onSelectAssumption, onBackToAssumptions, onOpenPerson }) {
  if (selectedAssumptionId) {
    return <AssumptionDetail assumptionId={selectedAssumptionId} onBack={onBackToAssumptions} onOpenPerson={onOpenPerson} />;
  }

  return assumptionView === "network"
    ? <AssumptionOrbitView selectedAssumptionId={selectedAssumptionId} onSelectAssumption={onSelectAssumption} onOpenDetail={onSelectAssumption} />
    : <AssumptionsList onSelectAssumption={onSelectAssumption} onChangeAssumptionView={onChangeAssumptionView} />;
}

export default function MemoryDemo({ initialSection = "people" }) {
  const [section, setSection] = useState(initialSection);
  const [peopleView, setPeopleView] = useState("network");
  const [activeFilter, setActiveFilter] = useState("all");
  const [assumptionView, setAssumptionView] = useState("network");
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [selectedAssumptionId, setSelectedAssumptionId] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const focusCount = PEOPLE.filter((item) => item.status === "focus").length;
  const activeAssumptionCount = ASSUMPTIONS.filter((item) => item.status === "active").length;
  const activeSectionMeta = SECTION_ITEMS.find((item) => item.key === section);

  useEffect(() => {
    setSection(initialSection);
    setSelectedPersonId(null);
    setSelectedAssumptionId(null);
  }, [initialSection]);

  return (
    <>
      <style>{STYLE}</style>
      <div className="flex h-full min-h-0 bg-[#f7f3ec] text-slate-900 box-border">
        <div className="flex w-[232px] shrink-0 flex-col border-r border-[#e7dfd4] bg-[linear-gradient(180deg,#fbf8f3_0%,#f4efe8_100%)] px-4 py-4">
          <div className="flex items-center justify-between">
            <AppMark />
            <button className="rounded-full border border-[#e8e4de] bg-white p-2 text-slate-400">
              <MoonGlyph />
            </button>
          </div>

          <div className="mt-6 space-y-1.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "01" } }))}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-slate-400 transition hover:bg-white/60"
            >
              <SidebarIcon><ChatGlyph /></SidebarIcon>
              <div>
                <div className="text-[15px] font-medium">会话</div>
              </div>
            </button>

            {SECTION_ITEMS.map((item) => {
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setSection(item.key);
                    if (item.key !== "people") setSelectedPersonId(null);
                    if (item.key !== "matters") setSelectedAssumptionId(null);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                    active ? "bg-white text-slate-900 shadow-[0_18px_34px_rgba(31,41,55,0.06)]" : "text-slate-400 hover:bg-white/60"
                  )}
                >
                  <SidebarIcon active={active}>{item.key === "people" ? <PersonGlyph /> : <MatterGlyph />}</SidebarIcon>
                  <div>
                    <div className="text-[15px] font-medium">{item.label}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{item.key === "people" ? `${PEOPLE.length} 个联系人` : `${ASSUMPTIONS.length} 条前提`}</div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-demo", { detail: { key: "08" } }))}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-slate-400 transition hover:bg-white/60"
            >
              <SidebarIcon><span style={{ fontSize: 18 }}>🔗</span></SidebarIcon>
              <div>
                <div className="text-[15px] font-medium">人脉圈</div>
                <div className="mt-0.5 text-xs text-slate-400">Vision</div>
              </div>
            </button>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#e8e4de] bg-white/74 p-4 shadow-[0_14px_30px_rgba(31,41,55,0.04)]">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">AI 合伙人</div>
            <div className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
              {section === "people" ? "正在替你经营人脉" : "正在替你盯事项"}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {section === "people"
                ? "它把分散在会议、汇报、对话里的信号，持续整理成可行动的人脉判断。"
                : "它记住的是你做决定时赌过的前提，以及后来哪些证据一条条落在了这些前提上。"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {section === "people" ? (
                <>
                  <span className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs text-slate-500">不是通讯录</span>
                  <span className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs text-slate-500">是新物种</span>
                </>
              ) : (
                <>
                  <span className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs text-slate-500">不是项目表</span>
                  <span className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs text-slate-500">是前提追踪</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-auto rounded-[24px] border border-[#e8e4de] bg-white/74 p-4 shadow-[0_14px_30px_rgba(31,41,55,0.04)]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">设计批注</div>
              <button
                onClick={() => setShowAnnotations((value) => !value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  showAnnotations ? "border-[#ead5c3] bg-[#fff6ef] text-[#a4683f]" : "border-[#e8e4de] bg-white text-slate-500"
                )}
              >
                {showAnnotations ? "已开启" : "已关闭"}
              </button>
            </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
              人脉页聚焦这个人是谁、AI怎么看他、最近发生了什么；事项页聚焦老板当初赌过什么前提，以及后来哪些证据落在了这些前提上。
              </p>
            </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[#e7dfd4] bg-[rgba(255,252,247,0.84)] px-8 py-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-4xl">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Memory / {section === "people" ? "People" : "Matters"}</div>
                <h1 className="mt-2.5 text-[34px] font-semibold tracking-tight text-slate-950">
                  {section === "people" && selectedPersonId ? "人脉详情" : section === "matters" && selectedAssumptionId ? "前提详情" : activeSectionMeta?.label}
                </h1>
                <p className="mt-2.5 max-w-3xl text-[14px] leading-7 text-slate-600">
                  {section === "people"
                    ? "AI 合伙人正在为你经营人脉：它把分散在会议、汇报、对话里的信号，持续整理成可行动的人脉判断。"
                    : "AI 合伙人正在替你盯事项：它把做决定时赌过的前提留在上下文里，再把后来新增的证据持续挂上去。"}
                </p>
              </div>

              {section === "people" && !selectedPersonId && (
                <div className="flex flex-wrap items-center gap-3">
                  <SectionChip active={peopleView === "network"} onClick={() => setPeopleView("network")}>网络图</SectionChip>
                  <SectionChip active={peopleView === "list"} onClick={() => setPeopleView("list")}>列表模式</SectionChip>
                  <div className="rounded-full border border-[#e8e4de] bg-white px-4 py-2 text-sm text-slate-500">
                    {focusCount} 位需要优先关注
                  </div>
                </div>
              )}

              {section === "matters" && !selectedAssumptionId && (
                <div className="flex flex-wrap items-center gap-3">
                  <SectionChip active={assumptionView === "network"} onClick={() => setAssumptionView("network")}>星状模式</SectionChip>
                  <SectionChip active={assumptionView === "list"} onClick={() => setAssumptionView("list")}>列表模式</SectionChip>
                  <div className="rounded-full border border-[#e8e4de] bg-white px-4 py-2 text-sm text-slate-500">
                    {activeAssumptionCount} 条仍在追踪
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            {showAnnotations && (
              <div className="mb-5 rounded-[24px] border border-[#efd9bb] bg-[#fff8ee] px-5 py-4 text-sm leading-7 text-[#a36f29] shadow-[0_10px_24px_rgba(163,111,41,0.06)]">
                {section === "people"
                  ? "人脉页展示的不是“联系人列表”，而是 AI 合伙人对人脉的持续经营结果。信息架构按记忆 PDF 收敛成“这个人是谁”“AI怎么看他”“最近发生了什么”，再补上关联事项，方便老板直接判断“这个人现在该不该盯”。"
                  : "事项页展示的不是“项目进度”，而是前提假设追踪。星状模式把一条前提放在中央，证据链作为端点挂在外圈；详情页则完整展开 origin_context、status、related_people 和 evidence_chain。"}
              </div>
            )}

            {section === "people" && !selectedPersonId && peopleView === "network" && (
              <MemoryNetwork people={PEOPLE} onSelectPerson={setSelectedPersonId} />
            )}

            {section === "people" && !selectedPersonId && peopleView === "list" && (
              <PeopleList people={PEOPLE} activeFilter={activeFilter} onFilterChange={setActiveFilter} onSelect={setSelectedPersonId} />
            )}

            {section === "people" && selectedPersonId && (
              <PersonDetail personId={selectedPersonId} onBack={() => setSelectedPersonId(null)} />
            )}

            {section === "matters" && (
              <MattersPage
                assumptionView={assumptionView}
                selectedAssumptionId={selectedAssumptionId}
                onChangeAssumptionView={setAssumptionView}
                onSelectAssumption={setSelectedAssumptionId}
                onBackToAssumptions={() => setSelectedAssumptionId(null)}
                onOpenPerson={(personId) => {
                  setSection("people");
                  setSelectedAssumptionId(null);
                  setSelectedPersonId(personId);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
