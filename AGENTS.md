# PersoNail 技术实现文档（AGENTS.md）

> 面向移动端的「3D美甲试戴与智能运营平台」技术实现方案。本文基于 `Profile.md` 的既定方向（Babylon.js + glTF + Morph + Node Material + 传感器交互）进行无效信息清洗、全量有效信息提炼，并按 **MECE** 结构重排，形成可直接开工的技术实现文档。

---

## 0. 目标与交付物

### 0.1 产品目标（闭环）
建立“内容种草 → 虚拟试戴 → 个性化DIY → 智能推荐 → 门店转化”的一体化链路，验证移动端美甲消费新体验。

### 0.2 Demo 交付物（H5 形式为主）
- 移动端 H5 Demo（可部署、可演示、可录屏）
- 3D 试戴：手部模型 + 美甲材质 + 交互（捏手/相机/光照/截图）
- DIY：颜色/材质参数/贴纸（最小可用）
- AI：推荐 + 可控 AIGC（标签/专题/理由）
- 门店：附近门店列表 + 预约转化（可用 mock 数据完成闭环）
- 数据与埋点：关键行为采集，支撑推荐与演示

---

## 1. 总体架构（MECE）

### 1.1 端侧分层
1) **业务壳（H5 UI）**  
承载：页面路由、内容/专题、DIY 面板、门店列表、用户资产、埋点。

2) **3D 引擎层（Babylon.js 独立模块）**  
承载：模型加载、Morph 捏手、材质/Shader、灯光环境、相机控制、截图输出、性能降级。

3) **设备能力层（传感器）**  
两条可选路线：
- **Web 传感器**：DeviceOrientation / DeviceMotion（Demo 优先，适配/权限兜底）
- **Cocos 传感器层**：如需更强滤波/兼容，可用 Cocos 承接传感器与去噪，再把平滑数据传入 H5/3D

4) **服务端与 AI 中台（AI Gateway + 业务 API）**  
承载：鉴权、限流、缓存、Prompt 模板、JSON Schema 校验、推荐/专题/标签等 AI 能力编排，以及业务数据接口。

### 1.2 数据与资产分层
- **3D 资产**：hand.glb（含 Morph Targets）、PBR 贴图（albedo/normal/roughness 等）、噪波图（猫眼/亮片）、HDR 环境贴图、贴花 decal 资源
- **款式库**：style（cover、tags、material_config、适配手型/甲长、场景季节等）
- **用户资产**：hand_params（长期保存）、designs（DIY 方案）、行为日志（试戴/收藏/点击等）

---

## 2. 前端技术栈与工程化

### 2.1 技术栈（推荐）
**H5 业务层**
- React + TypeScript（或 Vue3 + TS；Demo 优先选团队熟悉的）
- 构建：Vite
- 状态：Zustand/Redux Toolkit（React）或 Pinia（Vue）
- UI：Tailwind + 移动端组件库（Antd Mobile/Vant/轻量自研）
- 请求：fetch/axios 封装
- 监控：Sentry（错误）+ Web Vitals（性能）

**3D 引擎层**
- Babylon.js（WebGL/WebGPU 能力探测与降级）
- glTF2.0 / .glb 资产加载
- Node Material（NME 导出的 .json）加载与运行

**测试与质量**
- Lint/Format：ESLint + Prettier
- 单测：Vitest/Jest（业务逻辑、推荐逻辑、utils）
- E2E：Playwright（关键链路：试戴→DIY→推荐→门店→预约）

### 2.2 工程结构（建议 Monorepo）
- `apps/h5-main`：H5 主业务
- `apps/3d-engine`：Babylon 引擎（可独立 npm package）
- `apps/ai-gateway`：AI 中台（Node/Next/Express 均可）
- `apps/mock-server`：mock 数据与接口（Demo 快速联调）
- `packages/types`：共享 TS 类型
- `packages/telemetry`：埋点 SDK
- `assets/`：模型、贴图、HDR、贴纸等资源

---

## 3. 3D Part 技术实现（Babylon.js + glTF + PBR）

### 3.1 资产管线（Blender → glTF2.0/.glb）
**输入/产出**
- Blender 制作手部基础模型（Base Mesh）
- 制作 Morph Targets（Blend Shapes / 形态键）
- 导出 glTF2.0 `.glb`

**贴图与材质**
- 反照率贴图：灰度/去色（保留明暗与血管、关节层次，避免色偏）
- 法线贴图（Normal）
- 粗糙度贴图（Roughness）
- 噪波图（Noise）：猫眼/亮片效果（可来自生成器或程序节点）

> Demo 阶段资产优先级：先保证“手部模型 + Morph + 基础 PBR”可用，再做猫眼/亮片等特效。

### 3.2 Morph 捏手实现（核心交互）
- 前端 UI Slider → Babylon `mesh.setMorphTargetInfluence()`  
用于控制：手型、手指粗细/长度、甲长等参数的平滑过渡。
- 形成 `hand_params`：可序列化保存、可重放，作为“用户长期资产”。

**建议参数设计（示例）**
- `fingerSlim`：0~1
- `fingerLength`：0~1
- `handWidth`：0~1
- `nailLength`：0~1
- `skinTone`：0~1（驱动材质颜色）

