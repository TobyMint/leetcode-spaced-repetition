# LeetCode 遗忘曲线刷题工具

基于 SM-2 间隔重复算法的刷题计划工具，帮助科学安排 LeetCode Hot 100 复习节奏。

## 技术栈

- 后端: Python + FastAPI，入口 `main.py`，端口 19999
- 前端: 原生 HTML/JS SPA，Tailwind CSS CDN，`static/` 目录
- 数据库: SQLite，文件 `leetcode_100.db`（运行后自动生成）
- 包管理: uv，`uv run main.py` 启动，`pyproject.toml` 管理依赖

## 关键文件

| 文件 | 作用 |
|------|------|
| `main.py` | FastAPI 全部路由，CORS 中间件 |
| `database.py` | SQLite CRUD + Hot 100 预置数据 |
| `sm2.py` | SM-2 算法：根据评分(0-5)计算下次复习日期 |
| `static/app.js` | 前端 SPA：路由、API 调用、页面渲染 |
| `static/index.html` | 入口 HTML（四页导航） |
| `static/style.css` | 自定义样式和动画特效 |

## 前端注意事项

- 所有 JS 函数必须在 `window` scope 可访问（inline onclick/onchange 依赖）
- `window.filterState` 记忆筛选下拉框的选择状态
- 页面切换通过 `router.go('today'|'problems'|'stats'|'settings')` 和 `render()` 实现
- Tailwind 通过 CDN 引入，不要移除

## API 端点

`/api/today` `/api/problems` `/api/review/{id}` `/api/stats` `/api/settings` `/api/calendar`

## 预置数据

100 道 LeetCode Hot 100 题目，含题名、难度、分类。`is_preset=1` 标记，不可删除。
