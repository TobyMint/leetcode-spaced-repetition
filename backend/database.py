"""数据库初始化和操作。"""

from __future__ import annotations

import sqlite3
from collections.abc import Callable
from datetime import date, datetime, timedelta
from pathlib import Path

from scheduler import next_review_after, ema_quality, competence

# 优先使用项目根目录的数据库（旧位置兼容），其次 backend/ 下
_ROOT_DB = Path(__file__).parent.parent / "leetcode_100.db"
_BACKEND_DB = Path(__file__).parent / "leetcode_100.db"
DB_PATH = _ROOT_DB if _ROOT_DB.exists() else _BACKEND_DB

# LeetCode Hot 100 预置数据 (id, title, difficulty, category, slug)
HOT_100 = [
    (1, "两数之和", "简单", "数组", "two-sum"),
    (2, "字母异位词分组", "中等", "数组", "group-anagrams"),
    (3, "最长连续序列", "中等", "数组", "longest-consecutive-sequence"),
    (4, "移动零", "简单", "数组", "move-zeroes"),
    (5, "盛最多水的容器", "中等", "数组", "container-with-most-water"),
    (6, "三数之和", "中等", "数组", "3sum"),
    (7, "接雨水", "困难", "数组", "trapping-rain-water"),
    (8, "无重复字符的最长子串", "中等", "滑动窗口", "longest-substring-without-repeating-characters"),
    (9, "找到字符串中所有字母异位词", "中等", "滑动窗口", "find-all-anagrams-in-a-string"),
    (10, "和为 K 的子数组", "中等", "滑动窗口", "subarray-sum-equals-k"),
    (11, "滑动窗口最大值", "困难", "滑动窗口", "sliding-window-maximum"),
    (12, "最小覆盖子串", "困难", "滑动窗口", "minimum-window-substring"),
    (13, "最大子数组和", "中等", "子数组", "maximum-subarray"),
    (14, "合并区间", "中等", "区间", "merge-intervals"),
    (15, "轮转数组", "中等", "数组", "rotate-array"),
    (16, "除了自身以外数组的乘积", "中等", "数组", "product-of-array-except-self"),
    (17, "缺失的第一个正数", "困难", "数组", "first-missing-positive"),
    (18, "矩阵置零", "中等", "矩阵", "set-matrix-zeroes"),
    (19, "螺旋矩阵", "中等", "矩阵", "spiral-matrix"),
    (20, "旋转图像", "中等", "矩阵", "rotate-image"),
    (21, "搜索二维矩阵 II", "中等", "矩阵", "search-a-2d-matrix-ii"),
    (22, "相交链表", "简单", "链表", "intersection-of-two-linked-lists"),
    (23, "反转链表", "简单", "链表", "reverse-linked-list"),
    (24, "回文链表", "简单", "链表", "palindrome-linked-list"),
    (25, "环形链表", "简单", "链表", "linked-list-cycle"),
    (26, "环形链表 II", "中等", "链表", "linked-list-cycle-ii"),
    (27, "合并两个有序链表", "简单", "链表", "merge-two-sorted-lists"),
    (28, "两数相加", "中等", "链表", "add-two-numbers"),
    (29, "删除链表的倒数第 N 个结点", "中等", "链表", "remove-nth-node-from-end-of-list"),
    (30, "两两交换链表中的节点", "中等", "链表", "swap-nodes-in-pairs"),
    (31, "K 个一组翻转链表", "困难", "链表", "reverse-nodes-in-k-group"),
    (32, "随机链表的复制", "中等", "链表", "copy-list-with-random-pointer"),
    (33, "排序链表", "中等", "链表", "sort-list"),
    (34, "合并 K 个升序链表", "困难", "链表", "merge-k-sorted-lists"),
    (35, "LRU 缓存", "中等", "链表", "lru-cache"),
    (36, "二叉树的中序遍历", "简单", "二叉树", "binary-tree-inorder-traversal"),
    (37, "二叉树的最大深度", "简单", "二叉树", "maximum-depth-of-binary-tree"),
    (38, "翻转二叉树", "简单", "二叉树", "invert-binary-tree"),
    (39, "对称二叉树", "简单", "二叉树", "symmetric-tree"),
    (40, "二叉树的直径", "简单", "二叉树", "diameter-of-binary-tree"),
    (41, "二叉树的层序遍历", "中等", "二叉树", "binary-tree-level-order-traversal"),
    (42, "将有序数组转换为二叉搜索树", "简单", "二叉搜索树", "convert-sorted-array-to-binary-search-tree"),
    (43, "验证二叉搜索树", "中等", "二叉搜索树", "validate-binary-search-tree"),
    (44, "二叉搜索树中第 K 小的元素", "中等", "二叉搜索树", "kth-smallest-element-in-a-bst"),
    (45, "二叉树的右视图", "中等", "二叉树", "binary-tree-right-side-view"),
    (46, "二叉树展开为链表", "中等", "二叉树", "flatten-binary-tree-to-linked-list"),
    (47, "从前序与中序遍历序列构造二叉树", "中等", "二叉树", "construct-binary-tree-from-preorder-and-inorder-traversal"),
    (48, "路径总和 III", "中等", "二叉树", "path-sum-iii"),
    (49, "二叉树的最近公共祖先", "中等", "二叉树", "lowest-common-ancestor-of-a-binary-tree"),
    (50, "二叉树中的最大路径和", "困难", "二叉树", "binary-tree-maximum-path-sum"),
    (51, "岛屿数量", "中等", "图", "number-of-islands"),
    (52, "腐烂的橘子", "中等", "图", "rotting-oranges"),
    (53, "课程表", "中等", "图", "course-schedule"),
    (54, "实现 Trie (前缀树)", "中等", "Trie", "implement-trie-prefix-tree"),
    (55, "全排列", "中等", "回溯", "permutations"),
    (56, "子集", "中等", "回溯", "subsets"),
    (57, "电话号码的字母组合", "中等", "回溯", "letter-combinations-of-a-phone-number"),
    (58, "组合总和", "中等", "回溯", "combination-sum"),
    (59, "括号生成", "中等", "回溯", "generate-parentheses"),
    (60, "单词搜索", "中等", "回溯", "word-search"),
    (61, "分割回文串", "中等", "回溯", "palindrome-partitioning"),
    (62, "N 皇后", "困难", "回溯", "n-queens"),
    (63, "搜索插入位置", "简单", "二分查找", "search-insert-position"),
    (64, "搜索二维矩阵", "中等", "二分查找", "search-a-2d-matrix"),
    (65, "在排序数组中查找元素的第一个和最后一个位置", "中等", "二分查找", "find-first-and-last-position-of-element-in-sorted-array"),
    (66, "搜索旋转排序数组", "中等", "二分查找", "search-in-rotated-sorted-array"),
    (67, "寻找旋转排序数组中的最小值", "中等", "二分查找", "find-minimum-in-rotated-sorted-array"),
    (68, "寻找两个正序数组的中位数", "困难", "二分查找", "median-of-two-sorted-arrays"),
    (69, "有效的括号", "简单", "栈", "valid-parentheses"),
    (70, "最小栈", "中等", "栈", "min-stack"),
    (71, "字符串解码", "中等", "栈", "decode-string"),
    (72, "每日温度", "中等", "栈", "daily-temperatures"),
    (73, "柱状图中最大的矩形", "困难", "栈", "largest-rectangle-in-histogram"),
    (74, "数组中的第 K 个最大元素", "中等", "堆", "kth-largest-element-in-an-array"),
    (75, "前 K 个高频元素", "中等", "堆", "top-k-frequent-elements"),
    (76, "数据流的中位数", "困难", "堆", "find-median-from-data-stream"),
    (77, "买卖股票的最佳时机", "简单", "贪心", "best-time-to-buy-and-sell-stock"),
    (78, "跳跃游戏", "中等", "贪心", "jump-game"),
    (79, "跳跃游戏 II", "中等", "贪心", "jump-game-ii"),
    (80, "划分字母区间", "中等", "贪心", "partition-labels"),
    (81, "爬楼梯", "简单", "动态规划", "climbing-stairs"),
    (82, "杨辉三角", "简单", "动态规划", "pascals-triangle"),
    (83, "打家劫舍", "中等", "动态规划", "house-robber"),
    (84, "完全平方数", "中等", "动态规划", "perfect-squares"),
    (85, "零钱兑换", "中等", "动态规划", "coin-change"),
    (86, "单词拆分", "中等", "动态规划", "word-break"),
    (87, "最长递增子序列", "中等", "动态规划", "longest-increasing-subsequence"),
    (88, "乘积最大子数组", "中等", "动态规划", "maximum-product-subarray"),
    (89, "分割等和子集", "中等", "动态规划", "partition-equal-subset-sum"),
    (90, "最长有效括号", "困难", "动态规划", "longest-valid-parentheses"),
    (91, "不同路径", "中等", "动态规划", "unique-paths"),
    (92, "最小路径和", "中等", "动态规划", "minimum-path-sum"),
    (93, "最长回文子串", "中等", "动态规划", "longest-palindromic-substring"),
    (94, "最长公共子序列", "中等", "动态规划", "longest-common-subsequence"),
    (95, "编辑距离", "中等", "动态规划", "edit-distance"),
    (96, "只出现一次的数字", "简单", "位运算", "single-number"),
    (97, "多数元素", "简单", "分治", "majority-element"),
    (98, "颜色分类", "中等", "排序", "sort-colors"),
    (99, "下一个排列", "中等", "排序", "next-permutation"),
    (100, "寻找重复数", "中等", "位运算", "find-the-duplicate-number"),
]

