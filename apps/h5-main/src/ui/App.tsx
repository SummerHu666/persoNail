import {
  CalendarCheck,
  Camera,
  Gem,
  Home,
  MapPin,
  Palette,
  Sparkles,
  Wand2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { telemetry } from "@personail/telemetry";
import type { HandParams, NailStyle } from "@personail/types";
import { stores, styles, topic } from "../data/mock";
import { usePersonailStore } from "../state/usePersonailStore";

const navItems = [
  { key: "home", label: "首页", icon: Home },
  { key: "tryon", label: "试戴", icon: Camera },
  { key: "diy", label: "DIY", icon: Palette },
  { key: "recommend", label: "推荐", icon: Sparkles },
  { key: "stores", label: "门店", icon: MapPin }
] as const;

export function App() {
  const { view, setView } = usePersonailStore();

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {view === "home" && <HomeView />}
        {view === "tryon" && <TryOnView />}
        {view === "diy" && <DiyView />}
        {view === "recommend" && <RecommendView />}
        {view === "stores" && <StoresView />}
        <nav className="bottom-nav" aria-label="PersoNail sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.key ? "active" : ""}
                key={item.key}
                onClick={() => {
                  if (item.key === "tryon") telemetry.track("enter_tryon");
                  setView(item.key);
                }}
                title={item.label}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </section>
    </main>
  );
}

function HomeView() {
  const { setActiveStyle, setView } = usePersonailStore();

  return (
    <ViewScaffold eyebrow="PersoNail" title="3D 美甲试戴与智能运营 Demo">
      <section className="hero-panel">
        <div>
          <p>从内容种草到门店预约，一条链路跑通。</p>
          <button
            className="primary-action"
            onClick={() => {
              telemetry.track("enter_tryon");
              setView("tryon");
            }}
          >
            <Camera size={18} />
            开始试戴
          </button>
        </div>
        <div className="hero-nails" aria-hidden="true">
          {styles.slice(0, 4).map((style) => (
            <span key={style.id} style={{ background: style.cover }} />
          ))}
        </div>
      </section>

      <SectionTitle icon={Gem} title="热门款式" />
      <div className="style-grid">
        {styles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            onClick={() => {
              setActiveStyle(style);
              telemetry.track("switch_style", { styleId: style.id });
              setView("tryon");
            }}
          />
        ))}
      </div>

      <SectionTitle icon={Wand2} title={topic.title} />
      <div className="topic-strip">
        <strong>{topic.subtitle}</strong>
        {topic.copywriting.map((copy) => (
          <span key={copy}>{copy}</span>
        ))}
      </div>
    </ViewScaffold>
  );
}

function TryOnView() {
  const { activeStyle, handParams, updateHandParam, setActiveStyle, setView } = usePersonailStore();
  const controls: Array<[keyof HandParams, string]> = [
    ["fingerSlim", "指型"],
    ["fingerLength", "指长"],
    ["handWidth", "掌宽"],
    ["nailLength", "甲长"],
    ["skinTone", "肤色"]
  ];

  return (
    <ViewScaffold eyebrow="Try-on" title="实时试戴">
      <section className="tryon-stage">
        <div className="hand-preview">
          <div className="hand-palm" />
          {[0, 1, 2, 3, 4].map((finger) => (
            <span
              className="finger"
              key={finger}
              style={{
                height: `${82 + handParams.fingerLength * 28 - Math.abs(finger - 2) * 10}px`,
                width: `${22 + (1 - handParams.fingerSlim) * 8}px`,
                left: `${38 + finger * 34}px`
              }}
            >
              <i
                style={{
                  background: activeStyle.material_config.baseColor,
                  boxShadow: `0 0 ${8 + activeStyle.material_config.glitter * 18}px rgba(255,255,255,.9)`
                }}
              />
            </span>
          ))}
        </div>
        <div className="stage-actions">
          <button
            onClick={() => {
              telemetry.track("change_env", { envId: "daylight" });
            }}
            title="切换环境"
          >
            <Sparkles size={18} />
          </button>
          <button title="截图">
            <Camera size={18} />
          </button>
        </div>
      </section>

      <div className="quick-style-row">
        {styles.map((style) => (
          <button
            className={activeStyle.id === style.id ? "selected" : ""}
            key={style.id}
            onClick={() => {
              setActiveStyle(style);
              telemetry.track("switch_style", { styleId: style.id });
            }}
            title={style.title}
          >
            <span style={{ background: style.cover }} />
          </button>
        ))}
      </div>

      <section className="control-panel">
        {controls.map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={handParams[key]}
              onChange={(event) => {
                updateHandParam(key, Number(event.target.value));
                telemetry.track("adjust_morph", { param: key, value: Number(event.target.value) });
              }}
            />
          </label>
        ))}
      </section>

      <button className="primary-action full" onClick={() => setView("diy")}>
        <Palette size={18} />
        继续 DIY
      </button>
    </ViewScaffold>
  );
}