### 3.3 材质与 Shader（Node Material + 多层材质架构）
**实现方式**
- Babylon Node Material Editor（NME）编辑材质图 → 导出 `.json`
- 前端加载 `.json` 并绑定到 mesh/material

**手部材质**
- `albedoColor`：肤色参数
- 年龄/纹理层：使用 Lerp/Mask 做平滑过渡（基于 normal/roughness 贴图）

**美甲多层材质（建议分层）**
- Base（底色/底胶）
- Pattern（渐变/法式/纹理）
- Effect（猫眼/亮片/金属）
- Top（面漆高光/透明层）

> 材质层数与参数 API 需要稳定化（“层数决定 API”），便于 style_config 直接驱动渲染。

**猫眼效果（各向异性）**
- 使用 Babylon 节点/自定义 shader 实现 anisotropy（方向与强度由参数控制）
- 结合噪波/纹理增强“磁吸线条”质感

### 3.4 灯光与环境（真实感关键）
- HDR 环境贴图（室内/日光/夜景等 preset）
- 光照分层：主光/辅光/环境光
- 一键切换 `envId`：用于演示不同场景下材质反光差异

### 3.5 相机与交互
- 基础交互：单指旋转、双指缩放、惯性
- 姿态/镜头参数：相机位置、目标点、FOV
- 传感器视差（Parallax）：陀螺仪数据微调 camera position/target，增强沉浸感

### 3.6 性能策略（移动端必须）
- 资源分级：低/中/高质量贴图（按机型与帧率切换）
- 降级链路：WebGPU → WebGL → 静态预览图（兜底）
- 贴图压缩与 CDN：建议 KTX2/压缩纹理（有条件再上）
- 首屏策略：先出手模低配，后台换高配（避免白屏）

---

## 4. 页面流实现（试戴 → DIY → 推荐 → 门店）（可开工）

### 4.1 路由与页面
1) **试戴页（Try-on）**：3D 画布全屏 + 底部快捷面板  
2) **DIY 页（DIY）**：颜色/参数/贴纸/渐变/猫眼  
3) **推荐页（Recommend）**：AI 推荐列表 + 理由 + 专题卡片  
4) **门店页（Store）**：附近门店 + 详情 + 预约

### 4.2 试戴页任务拆分
- 3D 初始化：engine/scene/camera/light/hdr
- 加载 hand.glb（含 morph targets）
- 捏手：slider → setMorphTargetInfluence
- 款式切换：applyNailStyle(style_config)
- 环境切换：setEnv(preset)
- 传感器视差：DeviceOrientation → camera 微动（带去噪）
- 截图：captureScreenshot（用于保存/分享/门店对比）

### 4.3 DIY 页任务拆分（MVP）
- 色板选择：baseColor
- 参数 slider：roughness/metallic/glitter/catEyeStrength
- 贴纸（decal）：添加/缩放/旋转/删除（MVP 可只支持预置位置）
- 保存方案：`design.save`（保存 material_config + decals + hand_params 快照）

### 4.4 推荐页任务拆分（MVP）
- 展示三块：
  - “适合你”（个性化）
  - “近期流行”（热度）
  - “节日/场景专题”（运营）
- 卡片点选：一键回到试戴并应用 style_config
- 推荐理由：由 LLM 生成短文案（但排序由规则/打分决定）

### 4.5 门店页任务拆分（MVP）
- 附近门店列表（mock 可用）
- 门店详情：可做款式/价位/距离/评分（mock）
- 预约按钮：`booking.create`（mock 成功弹窗即可）
- 演示闭环：从“同款”跳转门店并带上 styleId

---

## 5. AI 智能部分（接入与功能实现）（可控）

### 5.1 原则：AI 只输出结构化、可校验结果
- 前端不直接拼 Prompt，不直连模型
- 统一走 **AI Gateway**：鉴权、限流、缓存、日志、模板、Schema 校验
- 输出必须是 JSON，且字段受枚举/白名单约束（避免“胡编不可渲染”）

### 5.2 AI Gateway 模块
1) Prompt 模板管理（recommend/topic/tag/reason）
2) JSON Schema 校验（失败则 fallback）
3) 缓存（专题、标签、理由可缓存）
4) 限流与审计（防刷、便于复盘）
5) A/B 配置入口（权重、召回源、prompt 版本）

### 5.3 推荐系统（从 Demo 到可扩展）
**MVP（Demo）**：规则 + 轻量打分
- 输入特征：
  - 用户：收藏/最近试戴/点击/停留（可先用本地或 mock）
  - 手部：hand_params（肤色、甲长等）
  - 场景：季节/节日/“通勤/约会/旅行”等
- 输出：`[{styleId, score, reason}]`
- 排序：由可控打分完成
- 理由：LLM 生成短句（不参与排序）

**增强版（可选）**
- 向量检索：相似款扩展、冷启动
- 趋势信号：运营注入“本周主推/节日专题/门店爆款”
- 策略中心：召回源组合与权重在线化