# 默认设置
DEFAULT_SETTINGS = {
    "daily_quota": "7",
    "global_round": "1",
}


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _get_db_version(conn: sqlite3.Connection) -> int:
    row = conn.execute("SELECT value FROM db_meta WHERE key = 'version'").fetchone()
    return int(row["value"]) if row else 0


def _set_db_version(conn: sqlite3.Connection, version: int) -> None:
    conn.execute("INSERT OR REPLACE INTO db_meta (key, value) VALUES ('version', ?)", (str(version),))


def _migrate_v1(conn: sqlite3.Connection) -> None:
    """迁移：更新预置题目的 URL（兼容旧数据库无真实链接的情况）。"""
    for pid, _, _, _, slug in HOT_100:
        conn.execute(
            "UPDATE problems SET leetcode_url = ? WHERE id = ? AND is_preset = 1",
            (f"https://leetcode.cn/problems/{slug}/", pid),
        )
    conn.commit()


def _migrate_v2(conn: sqlite3.Connection) -> None:
    """迁移：为旧数据库添加 notes、code 列。"""
    for col in ("notes", "code"):
        try:
            conn.execute(f"ALTER TABLE problem_state ADD COLUMN {col} TEXT DEFAULT ''")
        except sqlite3.OperationalError:
            pass
    conn.commit()


