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
