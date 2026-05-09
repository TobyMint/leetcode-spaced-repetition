# LeetCode 遗忘曲线刷题工具

基于 SM-2 间隔重复算法（Anki 同款）的 LeetCode Hot 100 刷题计划工具。根据你每次复习的掌握程度自动安排下次复习时间，科学对抗遗忘曲线。

## 功能

- **今日任务** — 每天自动推荐新题 + 到期复习题，做完后评分（0-5）
- **题目总览** — Hot 100 预置数据，支持自定义添加/删除题目
- **间隔重复** — SM-2 算法自动计算复习间隔
- **统计面板** — 进度环、连续打卡、每日刷题量、难度完成率
- **灵活配置** — 每日新题数、复习上限、已掌握标准均可自定义

## 快速开始

### 安装 uv

```bash
pip install uv
```

### 运行

```bash
cd leetcode-spaced-repetition
uv run main.py
```

浏览器访问 http://localhost:19999

uv 会自动创建虚拟环境、安装依赖，无需手动操作。

## 项目结构

```
├── main.py              # FastAPI 后端入口
├── database.py          # 数据库操作 + Hot 100 数据
├── sm2.py               # SM-2 间隔重复算法
├── pyproject.toml       # 项目配置（uv 使用）
├── static/
│   ├── index.html       # 前端页面
│   ├── app.js           # 前端逻辑
│   └── style.css        # 样式
└── leetcode_100.db      # SQLite 数据库（运行后自动生成）
```

## SM-2 评分标准

每次做完题后给自己打分：

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
| POST | `/api/problems/{id}/mark-known` | 标记已掌握 |
| GET | `/api/stats` | 学习统计 |
| GET | `/api/settings` | 获取设置 |
| PUT | `/api/settings` | 更新设置 |