def _migrate_v3(conn: sqlite3.Connection) -> None:
    """迁移：修正题目名称。"""
    conn.execute(
        "UPDATE problems SET title = '除了自身以外数组的乘积' WHERE id = 16 AND title = '除自身以外数组的乘积'"
    )
    conn.commit()


def _migrate_v4(conn: sqlite3.Connection) -> None:
    """迁移：轮次+优先级调度，替换 SM-2 字段。"""
    for col, col_type in [
        ("round", "INTEGER DEFAULT 0"),
        ("total_reviews", "INTEGER DEFAULT 0"),
        ("avg_quality", "REAL DEFAULT 0.0"),
    ]:
        try:
            conn.execute(f"ALTER TABLE problem_state ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass

    # 旧数据库的状态映射：把旧 status 转成 competence 相关字段
    # 已掌握（mastered）的题给一个较高的初始 avg_quality
    conn.execute("""
        UPDATE problem_state SET avg_quality = 4.5
        WHERE status = 'mastered' AND (total_reviews IS NULL OR total_reviews = 0)
    """)
    # 所有旧行补默认值（含 ALTER TABLE 后遗留的 NULL）
    conn.execute("""
        UPDATE problem_state SET round = 0, total_reviews = 0
        WHERE round IS NULL OR total_reviews IS NULL
    """)
    conn.execute("""
        UPDATE problem_state SET avg_quality = 0.0
        WHERE avg_quality IS NULL
    """)

    # 清理旧设置，写入新设置
    conn.execute("DELETE FROM settings WHERE key IN ('new_per_day', 'max_review_per_day', 'mastered_consecutive', 'mastered_interval')")
    for key, value in [("daily_quota", "7"), ("global_round", "1")]:
        conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, value))

    conn.commit()


def _migrate_v5(conn: sqlite3.Connection) -> None:
    """迁移：兜底修复 v4 遗留的 NULL 值。"""
    conn.execute("UPDATE problem_state SET round = 0 WHERE round IS NULL")
    conn.execute("UPDATE problem_state SET total_reviews = 0 WHERE total_reviews IS NULL")
    conn.execute("UPDATE problem_state SET avg_quality = 0.0 WHERE avg_quality IS NULL")
    conn.commit()


