import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { CalendarHeatmap } from '../components/CalendarHeatmap'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'
import { DiffBadge } from '../components/DiffBadge'
import type { Stats } from '../types'

const STATUS_CONFIG = [
  { key: 'mastered', label: '已掌握', color: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900' },
  { key: 'review', label: '复习中', color: 'bg-amber-400', light: 'bg-amber-100 dark:bg-amber-900' },
  { key: 'learning', label: '学习中', color: 'bg-blue-400', light: 'bg-blue-100 dark:bg-blue-900' },
  { key: 'new', label: '未开始', color: 'bg-gray-300 dark:bg-gray-600', light: 'bg-gray-100 dark:bg-gray-700' },
]

export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    api.getStats().then(setStats).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  if (!stats) return null

  const { counts, today_reviewed, streak, daily, difficulty } = stats

  // 进度 = 非 new 的题目
  const inProgress = counts.total - counts.new
  const progressPercent = counts.total ? Math.round((inProgress / counts.total) * 100) : 0

  // 最近 7 天柱状图
  const recentDays: { label: string; count: number; date: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('zh-CN', { weekday: 'short' })
    const item = daily.find((x: any) => x.day === key)
    recentDays.push({ label, count: item ? item.cnt : 0, date: key })
  }
  const maxCount = Math.max(...recentDays.map(d => d.count), 1)
  const barMaxH = 96 // px

  return (
    <div className="page-enter space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">学习统计</h2>

      <CalendarHeatmap />

      {/* 概览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-500">{counts.total}</p>
          <p className="text-sm text-gray-500 mt-1">总题数</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-emerald-500">{counts.mastered}</p>
          <p className="text-sm text-gray-500 mt-1">已掌握</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-500">{today_reviewed}</p>
          <p className="text-sm text-gray-500 mt-1">今日已刷</p>
        </div>
        <div className={`card text-center ${streak > 0 ? 'streak-glow' : ''}`}>
          <p className="text-3xl font-bold text-purple-500">{streak}</p>
          <p className="text-sm text-gray-500 mt-1">连续打卡<span className="text-xs">(天)</span></p>
        </div>
      </div>

      {/* 总体进度 — 环形图 + 分布 */}
      <div className="card flex items-center gap-8">
        {/* 环形图 */}
        <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r="56" fill="none" stroke="currentColor" strokeWidth="12"
              className="text-gray-100 dark:text-gray-700" />
            <circle cx="65" cy="65" r="56" fill="none" stroke="currentColor" strokeWidth="12"
              className="text-emerald-500"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{progressPercent}%</span>
            <span className="text-[10px] text-gray-400">已启动</span>
          </div>
        </div>

        {/* 状态分布条 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">题目分布</h3>
          {/* 堆叠条 */}
          <div className="w-full h-5 rounded-full overflow-hidden flex mb-3">
            {STATUS_CONFIG.map(s => {
              const val = (counts as any)[s.key] || 0
              if (val === 0) return null
              const pct = counts.total ? (val / counts.total) * 100 : 0
              return (
                <div
                  key={s.key}
                  className={`${s.color} h-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                  title={`${s.label}: ${val}`}
                />
              )
            })}
          </div>
          {/* 图例 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {STATUS_CONFIG.map(s => {
              const val = (counts as any)[s.key] || 0
              return (
                <div key={s.key} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
                  <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{val}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 各难度完成率 */}
      <div className="card">
        <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-100">各难度完成率</h3>
        <div className="space-y-3">
          {Object.entries(difficulty).map(([diff, d]) => {
            const pct = d.total ? Math.round((d.done / d.total) * 100) : 0
            return (
              <div key={diff}>
                <div className="flex justify-between text-sm mb-1">
                  <DiffBadge diff={diff} />
                  <span className="text-gray-500 dark:text-gray-400">{d.done}/{d.total} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      diff === '简单' ? 'bg-emerald-400' : diff === '中等' ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 最近 7 天柱状图 */}
      <div className="card">
        <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-100">最近 7 天</h3>
        <div className="flex items-end gap-3" style={{ height: barMaxH + 40 }}>
          {recentDays.map(d => {
            const barH = d.count > 0 ? Math.max((d.count / maxCount) * barMaxH, 8) : 0
            const isToday = d.date === new Date().toISOString().slice(0, 10)
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5" style={{ height: '100%' }}>
                <span className={`text-xs font-medium ${d.count > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                  {d.count}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                        : 'bg-gradient-to-t from-blue-300 to-blue-200 dark:from-blue-600 dark:to-blue-500'
                    }`}
                    style={{ height: barH ? `${barH}px` : '0px' }}
                  />
                </div>
                <span className="text-xs text-gray-400">{d.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
