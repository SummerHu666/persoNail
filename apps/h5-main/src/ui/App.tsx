import {
  Camera, CheckCircle2, Clock3, Heart, Home, MapPin, Search,
  SlidersHorizontal, Sparkles, Store, UserRound
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { telemetry } from "@personail/telemetry";
import type { NailStyle } from "@personail/types";
import { stores, styles } from "../data/mock";
import { usePersonailStore } from "../state/usePersonailStore";

const images = [
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80",
  "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=600&q=80",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
  "https://images.unsplash.com/photo-1604654894611-6973b376cbde?w=600&q=80",
  "https://images.unsplash.com/photo-1588359953494-0c215e3cedc6?w=600&q=80",
  "https://images.unsplash.com/photo-1588015810531-dd522c9c8bbb?w=600&q=80"
];
const categories = ["推荐", "通勤", "显白", "短甲友好", "法式", "猫眼", "纯色", "渐变", "约会", "附近可做"];
type MainView = "home" | "tryon" | "stores" | "my";

export function App() {
  const [mainView, setMainView] = useState<MainView>("home");
  return (
    <main className="app-shell">
      <section className="phone-frame">
        {mainView === "home" && <HomePage onTryOn={() => setMainView("tryon")} />}
        {mainView === "tryon" && <TryOnPage />}
        {mainView === "stores" && <StoresPage />}
        {mainView === "my" && <MyPage />}
        <BottomNav active={mainView} onChange={setMainView} />
      </section>
    </main>
  );
}

function HomePage({ onTryOn }: { onTryOn: () => void }) {
  const { setActiveStyle } = usePersonailStore();
  const [selectedCategory, setSelectedCategory] = useState("推荐");
  const [query, setQuery] = useState("");
  const visibleStyles = useMemo(() => styles.filter((style) => {
    const categoryMatch = selectedCategory === "推荐" || selectedCategory === "附近可做" || style.tags.includes(selectedCategory);
    return categoryMatch && `${style.title}${style.tags.join("")}`.includes(query.trim());
  }), [query, selectedCategory]);

  const openStyle = (style: NailStyle) => {
    setActiveStyle(style);
    telemetry.track("switch_style", { styleId: style.id });
    onTryOn();
  };

  return (
    <Page>
      <header className="pn-header">
        <div className="pn-header-row">
          <h1>PersoNail</h1>
          <span className="pn-location"><MapPin size={15} />北京 朝阳</span>
        </div>
        <label className="pn-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索款式、颜色、风格" /></label>
      </header>
      <div className="pn-content">
        <section className="pn-hero-card">
          <div className="pn-hero-copy">
            <h2>先试上手，再决定做哪款</h2>
            <p>上传一次手部照片，AI 会根据甲型、肤色和光线生成真实试戴效果。</p>
            <button className="pn-button primary" onClick={onTryOn}>开始 AI 试戴</button>
            <button className="pn-button plain" onClick={onTryOn}>查看我的手模</button>
          </div>
          <div className="pn-hero-icon"><Sparkles size={38} /></div>
        </section>
        <div className="pn-quick-grid">
          <QuickAction icon={<Camera />} title="拍手" subtitle="/ 保存手模" onClick={onTryOn} />
          <QuickAction icon={<Heart />} title="选款" subtitle="/ 热门同款" onClick={() => setSelectedCategory("推荐")} />
          <QuickAction icon={<SlidersHorizontal />} title="试戴" subtitle="/ 实时调参" onClick={onTryOn} />
        </div>
        <div className="pn-chip-scroll">
          {categories.map((category) => <button key={category} className={`pn-chip ${selectedCategory === category ? "active" : ""}`} onClick={() => setSelectedCategory(category)}>{category}</button>)}
        </div>
        <div className="pn-style-grid">
          {visibleStyles.map((style) => <StyleCard key={style.id} style={style} onClick={() => openStyle(style)} />)}
        </div>
      </div>
    </Page>
  );
}

function TryOnPage() {
  const { activeStyle, setActiveStyle, handParams, updateHandParam, saveDesign } = usePersonailStore();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <Page>
      <header className="pn-header">
        <h1>AI 试戴</h1>
        <p>用你的手模快速预览任意款式</p>
      </header>
      <div className="pn-content">
        <section className="pn-card">
          <div className="pn-card-head"><div><h2>已保存手模</h2><p>最近更新：今天 14:30</p></div><div className="pn-small-icon"><Sparkles /></div></div>
          <div className="pn-ai-metrics"><Metric label="甲型识别" value="椭圆形甲" /><Metric label="肤色区间" value="冷白皮" /></div>
          <button className="pn-button secondary" onClick={() => setEditing((value) => !value)}>{editing ? "收起实时调参" : "实时调整手模"}</button>
          {editing && <div className="pn-controls">
            <Slider label="甲片长度" value={handParams.nailLength} onChange={(value) => updateHandParam("nailLength", value)} />
            <Slider label="肤色" value={handParams.skinTone} onChange={(value) => updateHandParam("skinTone", value)} />
          </div>}
        </section>
        <SectionTitle title="最近试戴" action={<Clock3 size={18} />} />
        <div className="pn-style-grid pn-recent-grid">
          {styles.slice(0, 2).map((style) => <StyleCard key={style.id} style={style} compact onClick={() => setActiveStyle(style)} />)}
        </div>
        <section className="pn-notice"><div className="pn-small-icon"><Heart /></div><div><h2>继续上次试戴</h2><p>{activeStyle.title} · 已完成调参</p><button onClick={() => setEditing(true)}>继续编辑</button></div></section>
        <SectionTitle title="可试戴款式" />
        <div className="pn-style-grid">
          {styles.slice(2).map((style, index) => <StyleCard key={style.id} style={style} badge={index === 0 ? "最近浏览" : index === 1 ? "收藏" : "热门"} onClick={() => setActiveStyle(style)} />)}
        </div>
        <button className="pn-button primary pn-save" onClick={() => {
          const design = saveDesign(); telemetry.track("save_design", { designId: design.id }); setSaved(true);
        }}>{saved ? "方案已保存" : `保存「${activeStyle.title}」方案`}</button>
      </div>
    </Page>
  );
}