function DiyView() {
  const { activeStyle, applyStyleConfig, saveDesign } = usePersonailStore();
  const config = activeStyle.material_config;

  return (
    <ViewScaffold eyebrow="DIY" title="材质与贴纸">
      <section className="diy-preview" style={{ background: activeStyle.cover }}>
        <span>Base</span>
        <strong>{activeStyle.title}</strong>
      </section>
      <div className="swatches">
        {["#D8BFA8", "#B7355C", "#F7EDE4", "#8EDCCB", "#A76573", "#2E3438"].map((color) => (
          <button
            key={color}
            style={{ backgroundColor: color }}
            onClick={() => applyStyleConfig({ ...config, baseColor: color })}
            title={color}
          />
        ))}
      </div>
      <section className="control-panel">
        {[
          ["roughness", "雾面"],
          ["metallic", "金属"],
          ["glitter", "亮片"],
          ["catEye", "猫眼"]
        ].map(([key, label]) => {
          const value = key === "catEye" ? config.catEye.strength : config[key as keyof typeof config];
          return (
            <label key={key}>
              <span>{label}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(value)}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  applyStyleConfig(
                    key === "catEye"
                      ? { ...config, catEye: { ...config.catEye, strength: next } }
                      : { ...config, [key]: next }
                  );
                }}
              />
            </label>
          );
        })}
      </section>
      <button
        className="primary-action full"
        onClick={() => {
          const design = saveDesign();
          telemetry.track("save_design", { designId: design.id });
        }}
      >
        <Gem size={18} />
        保存方案
      </button>
    </ViewScaffold>
  );
}

function RecommendView() {
  const { setActiveStyle, setView } = usePersonailStore();
  const recommendations = styles.map((style, index) => ({
    style,
    score: 98 - index * 4,
    reason: `${style.tags[0]}风格与你当前甲长和肤色参数匹配，适合直接试戴。`
  }));

  return (
    <ViewScaffold eyebrow="AI Recommend" title="适合你的款式">
      <div className="recommend-list">
        {recommendations.map(({ style, score, reason }) => (
          <article className="recommend-card" key={style.id}>
            <div className="recommend-cover" style={{ background: style.cover }} />
            <div>
              <div className="row-between">
                <strong>{style.title}</strong>
                <span>{score}</span>
              </div>
              <p>{reason}</p>
              <button
                onClick={() => {
                  setActiveStyle(style);
                  telemetry.track("click_recommend_card", { styleId: style.id, score });
                  setView("tryon");
                }}
              >
                应用
              </button>
            </div>
          </article>
        ))}
      </div>
    </ViewScaffold>
  );
}

function StoresView() {
  const { activeStyle } = usePersonailStore();

  return (
    <ViewScaffold eyebrow="Stores" title="附近可做门店">
      <div className="store-list">
        {stores.map((store) => (
          <article className="store-card" key={store.id}>
            <div className="row-between">
              <strong>{store.name}</strong>
              <span>{store.distance}</span>
            </div>
            <p>
              {store.rating} 分 · {store.priceRange}
            </p>
            <div className="tag-row">
              {store.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <button
              className="primary-action full"
              onClick={() => {
                telemetry.track("click_store", { storeId: store.id });
                telemetry.track("create_booking", { storeId: store.id, styleId: activeStyle.id });
                window.alert(`已为你预约 ${store.name} 的 ${activeStyle.title}`);
              }}
            >
              <CalendarCheck size={18} />
              预约同款
            </button>
          </article>
        ))}
      </div>
    </ViewScaffold>
  );
}

function ViewScaffold({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="view">
      <header className="view-header">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </header>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <h2 className="section-title">
      <Icon size={18} />
      {title}
    </h2>
  );
}

function StyleCard({ style, onClick }: { style: NailStyle; onClick: () => void }) {
  return (
    <button className="style-card" onClick={onClick}>
      <span className="style-cover" style={{ background: style.cover }} />
      <strong>{style.title}</strong>
      <small>{style.tags.join(" · ")}</small>
    </button>
  );
}