MIGRATIONS: list[tuple[int, Callable[[sqlite3.Connection], None]]] = [
    (1, _migrate_v1),
    (2, _migrate_v2),
    (3, _migrate_v3),
    (4, _migrate_v4),
    (5, _migrate_v5),
]


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
            notes TEXT DEFAULT '',
            code TEXT DEFAULT '',
            round INTEGER DEFAULT 0,
            total_reviews INTEGER DEFAULT 0,
            avg_quality REAL DEFAULT 0.0,
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

        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            problem_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            detail TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (problem_id) REFERENCES problems(id)
        );

        CREATE TABLE IF NOT EXISTS db_meta (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    """)

    # 检查是否已导入 Hot 100
    count = conn.execute("SELECT COUNT(*) FROM problems WHERE is_preset = 1").fetchone()[0]
    if count == 0:
        conn.executemany(
            "INSERT INTO problems (id, title, difficulty, category, leetcode_url, is_preset) "
            "VALUES (?, ?, ?, ?, ?, 1)",
            [(pid, title, diff, cat, f"https://leetcode.cn/problems/{slug}/") for pid, title, diff, cat, slug in HOT_100],
        )
        conn.executemany(
            "INSERT OR IGNORE INTO problem_state (problem_id) VALUES (?)",
            [(pid,) for pid, _, _, _, _ in HOT_100],
        )

    # 初始化默认设置
    for key, value in DEFAULT_SETTINGS.items():
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )

    # 执行待处理的 migration
    current = _get_db_version(conn)
    for version, migrate_fn in MIGRATIONS:
        if version > current:
            migrate_fn(conn)
            _set_db_version(conn, version)

    conn.commit()
    conn.close()


def get_all_problems() -> list[dict]:
    """获取所有题目（含状态）。"""
    conn = get_conn()
    rows = conn.execute("""
        SELECT p.id, p.title, p.difficulty, p.category, p.leetcode_url, p.is_preset,
               s.next_review, s.last_reviewed, s.notes, s.code,
               s.round, s.total_reviews, s.avg_quality
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
               s.next_review, s.last_reviewed, s.notes, s.code,
               s.round, s.total_reviews, s.avg_quality
        FROM problems p
        LEFT JOIN problem_state s ON p.id = s.problem_id
        WHERE p.id = ?
    """, (problem_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_today_problems(daily_quota: int = 7) -> dict:
    """获取今日待刷题目：先本轮的未做题，再到期复习题，弱题优先。"""
    now = datetime.now().isoformat()
    conn = get_conn()

    global_round = int(_get_setting(conn, "global_round", "1"))

    # 本轮未做过（round < global_round）且在队列中（next_review <= now 或从未做过）的题目
    # 按 avg_quality 升序（弱题优先），next_review 升序
    rows = conn.execute("""
        SELECT p.id, p.title, p.difficulty, p.category, p.leetcode_url,
               s.next_review, s.round, s.total_reviews, s.avg_quality
        FROM problems p
        JOIN problem_state s ON p.id = s.problem_id
        WHERE (s.next_review IS NULL OR s.next_review <= ?)
        ORDER BY
            CASE WHEN s.round < ? THEN 0 ELSE 1 END,
            s.avg_quality ASC,
            s.next_review ASC NULLS FIRST
        LIMIT ?
    """, (now, global_round, daily_quota)).fetchall()

    conn.close()

    queue = [dict(r) for r in rows]
    return {
        "queue": queue,
        "global_round": global_round,
        "quota": daily_quota,
        "done_today": _today_done_count(),
    }


def _today_done_count() -> int:
    conn = get_conn()
    now = datetime.now()
    cnt = conn.execute(
        "SELECT COUNT(DISTINCT problem_id) FROM reviews WHERE reviewed_at >= ? AND reviewed_at < ?",
        (now.strftime("%Y-%m-%dT00:00:00"), (now + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")),
    ).fetchone()[0]
    conn.close()
    return cnt


def submit_review(problem_id: int, quality: int) -> dict:
    """提交复习评分，更新状态。"""
    conn = get_conn()
    now = datetime.now()

    row = conn.execute(
        "SELECT avg_quality, total_reviews FROM problem_state WHERE problem_id = ?",
        (problem_id,),
    ).fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Problem {problem_id} not found")

    old_avg = row["avg_quality"] or 0.0
    old_total = row["total_reviews"] or 0

    new_avg = ema_quality(old_avg, quality)
    new_total = old_total + 1
    new_next = next_review_after(quality, now)
    global_round = int(_get_setting(conn, "global_round", "1"))

    conn.execute("""
        UPDATE problem_state SET
            avg_quality = ?,
            total_reviews = ?,
            next_review = ?,
            last_reviewed = ?,
            round = ?
        WHERE problem_id = ?
    """, (new_avg, new_total, new_next.isoformat(), now.isoformat(), global_round, problem_id))

    # 记录复习
    conn.execute(
        "INSERT INTO reviews (problem_id, reviewed_at, quality) VALUES (?, ?, ?)",
        (problem_id, now.isoformat(), quality),
    )
    conn.execute(
        "INSERT INTO activity_log (problem_id, action, detail, created_at) VALUES (?, 'review', ?, ?)",
        (problem_id, f"评分 {quality}", now.isoformat()),
    )

    # 检查本轮是否完成
    _check_round_complete(conn, global_round)

    conn.commit()
    conn.close()

    return {
        "competence": competence(new_avg, new_total),
        "next_review": new_next.isoformat(),
        "avg_quality": new_avg,
        "total_reviews": new_total,
        "round": global_round,
    }


def _check_round_complete(conn: sqlite3.Connection, global_round: int) -> None:
    """检查当前轮是否全部完成，是则进入下一轮。"""
    total = conn.execute("SELECT COUNT(*) FROM problems").fetchone()[0]
    done = conn.execute(
        "SELECT COUNT(*) FROM problem_state WHERE round = ?", (global_round,)
    ).fetchone()[0]
    if done >= total:
        conn.execute(
            "UPDATE settings SET value = ? WHERE key = 'global_round'",
            (str(global_round + 1),),
        )


def get_round_progress() -> dict:
    """获取当前轮次进度。"""
    conn = get_conn()
    global_round = int(_get_setting(conn, "global_round", "1"))
    total = conn.execute("SELECT COUNT(*) FROM problems").fetchone()[0]
    done = conn.execute(
        "SELECT COUNT(*) FROM problem_state WHERE round = ?", (global_round,)
    ).fetchone()[0]
    conn.close()
    return {
        "global_round": global_round,
        "done": done,
        "total": total,
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
    conn.execute(
        "INSERT INTO activity_log (problem_id, action, detail, created_at) VALUES (?, 'add', ?, datetime('now', 'localtime'))",
        (problem_id, f"添加题目：{title}（{difficulty}）"),
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
    conn.execute("DELETE FROM activity_log WHERE problem_id = ?", (problem_id,))
    conn.execute("DELETE FROM reviews WHERE problem_id = ?", (problem_id,))
    conn.execute("DELETE FROM problem_state WHERE problem_id = ?", (problem_id,))
    conn.execute("DELETE FROM problems WHERE id = ?", (problem_id,))
    conn.commit()
    conn.close()
    return True


def get_stats() -> dict:
    """统计数据。"""
    conn = get_conn()

    # 掌握程度分布
    comp_counts = {}
    for c_level in ("new", "weak", "medium", "strong"):
        if c_level == "new":
            cnt = conn.execute(
                "SELECT COUNT(*) FROM problem_state WHERE total_reviews = 0"
            ).fetchone()[0]
        elif c_level == "weak":
            cnt = conn.execute(
                "SELECT COUNT(*) FROM problem_state WHERE total_reviews > 0 AND avg_quality < 2.5"
            ).fetchone()[0]
        elif c_level == "medium":
            cnt = conn.execute(
                "SELECT COUNT(*) FROM problem_state WHERE total_reviews > 0 AND avg_quality >= 2.5 AND avg_quality < 4.0"
            ).fetchone()[0]
        else:
            cnt = conn.execute(
                "SELECT COUNT(*) FROM problem_state WHERE total_reviews > 0 AND avg_quality >= 4.0"
            ).fetchone()[0]
        comp_counts[c_level] = cnt
    comp_counts["total"] = sum(comp_counts.values())

    # 今日复习数
    now = datetime.now()
    today_count = conn.execute(
        "SELECT COUNT(DISTINCT problem_id) FROM reviews WHERE reviewed_at >= ? AND reviewed_at < ?",
        (now.strftime("%Y-%m-%dT00:00:00"), (now + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")),
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

    # 各难度覆盖
    difficulty_stats = {}
    for diff in ("简单", "中等", "困难"):
        total = conn.execute(
            "SELECT COUNT(*) FROM problems WHERE difficulty = ?", (diff,)
        ).fetchone()[0]
        done = conn.execute("""
            SELECT COUNT(*) FROM problems p
            JOIN problem_state s ON p.id = s.problem_id
            WHERE p.difficulty = ? AND s.total_reviews > 0
        """, (diff,)).fetchone()[0]
        difficulty_stats[diff] = {"total": total, "done": done}

    # 轮次进度
    global_round = int(_get_setting(conn, "global_round", "1"))
    round_total = conn.execute("SELECT COUNT(*) FROM problems").fetchone()[0]
    round_done = conn.execute(
        "SELECT COUNT(*) FROM problem_state WHERE round = ?", (global_round,)
    ).fetchone()[0]

    conn.close()

    return {
        "counts": comp_counts,
        "today_reviewed": today_count,
        "streak": streak,
        "daily": [dict(r) for r in daily],
        "difficulty": difficulty_stats,
        "global_round": global_round,
        "round_done": round_done,
        "round_total": round_total,
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
            current = current - timedelta(days=1)
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


def _get_setting(conn: sqlite3.Connection, key: str, default: str = "") -> str:
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


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


def reset_progress(problem_id: int) -> bool:
    """重置题目进度。"""
    conn = get_conn()
    row = conn.execute("SELECT problem_id FROM problem_state WHERE problem_id = ?", (problem_id,)).fetchone()
    if not row:
        conn.close()
        return False
    conn.execute("""
        UPDATE problem_state SET
            avg_quality = 0.0,
            total_reviews = 0,
            round = 0,
            next_review = NULL,
            last_reviewed = NULL
        WHERE problem_id = ?
    """, (problem_id,))
    conn.execute("DELETE FROM reviews WHERE problem_id = ?", (problem_id,))
    conn.execute(
        "INSERT INTO activity_log (problem_id, action, detail, created_at) VALUES (?, 'reset', '重置进度', datetime('now', 'localtime'))",
        (problem_id,),
    )
    conn.commit()
    conn.close()
    return True


def log_activity(problem_id: int, action: str, detail: str = "") -> None:
    """记录一条活动日志。"""
    from datetime import datetime
    conn = get_conn()
    conn.execute(
        "INSERT INTO activity_log (problem_id, action, detail, created_at) VALUES (?, ?, ?, ?)",
        (problem_id, action, detail, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def get_activity_log(limit: int = 20, offset: int = 0) -> dict:
    """获取活动日志，按时间倒序，支持分页。"""
    conn = get_conn()
    total = conn.execute("SELECT COUNT(*) FROM activity_log").fetchone()[0]
    rows = conn.execute("""
        SELECT a.id, a.problem_id, a.action, a.detail, a.created_at,
               p.title, p.leetcode_url
        FROM activity_log a
        JOIN problems p ON a.problem_id = p.id
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset)).fetchall()
    conn.close()
    return {"logs": [dict(r) for r in rows], "total": total}