function StoresPage() {
  const [booked, setBooked] = useState<string>();
  return <Page><header className="pn-header"><h1>附近门店</h1><p>按距离为你推荐可做同款的门店</p></header><div className="pn-content">
    <div className="pn-sort-row"><button className="active">距离</button><button>评分</button><button>名称</button></div>
    <h2 className="pn-group-title">支持 AI 试戴 <span>{stores.length} 家</span></h2>
    <div className="pn-store-list">{stores.map((store, index) => <article className="pn-store-card" key={store.id}>
      <img src={images[(index + 2) % images.length]} alt="" /><div className="pn-store-body"><div className="pn-card-head"><h3>{store.name}</h3><strong>★ {store.rating}</strong></div><p>{store.distance} · 营业至 22:00</p>
      <div className="pn-tag-row">{store.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="pn-button store-book" onClick={() => setBooked(store.id)}>{booked === store.id ? "预约申请已发送" : "立即预约"}</button></div>
    </article>)}</div>
  </div></Page>;
}

function MyPage() {
  const { savedDesigns } = usePersonailStore();
  const cards = savedDesigns.length ? savedDesigns : [{ id: "demo", title: "白月光通勤款", created_at: "今天 14:30" }];
  return <Page><header className="pn-header"><h1>我的</h1></header><div className="pn-content">
    <section className="pn-card pn-user"><div className="pn-avatar"><UserRound /></div><div><h2>美甲爱好者</h2><p>已保存 {cards.length} 个方案</p></div></section>
    <SectionTitle title="我的方案" />
    <div className="pn-solution-list">{cards.map((item, index) => <article className="pn-solution-card" key={item.id}><img src={images[index % images.length]} alt="" /><div><div className="pn-card-head"><h3>{item.title}</h3><CheckCircle2 size={18} /></div><p>{"created_at" in item ? item.created_at : "今天"}</p><div className="pn-tag-row"><span>1 款式</span><span>适配度 92%</span></div><small>未预约门店</small></div></article>)}</div>
  </div></Page>;
}

function BottomNav({ active, onChange }: { active: MainView; onChange: (view: MainView) => void }) {
  const tabs = [{ key: "home", label: "款式", icon: <Home /> }, { key: "tryon", label: "AI试戴", icon: <Sparkles /> }, { key: "stores", label: "门店", icon: <Store /> }, { key: "my", label: "我的", icon: <UserRound /> }] as const;
  return <nav className="pn-bottom-nav">{tabs.map((tab) => <button key={tab.key} className={active === tab.key ? "active" : ""} onClick={() => onChange(tab.key)}>{tab.icon}<span>{tab.label}</span></button>)}</nav>;
}
function Page({ children }: { children: ReactNode }) { return <div className="pn-page">{children}</div>; }
function QuickAction({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) { return <button className="pn-quick-action" onClick={onClick}>{icon}<div><strong>{title}</strong><span> {subtitle}</span></div></button>; }
function SectionTitle({ title, action }: { title: string; action?: ReactNode }) { return <div className="pn-section-title"><h2>{title}</h2>{action}</div>; }
function StyleCard({ style, compact, badge, onClick }: { style: NailStyle; compact?: boolean; badge?: string; onClick: () => void }) {
  const index = styles.findIndex((item) => item.id === style.id);
  return <button className="pn-style-card" onClick={onClick}><div className={`pn-style-image ${compact ? "compact" : ""}`}><img src={images[index]} alt={style.title} />{badge && <span>{badge}</span>}</div><div className="pn-style-body"><h3>{style.title}</h3>{!compact && <div className="pn-price-row"><strong>¥{138 + index * 20}</strong><span>{(0.3 + index * .2).toFixed(1)}km 有门店</span></div>}<div className="pn-tag-row">{style.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div></div></button>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="pn-slider"><span>{label}<b>{Math.round(value * 100)}%</b></span><input type="range" min="0" max="1" step=".01" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
