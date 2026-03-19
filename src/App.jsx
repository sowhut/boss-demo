import { useEffect, useMemo, useState } from 'react';
import Demo01 from '../01-整体布局与Thread生命周期.jsx';
import Demo02 from '../02-新用户引导.jsx';
import Demo03 from '../03-会议分析Thread.jsx';
import Demo04 from '../04-汇报解读Thread.jsx';
import Demo05 from '../05-文章提炼Thread.jsx';
import Demo06 from '../06-记忆系统.jsx';

const EDITORIAL_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');

:root {
  --editorial-ink: #1a1a1a;
  --editorial-ink-soft: #3d3d3d;
  --editorial-ink-muted: #6b6b6b;
  --editorial-parchment: #fdfcfa;
  --editorial-sidebar: #1e1e1e;
  --editorial-border: #e8e4de;
  --editorial-accent: #c8956c;
  --editorial-accent-deep: #b7835d;
  --editorial-accent-soft: #fdf4ec;
}

html, body, #root {
  background: var(--editorial-parchment);
  color: var(--editorial-ink);
  font-family: 'Noto Sans SC', sans-serif;
}

h1, h2, h3, h4, .editorial-serif {
  font-family: 'Noto Serif SC', serif;
  letter-spacing: -0.01em;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
.anim-fadeIn { animation: fadeIn 0.4s ease-out both; }
.animate-bounce { animation: dotBounce 1s ease-in-out infinite !important; }

.bg-slate-950, .bg-slate-900, .bg-slate-800, .bg-slate-700 {
  background-color: var(--editorial-sidebar) !important;
}
.bg-slate-100 { background-color: var(--editorial-parchment) !important; }
.bg-slate-50 { background-color: #f7f5f2 !important; }

.text-slate-800 { color: var(--editorial-ink) !important; }
.text-slate-700, .text-slate-600 { color: var(--editorial-ink-soft) !important; }
.text-slate-500, .text-slate-400 { color: var(--editorial-ink-muted) !important; }

.border-slate-200, .border-slate-100, .border-slate-50 {
  border-color: var(--editorial-border) !important;
}

.bg-white { background-color: #fffdf9 !important; }
.shadow-2xl, .shadow-lg, .shadow-md, .shadow-sm {
  box-shadow: 0 8px 24px rgba(60, 42, 28, 0.08) !important;
}

.bg-blue-600 { background-color: var(--editorial-accent) !important; }
.hover\\:bg-blue-700:hover { background-color: var(--editorial-accent-deep) !important; }
.text-blue-600, .text-blue-700 { color: var(--editorial-accent) !important; }
.bg-blue-50 { background-color: var(--editorial-accent-soft) !important; }
.border-blue-200, .border-blue-300 { border-color: #f0d4be !important; }
.text-blue-500 { color: var(--editorial-accent) !important; }

.bg-indigo-50 { background-color: #f0f4fa !important; }
.text-indigo-700 { color: #4a72b0 !important; }
.border-indigo-200 { border-color: #c0d0e8 !important; }
`;

const demos = [
  { key: '01', title: '整体布局与Thread生命周期', Component: Demo01 },
  { key: '02', title: '新用户引导', Component: Demo02 },
  { key: '03', title: '会议分析Thread', Component: Demo03 },
  { key: '04', title: '汇报解读Thread', Component: Demo04 },
  { key: '05', title: '文章提炼Thread', Component: Demo05 },
  { key: '06', title: '记忆系统', Component: Demo06 },
];

export default function App() {
  const [activeKey, setActiveKey] = useState(demos[0].key);
  useEffect(() => {
    if (document.getElementById('editorial-theme-style')) return;
    const style = document.createElement('style');
    style.id = 'editorial-theme-style';
    style.textContent = EDITORIAL_STYLE;
    document.head.appendChild(style);
  }, []);

  const ActiveComponent = useMemo(() => {
    return demos.find((item) => item.key === activeKey)?.Component ?? demos[0].Component;
  }, [activeKey]);

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: '#fdfcfa' }}>
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 backdrop-blur border rounded-xl px-2 py-2 flex flex-wrap items-center gap-2 max-w-[95vw]"
        style={{ background: 'rgba(255, 253, 249, 0.92)', borderColor: '#e8e4de' }}
      >
        {demos.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveKey(item.key)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              item.key === activeKey ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
            style={item.key === activeKey ? undefined : { background: '#f7f5f2', border: '1px solid #e8e4de' }}
          >
            {item.key}. {item.title}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
}
