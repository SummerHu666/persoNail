# PersoNail

面向移动端的 3D 美甲试戴与智能运营 H5 Demo。工程按 `AGENTS.md` 规划初始化为 monorepo，覆盖试戴、DIY、推荐、门店转化、共享类型与埋点基础能力。

## 快速开始

```bash
npm install
npm run dev:h5
```

常用脚本：

```bash
npm run dev:h5    # 启动移动端 H5 Demo
npm run dev:ai    # 启动 AI Gateway mock
npm run dev:mock  # 启动业务 mock API
npm run build     # 构建共享包与 H5
```

## 目录

```text
apps/h5-main       React + Vite H5 主业务
apps/ai-gateway    AI Gateway mock，统一结构化输出
apps/mock-server   Demo 业务 mock API
packages/types     共享 TypeScript 类型
packages/telemetry 埋点 SDK
assets             3D、贴图、贴纸等资产占位目录

```

## Demo 路线

1. 首页查看热门款式与专题。
2. 进入试戴，切换款式、环境与手部参数。
3. 进入 DIY 调整颜色、材质和贴纸，并保存方案。
4. 查看推荐理由，一键应用推荐款式。
5. 进入门店列表并完成 mock 预约闭环。

## 架构
这是一个基于 **Monorepo** 架构的 3D 美甲试戴与智能运营移动端 H5 演示项目。项目利用 npm workspaces 将前端应用、后端 Mock 服务以及共享依赖（类型、埋点）集成在一个仓库中，便于全链路的开发和迭代。

为了帮你更好地进行迭代开发，以下是按目录模块和业务逻辑拆解的详细项目架构：

### 1. 核心应用层 (`apps/`)

这里包含了所有的可独立运行的服务和前端页面。

#### 1.1 前端主应用 (`apps/h5-main/`)

这是面向用户的 React + Vite 移动端 H5 项目。

* **技术栈**：React, Vite, Zustand (状态管理), Babylon.js (3D引擎, 见包依赖), Lucide-react (图标)。
* **UI 架构 (`src/ui/App.tsx`)**：应用采用底部导航栏 (Bottom Nav) 结构，包含 5 个核心视图组件，对应完整业务链路：
* `HomeView` (首页)：展示项目简介、热门款式列表和话题种草。点击款式可进入试戴。
* `TryOnView` (试戴)：核心 3D 交互区。提供手指模型参数调节（如指型、指长、掌宽、甲长、肤色）。
* `DiyView` (DIY)：材质与颜色调整区。用户可以微调美甲的雾面 (roughness)、金属感 (metallic)、亮片 (glitter) 和猫眼强度，并保存方案。
* `RecommendView` (推荐)：展示基于用户数据的 AI 推荐款式及其推荐理由（如根据肤色和甲长匹配）。
* `StoresView` (门店)：展示附近门店，完成“预约同款”的商业闭环，并触发埋点事件。


* **3D 引擎封装 (`src/engine/Personail3DEngine.ts`)**：这是一个面向业务的 3D 渲染器包装类。目前用 Canvas 2D API 做了占位，但预留了完整的业务接口（如加载手模 `loadHandModel`、应用款式 `applyNailStyle`、设置环境、截图等）供未来接入真实的 WebGL/WebGPU 引擎。

#### 1.2 业务 Mock API (`apps/mock-server/`)

用 Express 搭建的本地服务器，模拟核心业务数据库。

* **路由能力**：
* 商品/款式：提供获取热门款式 (`/styles/hot`) 和单品详情 (`/styles/:id`) 的接口。
* UGC 资产：提供保存用户 DIY 设计 (`/design/save`) 和获取设计列表 (`/design/list`) 的接口。
* O2O 业务：提供附近门店查询 (`/stores/nearby`) 和创建订单预约 (`/booking/create`) 接口。



#### 1.3 AI 网关服务 (`apps/ai-gateway/`)

用于统管所有 AI 结构化输出的独立 Express 服务，这使得前端不需要直接和底层 LLM 交互。

* **`/ai/recommend`**：基于用户习惯（偏好、肤色、甲长）返回个性化的打分推荐列表及自然语言解释。
* **`/ai/topic`**：生成营销话题内容（如“早春通勤显白组”）。
* **`/ai/tag`**：从文本描述中提取标签属性（如提取出“显白”、“猫眼”等）。

---

### 2. 共享依赖层 (`packages/`)

保证整个全栈（前/中/后台）类型和基建工具一致性的核心目录。

#### 2.1 全局类型定义 (`packages/types/`)

维护了前后端交互和前端状态管理共同依赖的 TypeScript 接口。

* **3D 与渲染数据结构**：如 `HandParams`（手部形态，如指长、宽度、肤色参数）、`StyleConfig`（美甲材质参数，如底色、粗糙度、金属感、猫眼强度）和 `Decal`（贴纸坐标、缩放）。
* **业务数据结构**：定义了款式 (`NailStyle`)、DIY 设计档案 (`Design`)、门店 (`Store`) 和订单 (`Booking`)。
* **埋点字典**：枚举了合法的 `TelemetryEventName`（如 `enter_tryon`, `adjust_morph`, `create_booking`），防止前后端在打点统计时名字写错。

#### 2.2 埋点监控 SDK (`packages/telemetry/`)

提供了一个极其轻量级的通用打点服务 `TelemetryClient`。

* 它暴露了一个单例对象 `telemetry`。
* 通过调用 `telemetry.track(事件名, 负载数据)` 来搜集行为（目前实现为打印 `console.info`，后续迭代可接真实的埋点通道如阿里云/神策）。前端的 `App.tsx` 页面在路由切换、拖拽参数滑块等操作时大量使用了该 SDK。

---

### 3. 给你的后续迭代开发建议

基于现有架构，你可以清晰地在对应目录完成下阶段开发：

1. **3D 引擎真实接入**：目前的重点在 `apps/h5-main/src/engine/Personail3DEngine.ts`。你不需要动 React 业务层，只需在该文件中引入 `Babylon.js` 或 `Three.js` 实例替换当前的 Canvas API 即可。
2. **前端状态分离**：项目用到了 Zustand (`usePersonailStore`) 作为前端状态中心。在对接真实 API 时，可以在 Zustand 的 Actions 中引入对 `mock-server` 和 `ai-gateway` 的 axios/fetch 请求。
3. **大语言模型接入**：`ai-gateway` 能够直接被当作代理服务器来修改，你可以引入 OpenAI Node SDK 或其他工具层，把硬编码的返回对象替换成真实的 LLM Prompt 请求与 Zod 解析映射。


