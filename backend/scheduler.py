"""轮次 + 优先级调度算法。

替代 SM-2：不再指数间隔，按评分决定固定回归时间。
弱题高频出现，强题低频出现，所有题循环不遗漏。

评分标准（同 SM-2）：
  0 - 完全不记得
  1 - 看到答案才想起来
  2 - 看到答案后勉强回忆起来
  3 - 勉强答对，很吃力
  4 - 答对了，但有些犹豫
  5 - 非常轻松地答对
"""

from __future__ import annotations

from datetime import datetime, timedelta


def next_review_after(quality: int, now: datetime | None = None) -> datetime:
    """根据评分返回下次复习时间。弱题快回，强题慢回。"""
    if now is None:
        now = datetime.now()
    quality = max(0, min(5, quality))
    if quality <= 2:
        days = 1
    elif quality == 3:
        days = 3
    elif quality == 4:
        days = 7
    else:
        days = 14
    return now + timedelta(days=days)


def ema_quality(old_avg: float, new_quality: int) -> float:
    """指数移动平均更新平均评分，权重 0.3。"""
    return round(0.3 * new_quality + 0.7 * old_avg, 2)


def competence(avg_quality: float, total_reviews: int) -> str:
    """根据历史评分判断掌握程度。

    Returns 'new' | 'weak' | 'medium' | 'strong'
    """
    if total_reviews == 0:
        return "new"
    if avg_quality < 2.5:
        return "weak"
    if avg_quality < 4.0:
        return "medium"
    return "strong"
