# LeetCode 遗忘曲线刷题工具

基于 SM-2 间隔重复算法的刷题计划工具，帮助科学安排 LeetCode Hot 100 复习节奏。

## 技术栈

- **后端**: Python + FastAPI，`backend/` 目录，端口 19999
- **前端**: Vite + React 19 + TypeScript + Tailwind CSS 4，`frontend/` 目录
- **数据库**: SQLite，`leetcode_100.db`（运行后自动生成）
- **包管理**: uv（Python）+ npm（前端）

## 启动

```bash
# 前端构建（首次或代码变更后）
cd frontend && npm run build && cd ..

# 启动后端
uv run uvicorn main:app --app-dir backend --host 0.0.0.0 --port 19999
```

## 项目结构

```
backend/                     # Python 后端
├── main.py                  # FastAPI 路由 + SPA fallback
├── database.py              # SQLite CRUD + pre-seeded Hot 100 + activity_log
└── sm2.py                   # SM-2 算法（小时粒度）

frontend/                    # React 前端
├── src/
│   ├── api/client.ts        # API 请求封装（fetch wrapper）
│   ├── types.ts             # TypeScript 类型定义
│   ├── hooks/useDarkMode.ts # 暗色模式 hook（localStorage）
│   ├── components/          # Navbar, Toast, DiffBadge, StatusLabel,
│   │                         QuickReviewModal, ResetConfirmModal,
│   │                         ProblemActivityModal, RandomPickModal,
│   │                         QualityButtons
│   ├── pages/               # TodayPage, ProblemsPage, StatsPage,
│   │                         ActivityLogPage, SettingsPage
│   └── App.tsx              # BrowserRouter + ToastProvider
├── vite.config.ts           # Tailwind plugin + /api proxy
└── index.html
```

## 前端架构要点

- **状态管理**: 组件级 `useState`，无全局 store
- **路由**: react-router-dom v7，`/` `/problems` `/stats` `/activity` `/settings`
- **暗色模式**: Tailwind `darkMode: 'class'` + `useDarkMode` hook
- **API**: `frontend/src/api/client.ts` — 所有请求走 `/api/*`，开发时 Vite proxy 转发到后端
- **构建**: `npm run build` 输出到 `frontend/dist/`，后端 `main.py` 自动 serve

## API 端点

`/api/today` `/api/problems` `/api/review/{id}` `/api/stats`
`/api/settings` `/api/calendar` `/api/activity` `/api/problems/{id}/activity`
`/api/problems/{id}/reset` `/api/problems/{id}` (DELETE)

## 预置数据

100 道 LeetCode Hot 100 题目，`is_preset=1` 标记，不可删除。
