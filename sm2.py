"""SM-2 间隔重复算法实现。

基于 SuperMemo 2 算法，根据用户每次复习的评分（0-5）来计算下次复习时间。
评分标准：
  0 - 完全不记得
  1 - 看到答案才想起来
  2 - 看到答案后勉强回忆起来
  3 - 勉强答对，很吃力
  4 - 答对了，但有些犹豫
  5 - 非常轻松地答对
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta


@dataclass
class SM2State:
    ef: float = 2.5              # 难度因子 (easiness factor)
    interval: float = 0          # 当前间隔天数
    consecutive: int = 0         # 连续正确次数
    next_review: date | None = None


def calculate_next_review(state: SM2State, quality: int, today: date | None = None) -> SM2State:
    """根据评分计算下次复习状态。

    Args:
        state: 当前复习状态
        quality: 评分 (0-5)
        today: 今天的日期，默认为 date.today()

    Returns:
        更新后的 SM2State
    """
    if today is None:
        today = date.today()

    quality = max(0, min(5, quality))

    if quality < 3:
        # 完全不会，重置
        new_consecutive = 0
        new_interval = 1
        new_ef = state.ef
    else:
        new_consecutive = state.consecutive + 1
        new_ef = _update_ef(state.ef, quality)

        if new_consecutive == 1:
            new_interval = 1
        elif new_consecutive == 2:
            new_interval = 6
        else:
            new_interval = round(state.interval * new_ef)

    next_review = today + timedelta(days=int(new_interval))

    return SM2State(
        ef=new_ef,
        interval=new_interval,
        consecutive=new_consecutive,
        next_review=next_review,
    )


def _update_ef(ef: float, quality: int) -> float:
    """更新难度因子。"""
    new_ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    return max(1.3, new_ef)


def get_status(consecutive: int, interval: float, ef: float) -> str:
    """根据复习状态判断题目阶段。

    Returns:
        'new' / 'learning' / 'review' / 'mastered'
    """
    if consecutive == 0 and interval == 0:
        return "new"
    if consecutive >= 5 and interval >= 21:
        return "mastered"
    return "review" if consecutive >= 1 else "learning"
