export interface Problem {
  id: number
  title: string
  difficulty: '简单' | '中等' | '困难'
  category: string | null
  leetcode_url: string | null
  is_preset: number
  next_review: string | null
  last_reviewed: string | null
  notes: string
  code: string
  round: number
  total_reviews: number
  avg_quality: number
}

export interface TodayQueueItem {
  id: number
  title: string
  difficulty: string
  category: string | null
  leetcode_url: string | null
  next_review: string | null
  round: number
  total_reviews: number
  avg_quality: number
}

export interface TodayData {
  queue: TodayQueueItem[]
  global_round: number
  quota: number
  done_today: number
}

export interface ReviewResult {
  competence: string
  next_review: string
  avg_quality: number
  total_reviews: number
  round: number
}

export interface Stats {
  counts: { new: number; weak: number; medium: number; strong: number; total: number }
  today_reviewed: number
  streak: number
  daily: { day: string; cnt: number }[]
  difficulty: Record<string, { total: number; done: number }>
  global_round: number
  round_done: number
  round_total: number
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
  daily_quota: string
  global_round: string
}

export interface ProblemPoolItem {
  id: number
  title: string
  difficulty: string
  leetcode_url?: string | null
}

export interface RoundProgress {
  global_round: number
  done: number
  total: number
}
