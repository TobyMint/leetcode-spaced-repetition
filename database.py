"""数据库初始化和操作。"""

from __future__ import annotations

import sqlite3
from datetime import date, datetime
from pathlib import Path

from sm2 import SM2State, calculate_next_review, get_status

DB_PATH = Path(__file__).parent / "leetcode_100.db"

# LeetCode Hot 100 预置数据
HOT_100 = [
    (1, "两数之和", "简单", "数组"),
    (2, "字母异位词分组", "中等", "数组"),
    (3, "最长连续序列", "中等", "数组"),
    (4, "移动零", "简单", "数组"),
    (5, "盛最多水的容器", "中等", "数组"),
    (6, "三数之和", "中等", "数组"),
    (7, "接雨水", "困难", "数组"),
    (8, "无重复字符的最长子串", "中等", "滑动窗口"),
    (9, "找到字符串中所有字母异位词", "中等", "滑动窗口"),
    (10, "和为 K 的子数组", "中等", "滑动窗口"),
    (11, "滑动窗口最大值", "困难", "滑动窗口"),
    (12, "最小覆盖子串", "困难", "滑动窗口"),
    (13, "最大子数组和", "中等", "子数组"),
    (14, "合并区间", "中等", "区间"),
    (15, "轮转数组", "中等", "数组"),
    (16, "除自身以外数组的乘积", "中等", "数组"),
    (17, "缺失的第一个正数", "困难", "数组"),
    (18, "矩阵置零", "中等", "矩阵"),
    (19, "螺旋矩阵", "中等", "矩阵"),
    (20, "旋转图像", "中等", "矩阵"),
    (21, "搜索二维矩阵 II", "中等", "矩阵"),
    (22, "相交链表", "简单", "链表"),
    (23, "反转链表", "简单", "链表"),
    (24, "回文链表", "简单", "链表"),
    (25, "环形链表", "简单", "链表"),
    (26, "环形链表 II", "中等", "链表"),
    (27, "合并两个有序链表", "简单", "链表"),
    (28, "两数相加", "中等", "链表"),
    (29, "删除链表的倒数第 N 个结点", "中等", "链表"),
    (30, "两两交换链表中的节点", "中等", "链表"),
    (31, "K 个一组翻转链表", "困难", "链表"),
    (32, "随机链表的复制", "中等", "链表"),
    (33, "排序链表", "中等", "链表"),
    (34, "合并 K 个升序链表", "困难", "链表"),
    (35, "LRU 缓存", "中等", "链表"),
    (36, "二叉树的中序遍历", "简单", "二叉树"),
    (37, "二叉树的最大深度", "简单", "二叉树"),
    (38, "翻转二叉树", "简单", "二叉树"),
    (39, "对称二叉树", "简单", "二叉树"),
    (40, "二叉树的直径", "简单", "二叉树"),
    (41, "二叉树的层序遍历", "中等", "二叉树"),
    (42, "将有序数组转换为二叉搜索树", "简单", "二叉搜索树"),
    (43, "验证二叉搜索树", "中等", "二叉搜索树"),
    (44, "二叉搜索树中第 K 小的元素", "中等", "二叉搜索树"),
    (45, "二叉树的右视图", "中等", "二叉树"),
    (46, "二叉树展开为链表", "中等", "二叉树"),
    (47, "从前序与中序遍历序列构造二叉树", "中等", "二叉树"),
    (48, "路径总和 III", "中等", "二叉树"),
    (49, "二叉树的最近公共祖先", "中等", "二叉树"),
    (50, "二叉树中的最大路径和", "困难", "二叉树"),
    (51, "岛屿数量", "中等", "图"),
    (52, "腐烂的橘子", "中等", "图"),
    (53, "课程表", "中等", "图"),
    (54, "实现 Trie (前缀树)", "中等", "Trie"),
    (55, "全排列", "中等", "回溯"),
    (56, "子集", "中等", "回溯"),
    (57, "电话号码的字母组合", "中等", "回溯"),
    (58, "组合总和", "中等", "回溯"),
    (59, "括号生成", "中等", "回溯"),
    (60, "单词搜索", "中等", "回溯"),
    (61, "分割回文串", "中等", "回溯"),
    (62, "N 皇后", "困难", "回溯"),
    (63, "搜索插入位置", "简单", "二分查找"),
    (64, "搜索二维矩阵", "中等", "二分查找"),
    (65, "在排序数组中查找元素的第一个和最后一个位置", "中等", "二分查找"),
    (66, "搜索旋转排序数组", "中等", "二分查找"),
    (67, "寻找旋转排序数组中的最小值", "中等", "二分查找"),
    (68, "寻找两个正序数组的中位数", "困难", "二分查找"),
    (69, "有效的括号", "简单", "栈"),
    (70, "最小栈", "中等", "栈"),
    (71, "字符串解码", "中等", "栈"),
    (72, "每日温度", "中等", "栈"),
    (73, "柱状图中最大的矩形", "困难", "栈"),
    (74, "数组中的第 K 个最大元素", "中等", "堆"),
    (75, "前 K 个高频元素", "中等", "堆"),
    (76, "数据流的中位数", "困难", "堆"),
    (77, "买卖股票的最佳时机", "简单", "贪心"),
    (78, "跳跃游戏", "中等", "贪心"),
    (79, "跳跃游戏 II", "中等", "贪心"),
    (80, "划分字母区间", "中等", "贪心"),
    (81, "爬楼梯", "简单", "动态规划"),
    (82, "杨辉三角", "简单", "动态规划"),
    (83, "打家劫舍", "中等", "动态规划"),
    (84, "完全平方数", "中等", "动态规划"),
    (85, "零钱兑换", "中等", "动态规划"),
    (86, "单词拆分", "中等", "动态规划"),
    (87, "最长递增子序列", "中等", "动态规划"),
    (88, "乘积最大子数组", "中等", "动态规划"),
    (89, "分割等和子集", "中等", "动态规划"),
    (90, "最长有效括号", "困难", "动态规划"),
    (91, "不同路径", "中等", "动态规划"),
    (92, "最小路径和", "中等", "动态规划"),
    (93, "最长回文子串", "中等", "动态规划"),
    (94, "最长公共子序列", "中等", "动态规划"),
    (95, "编辑距离", "中等", "动态规划"),
    (96, "只出现一次的数字", "简单", "位运算"),
    (97, "多数元素", "简单", "分治"),
    (98, "颜色分类", "中等", "排序"),
    (99, "下一个排列", "中等", "排序"),
    (100, "寻找重复数", "中等", "位运算"),
]

