import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useToast } from '../components/Toast'
import { DiffBadge } from '../components/DiffBadge'
import type { Stats } from '../types'

export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    api.getStats().then(setStats).catch(e => toast(e.message, 'error'))
  }, [])

  if (!stats) return null

  const { counts, today_reviewed, streak, daily, difficulty } = stats
  const masteredPercent = counts.total ? Math.round((counts.mastered / counts.total) * 100) : 0

  const recentDays = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('zh-CN', { weekday: 'short' })
    const item = daily.find((x: any) => x.day === key)
    recentDays.push({ label, count: item ? item.cnt : 0 })
  }
  const maxCount = Math.max(...recentDays.map(d => d.count), 1)

  return (
    <div className="page-enter space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">学习统计</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center"><p className="text-3xl font-bold text-blue-500">{counts.total}</p><p className="text-sm text-gray-500 mt-1">总题数</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-green-500">{counts.mastered}</p><p className="text-sm text-gray-500 mt-1">已掌握</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-yellow-500">{today_reviewed}</p><p className="text-sm text-gray-500 mt-1">今日已刷</p></div>
        <div className={`card text-center ${streak > 0 ? 'streak-glow' : ''}`}><p className="text-3xl font-bold text-purple-500">{streak}</p><p className="text-sm text-gray-500 mt-1">连续打卡</p></div>
      </div>

      <div className="card flex items-center gap-8">
        <div className="relative" style={{ width: 120, height: 120 }}>
          <svg className="progress-ring" width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#22c55e" strokeWidth="10"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - masteredPercent / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{masteredPercent}%</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-100">总体进度</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">未开始</span><span className="font-medium">{counts.new}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">复习中</span><span className="font-medium">{counts.review}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">已掌握</span><span className="font-medium">{counts.mastered}</span></div>
          </div>
        </div>
      </div>

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
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-100">最近 7 天</h3>
        <div className="flex items-end gap-2 h-32">
          {recentDays.map(d => {
            const h = Math.max((d.count / maxCount) * 100, 4)
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{d.count}</span>
                <div className="w-full bg-blue-400 rounded-t transition-all duration-500" style={{ height: `${h}%` }} />
                <span className="text-xs text-gray-400">{d.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