### 5.4 可控 AIGC（运营提效）
1) **款式标签生成**（半自动）
- 输入：款式描述/材质配置/图片（可选）
- 输出：tags（来自枚举白名单）
- 用途：提升款式结构化程度，支撑推荐与检索

2) **专题生成**
- 输入：主题 + 候选 styles（由系统先召回）
- 输出：`{title, subtitle, styleIds, copywriting[]}`
- 限制：只能引用候选列表

3) **配色/材质方案生成（直接驱动 3D）**
- 输出：`style_config`（baseColor、glitter、catEye、roughness...）
- 用途：快速产出可渲染的“新方案”

### 5.5 “照片捕捉参数 → 初始捏手”（可选加分）
- 目标：降低用户首次捏手成本（自动给初始 hand_params）
- MVP 可做：
  - 肤色区间估计（0~1）
  - 甲长/甲型粗分类（短/中/长；圆/方/杏）
- 失败兜底：回默认手模 + 用户 slider 微调

---

## 6. 统一数据模型与接口（Demo 最小集）

### 6.1 核心数据结构（建议）
**HandParams**
```json
{
  "fingerSlim": 0.5,
  "fingerLength": 0.5,
  "handWidth": 0.5,
  "nailLength": 0.5,
  "skinTone": 0.5
}
```

**Style（款式库条目）**
```json
{
  "id": "style_001",
  "title": "奶茶猫眼",
  "cover": "https://cdn/cover.jpg",
  "tags": ["显白", "通勤", "春夏"],
  "material_config": {
    "baseColor": "#D8BFA8",
    "roughness": 0.35,
    "metallic": 0.1,
    "glitter": 0.2,
    "catEye": { "strength": 0.8, "direction": 0.4 }
  }
}
```

**Design（用户 DIY 方案）**
```json
{
  "id": "design_001",
  "user_id": "u1",
  "hand_params_snapshot": { "...": "..." },
  "style_config": { "...": "..." },
  "decals": [{ "stickerId": "s1", "pos": [0.2, 0.3], "scale": 1.0, "rot": 15 }]
}
```

### 6.2 API 清单（Demo 必要）
- 款式：
  - `GET /styles/hot`
  - `GET /styles/:id`
- DIY：
  - `POST /design/save`
  - `GET /design/list`
- AI：
  - `POST /ai/recommend`
  - `POST /ai/topic`
  - `POST /ai/tag`
- 门店：
  - `GET /stores/nearby`
  - `POST /booking/create`

---

## 7. 3D 引擎对外 API（H5 调用契约）

### 7.1 初始化与生命周期
- `init(canvas, options)`
- `dispose()`

### 7.2 手部与捏手
- `loadHandModel(url | assetId)`
- `setHandParams(handParams)`
- `getHandParams()`

### 7.3 美甲样式
- `applyNailStyle(styleConfig | styleId)`
- `setMaterialPreset(presetId)`
- `loadNodeMaterial(jsonUrl | jsonObject)`

### 7.4 相机与环境
- `setCamera(pose)`
- `setEnv(envId)`
- `enableParallax(enable: boolean)`
- `updateParallax(sensorData)`

### 7.5 输出能力
- `captureScreenshot(): Promise<base64|blob>`

---

## 8. 埋点与指标（Demo 也要有）
**关键事件**
- `enter_tryon`
- `adjust_morph`（参数名、幅度）
- `switch_style`（styleId）
- `change_env`（envId）
- `save_design`
- `click_recommend_card`
- `click_store`
- `create_booking`

**指标（用于讲故事）**
- 试戴转化：进入试戴→切换款式→保存/收藏
- DIY 深度：参数调整次数、贴纸使用
- 推荐有效性：推荐卡点击率
- 门店转化：门店页进入率、预约发起率

---

## 9. 开发顺序与里程碑（竞赛最稳）

### Milestone A（先完成灵魂）：3D 试戴可用
- hand.glb 加载 + 基础 PBR
- 捏手（morph）+ 相机交互
- 款式切换（最少 5 款）
- 环境切换 + 截图

### Milestone B（提升可玩性）：DIY 可用
- 色板 + 参数 slider
- 保存 design（本地/后端均可）

### Milestone C（体现智能）：AI 推荐可演示
- 推荐列表 + 推荐理由
- 专题卡片（可用 mock + LLM 生成文案）

### Milestone D（闭环落地）：门店转化可演示
- 门店列表 + 预约成功（mock）
- “同款可做”跳转链路

---

## 10. 风险与兜底（Demo 必备）
- iOS 传感器权限/兼容：无权限时降级为手势交互
- 低端机性能：降贴图、关特效、降低采样、必要时静态图兜底
- LLM 不稳定：AI 结果必须 Schema 校验，失败走规则/缓存结果
- 资产交付风险：先用占位模型跑通链路，再替换高精资产

---

## 11. 最终验收清单（演示路线）
- 首页：热门款式 + AI 专题入口
- 试戴页：3D + 捏手 + 环境 + 截图 + 快捷换款
- DIY 页：颜色/参数/贴纸 + 保存
- 推荐页：个性化推荐 + 理由 + 专题
- 门店页：附近门店 + 预约闭环
