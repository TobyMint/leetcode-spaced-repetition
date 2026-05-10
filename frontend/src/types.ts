export interface Problem {
  id: number
  title: string
  difficulty: '简单' | '中等' | '困难'
  category: string | null
  leetcode_url: string | null
  is_preset: number
  status: 'new' | 'learning' | 'review' | 'mastered'
  ef: number
  consecutive_correct: number
  interval_days: number
  next_review: string | null
  last_reviewed: string | null
  notes: string
  code: string
}

export interface TodayProblems {
  new: Problem[]
  review: Problem[]
}

export interface ReviewResult {
  status: string
  next_review: string
  ef: number
  interval: number
  consecutive: number
}

export interface Stats {
  counts: { new: number; learning: number; review: number; mastered: number; total: number }
  today_reviewed: number
  streak: number
  daily: { day: string; cnt: number }[]
  difficulty: Record<string, { total: number; done: number }>
}

export interface ActivityLogEntry {
  id: number
  problem_id?: number
  action: 'review' | 'add' | 'reset'
  detail: string
  created_at: string
  title?: string
}

export interface Settings {
  new_per_day: string
  max_review_per_day: string
  mastered_consecutive: string
  mastered_interval: string
}

export interface ProblemPoolItem {
  id: number
  title: string
  difficulty: string
}
