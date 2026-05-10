import type { Problem, TodayProblems, ReviewResult, Stats, ActivityLogEntry, Settings } from '../types'

const BASE = '/api'

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  getToday: () => request<TodayProblems>('/today'),

  getProblems: () => request<Problem[]>('/problems'),

  getProblem: (id: number) => request<Problem>(`/problems/${id}`),

  review: (id: number, quality: number) =>
    request<ReviewResult>(`/review/${id}`, {
      method: 'POST',
      body: JSON.stringify({ quality }),
    }),

  addProblem: (data: { title: string; difficulty: string; category?: string; url?: string }) =>
    request<{ id: number }>('/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteProblem: (id: number) =>
    request<{ ok: boolean }>(`/problems/${id}`, { method: 'DELETE' }),

  resetProblem: (id: number) =>
    request<{ ok: boolean }>(`/problems/${id}/reset`, { method: 'POST' }),

  getStats: () => request<Stats>('/stats'),

  getActivityLog: () => request<ActivityLogEntry[]>('/activity'),

  getProblemActivity: (id: number) => request<ActivityLogEntry[]>(`/problems/${id}/activity`),

  getProblemNotes: (id: number) => request<{ notes: string; code: string }>(`/problems/${id}/notes`),

  saveProblemNotes: (id: number, notes: string, code: string) =>
    request<{ ok: boolean }>(`/problems/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes, code }),
    }),

  getSettings: () => request<Settings>('/settings'),

  updateSettings: (data: Record<string, string | number>) =>
    request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