# 默认设置
DEFAULT_SETTINGS = {
    "new_per_day": "3",
    "max_review_per_day": "10",
    "mastered_consecutive": "5",
    "mastered_interval": "21",
}


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """初始化数据库，建表并导入 Hot 100 数据。"""
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS problems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            category TEXT,
            leetcode_url TEXT,
            is_preset INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS problem_state (
            problem_id INTEGER PRIMARY KEY,
            status TEXT DEFAULT 'new',
            ef REAL DEFAULT 2.5,
            consecutive_correct INTEGER DEFAULT 0,
            interval_days REAL DEFAULT 0,
            next_review TEXT,
            last_reviewed TEXT,
            FOREIGN KEY (problem_id) REFERENCES problems(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            problem_id INTEGER NOT NULL,
            reviewed_at TEXT NOT NULL,
            quality INTEGER NOT NULL,
            FOREIGN KEY (problem_id) REFERENCES problems(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    """)

    # 检查是否已导入 Hot 100
    count = conn.execute("SELECT COUNT(*) FROM problems WHERE is_preset = 1").fetchone()[0]
    if count == 0:
        conn.executemany(
            "INSERT INTO problems (id, title, difficulty, category, leetcode_url, is_preset) "
            "VALUES (?, ?, ?, ?, ?, 1)",
            [(pid, title, diff, cat, f"https://leetcode.cn/problems/") for pid, title, diff, cat in HOT_100],
        )
        # 为每道题初始化状态
        conn.executemany(
            "INSERT OR IGNORE INTO problem_state (problem_id) VALUES (?)",
            [(pid,) for pid, _, _, _ in HOT_100],
        )

    # 初始化默认设置
    for key, value in DEFAULT_SETTINGS.items():
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )

    conn.commit()
    conn.close()


def get_all_problems() -> list[dict]:
    """获取所有题目（含状态）。"""
    conn = get_conn()
    rows = conn.execute("""
        SELECT p.id, p.title, p.difficulty, p.category, p.leetcode_url, p.is_preset,
               s.status, s.ef, s.consecutive_correct, s.interval_days,
               s.next_review, s.last_reviewed
        FROM problems p
        LEFT JOIN problem_state s ON p.id = s.problem_id
        ORDER BY p.id
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_problem(problem_id: int) -> dict | None:
    conn = get_conn()
    row = conn.execute("""
        SELECT p.id, p.title, p.difficulty, p.category, p.leetcode_url, p.is_preset,
               s.status, s.ef, s.consecutive_correct, s.interval_days,
               s.next_review, s.last_reviewed
        FROM problems p
        LEFT JOIN problem_state s ON p.id = s.problem_id
        WHERE p.id = ?
    """, (problem_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_today_problems(new_per_day: int = 3, max_review: int = 10) -> dict:
    """获取今日待刷题目。返回 {'new': [...], 'review': [...]}。"""
    today = date.today().isoformat()
    conn = get_conn()

    # 新题
    new_problems = conn.execute("""
        SELECT p.id, p.title, p.difficulty, p.category
        FROM problems p
        JOIN problem_state s ON p.id = s.problem_id
        WHERE s.status = 'new'
        ORDER BY p.id
        LIMIT ?
    """, (new_per_day,)).fetchall()

    # 到期复习题
    review_problems = conn.execute("""
        SELECT p.id, p.title, p.difficulty, p.category
        FROM problems p
        JOIN problem_state s ON p.id = s.problem_id
        WHERE s.status != 'new' AND s.next_review IS NOT NULL AND s.next_review <= ?
        ORDER BY s.next_review
        LIMIT ?
    """, (today, max_review)).fetchall()

    conn.close()
    return {
        "new": [dict(r) for r in new_problems],
        "review": [dict(r) for r in review_problems],
    }


def submit_review(problem_id: int, quality: int) -> dict:
    """提交复习评分，更新状态。"""
    conn = get_conn()
    today = date.today()

    # 当前状态
    row = conn.execute(
        "SELECT ef, consecutive_correct, interval_days FROM problem_state WHERE problem_id = ?",
        (problem_id,),
    ).fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Problem {problem_id} not found")

    state = SM2State(
        ef=row["ef"],
        interval=row["interval_days"],
        consecutive=row["consecutive_correct"],
    )
    new_state = calculate_next_review(state, quality, today)
    new_status = get_status(new_state.consecutive, new_state.interval, new_state.ef)

    # 更新状态
    conn.execute("""
        UPDATE problem_state SET
            status = ?,
            ef = ?,
            consecutive_correct = ?,
            interval_days = ?,
            next_review = ?,
            last_reviewed = ?
        WHERE problem_id = ?
    """, (
        new_status, new_state.ef, new_state.consecutive,
        new_state.interval, new_state.next_review.isoformat(), today.isoformat(),
        problem_id,
    ))

    # 记录复习
    conn.execute(
        "INSERT INTO reviews (problem_id, reviewed_at, quality) VALUES (?, ?, ?)",
        (problem_id, datetime.now().isoformat(), quality),
    )

    conn.commit()
    conn.close()

    return {
        "status": new_status,
        "next_review": new_state.next_review.isoformat(),
        "ef": round(new_state.ef, 2),
        "interval": new_state.interval,
        "consecutive": new_state.consecutive,
    }


def add_problem(title: str, difficulty: str, category: str = "", url: str = "") -> dict:
    """用户手动添加新题目。"""
    conn = get_conn()
    cursor = conn.execute(
        "INSERT INTO problems (title, difficulty, category, leetcode_url, is_preset) VALUES (?, ?, ?, ?, 0)",
        (title, difficulty, category, url),
    )
    problem_id = cursor.lastrowid
    conn.execute(
        "INSERT INTO problem_state (problem_id) VALUES (?)",
        (problem_id,),
    )
    conn.commit()
    conn.close()
    return {"id": problem_id, "title": title, "difficulty": difficulty, "category": category}


def delete_problem(problem_id: int) -> bool:
    """删除用户添加的题目（预置题目不可删除）。"""
    conn = get_conn()
    row = conn.execute("SELECT is_preset FROM problems WHERE id = ?", (problem_id,)).fetchone()
    if not row or row["is_preset"]:
        conn.close()
        return False
    conn.execute("DELETE FROM reviews WHERE problem_id = ?", (problem_id,))
    conn.execute("DELETE FROM problem_state WHERE problem_id = ?", (problem_id,))
    conn.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
    conn.commit()
    conn.close()
    return True


def get_stats() -> dict:
    """统计数据。"""
    conn = get_conn()

    # 各状态计数
    counts = {}
    for status in ("new", "learning", "review", "mastered"):
        row = conn.execute(
            "SELECT COUNT(*) FROM problem_state WHERE status = ?", (status,)
        ).fetchone()
        counts[status] = row[0]
    counts["total"] = sum(counts.values())

    # 今日复习数
    today = date.today().isoformat()
    today_count = conn.execute(
        "SELECT COUNT(DISTINCT problem_id) FROM reviews WHERE reviewed_at LIKE ?",
        (f"{today}%",),
    ).fetchone()[0]

    # 连续打卡天数
    streak = _calc_streak(conn)

    # 最近 7 天每天的复习数
    daily = conn.execute("""
        SELECT DATE(reviewed_at) as day, COUNT(DISTINCT problem_id) as cnt
        FROM reviews
        WHERE reviewed_at >= DATE('now', '-7 days')
        GROUP BY day
        ORDER BY day
    """).fetchall()

    # 各难度完成率
    difficulty_stats = {}
    for diff in ("简单", "中等", "困难"):
        total = conn.execute(
            "SELECT COUNT(*) FROM problems WHERE difficulty = ?", (diff,)
        ).fetchone()[0]
        done = conn.execute("""
            SELECT COUNT(*) FROM problems p
            JOIN problem_state s ON p.id = s.problem_id
            WHERE p.difficulty = ? AND s.status IN ('review', 'mastered')
        """, (diff,)).fetchone()[0]
        difficulty_stats[diff] = {"total": total, "done": done}

    conn.close()

    return {
        "counts": counts,
        "today_reviewed": today_count,
        "streak": streak,
        "daily": [dict(r) for r in daily],
        "difficulty": difficulty_stats,
    }


def _calc_streak(conn: sqlite3.Connection) -> int:
    """计算连续打卡天数。"""
    rows = conn.execute("""
        SELECT DISTINCT DATE(reviewed_at) as day
        FROM reviews
        ORDER BY day DESC
    """).fetchall()

    if not rows:
        return 0

    streak = 0
    current = date.today()
    for row in rows:
        row_date = date.fromisoformat(row["day"])
        if row_date == current:
            streak += 1
            current = current.replace(day=current.day) - __import__("datetime").timedelta(days=1)
        elif row_date < current:
            break

    return streak


def get_calendar_data() -> list[dict]:
    """日历视图数据。"""
    conn = get_conn()
    rows = conn.execute("""
        SELECT DATE(r.reviewed_at) as day,
               GROUP_CONCAT(p.title) as problems,
               COUNT(DISTINCT r.problem_id) as count
        FROM reviews r
        JOIN problems p ON r.problem_id = p.id
        GROUP BY day
        ORDER BY day DESC
        LIMIT 90
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_settings() -> dict:
    conn = get_conn()
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}


def update_settings(settings: dict) -> dict:
    conn = get_conn()
    for key, value in settings.items():
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, str(value)),
        )
    conn.commit()
    conn.close()
    return get_settings()


def mark_as_known(problem_id: int) -> bool:
    """手动标记题目为已掌握（初始化已有进度）。"""
    conn = get_conn()
    row = conn.execute("SELECT problem_id FROM problem_state WHERE problem_id = ?", (problem_id,)).fetchone()
    if not row:
        conn.close()
        return False
    today = date.today()
    conn.execute("""
        UPDATE problem_state SET
            status = 'mastered',
            ef = 2.5,
            consecutive_correct = 5,
            interval_days = 21,
            next_review = ?,
            last_reviewed = ?
        WHERE problem_id = ?
    """, ((today.replace(day=today.day + 21) if today.day <= 10 else today).isoformat(), today.isoformat(), problem_id))
    conn.commit()
    conn.close()
    return True