def get_problem_activity(problem_id: int, limit: int = 50) -> list[dict]:
    """获取特定题目的活动日志。"""
    conn = get_conn()
    rows = conn.execute("""
        SELECT a.id, a.action, a.detail, a.created_at
        FROM activity_log a
        WHERE a.problem_id = ?
        ORDER BY a.created_at DESC
        LIMIT ?
    """, (problem_id, limit)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_problem_notes(problem_id: int) -> dict:
    """获取题目的笔记和代码。"""
    conn = get_conn()
    row = conn.execute(
        "SELECT notes, code FROM problem_state WHERE problem_id = ?",
        (problem_id,),
    ).fetchone()
    conn.close()
    return {"notes": row["notes"] or "", "code": row["code"] or ""} if row else {"notes": "", "code": ""}


def save_problem_notes(problem_id: int, notes: str = "", code: str = "") -> bool:
    """保存题目的笔记和/或代码。"""
    conn = get_conn()
    row = conn.execute("SELECT problem_id FROM problem_state WHERE problem_id = ?", (problem_id,)).fetchone()
    if not row:
        conn.close()
        return False
    conn.execute(
        "UPDATE problem_state SET notes = ?, code = ? WHERE problem_id = ?",
        (notes, code, problem_id),
    )
    conn.commit()
    conn.close()
    return True
