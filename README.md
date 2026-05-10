# LeetCode 遗忘曲线刷题工具

基于 SM-2 间隔重复算法（Anki 同款）的 LeetCode Hot 100 刷题计划工具。根据你每次复习的掌握程度自动安排下次复习时间，科学对抗遗忘曲线。

## 功能

- **今日任务** — 每天自动推荐新题 + 到期复习题，做完后评分（0-5）
- **题目总览** — Hot 100 预置数据，支持自定义添加/删除题目
- **间隔重复** — SM-2 算法自动计算复习间隔（精确到小时）
- **统计面板** — 进度环、连续打卡、每日刷题量、难度完成率
- **灵活配置** — 每日新题数、复习上限、已掌握标准均可自定义
- **活动日志** — 全局 + 单题操作记录
- **随机推荐** — 选择困难时随机挑一道
- **暗色模式** — 深夜刷题护眼

## 快速开始

```bash
# 1. 安装 uv
pip install uv

# 2. 构建前端
cd frontend
npm install
npm run build
cd ..

# 3. 启动
uv run uvicorn main:app --app-dir backend --host 0.0.0.0 --port 19999
```

浏览器访问 http://localhost:19999

## 项目结构

```
├── backend/              # Python FastAPI 后端
│   ├── main.py           # API 路由 + 静态文件服务
│   ├── database.py       # SQLite CRUD + Hot 100 数据
│   └── sm2.py            # SM-2 间隔重复算法
├── frontend/             # Vite + React + Tailwind 前端
│   ├── src/
│   │   ├── api/          # API 客户端
│   │   ├── components/   # 共享 UI 组件
│   │   ├── hooks/        # 自定义 hooks
│   │   ├── pages/        # 页面组件
│   │   └── App.tsx       # 根组件（路由）
│   ├── index.html
│   └── vite.config.ts
├── pyproject.toml        # uv 项目配置
└── leetcode_100.db       # SQLite 数据库（运行后自动生成）
```

## SM-2 评分标准

| 分数 | 含义 | 效果 |
|------|------|------|
| 0 | 完全不记得 | 明天重做 |
| 1 | 看到答案才想起来 | 明天重做 |
| 2 | 勉强回忆起来 | 明天重做 |
| 3 | 勉强答对，很吃力 | 间隔拉长 |
| 4 | 答对了，但有些犹豫 | 间隔拉长 |
| 5 | 非常轻松地答对 | 间隔大幅拉长 |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/today` | 今日待刷题目 |
| GET | `/api/problems` | 所有题目列表 |
| POST | `/api/problems` | 添加自定义题目 |
| DELETE | `/api/problems/{id}` | 删除自定义题目 |
| POST | `/api/review/{id}` | 提交复习评分 |
| POST | `/api/problems/{id}/reset` | 重置学习进度 |
| GET | `/api/stats` | 学习统计 |
| GET | `/api/activity` | 全局活动日志 |
| GET | `/api/problems/{id}/activity` | 单题活动日志 |
| GET | `/api/settings` | 获取设置 |
| PUT | `/api/settings` | 更新设置 |
