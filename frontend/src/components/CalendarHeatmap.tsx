import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface CalendarDay {
  day: string
  count: number
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function getLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

const LEVEL_COLORS = [
  'bg-gray-100 dark:bg-gray-700',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-emerald-400 dark:bg-emerald-700',
  'bg-emerald-500 dark:bg-emerald-600',
  'bg-emerald-600 dark:bg-emerald-500',
]

export function CalendarHeatmap() {
  const [days, setDays] = useState<CalendarDay[]>([])

  useEffect(() => {
    api.getActivityLog(2000, 0).then(d => {
      // Count reviews per day from activity log (ensure we have full data)
      const countMap: Record<string, number> = {}

      // Build 90-day grid
      const today = new Date()
      for (let i = 89; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        countMap[key] = 0
      }

      // Count activity per day
      d.logs.forEach(log => {
        const key = log.created_at.slice(0, 10)
        if (key in countMap) countMap[key] = (countMap[key] || 0) + 1
      })

      setDays(Object.entries(countMap).map(([day, count]) => ({ day, count })))
    }).catch(() => {})
  }, [])

  if (days.length === 0) return null

  // Build weeks grid (column-major: each row is a day of week)
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []

  days.forEach((d, i) => {
    const date = new Date(d.day + 'T00:00:00')
    const dow = date.getDay()

    if (i === 0) {
      // Pad start of first week
      for (let j = 0; j < dow; j++) {
        currentWeek.push({ day: '', count: -1 })
      }
    }

    currentWeek.push(d)

    if (dow === 6 || i === days.length - 1) {
      // Pad end of last week
      while (currentWeek.length < 7) {
        currentWeek.push({ day: '', count: -1 })
      }
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  // Compute month labels
  const monthPositions: { label: string; col: number }[] = []
  weeks.forEach((week, col) => {
    const firstDay = week.find(d => d.count >= 0)
    if (firstDay) {
      const m = parseInt(firstDay.day.slice(5, 7))
      const prev = monthPositions[monthPositions.length - 1]
      if (!prev || MONTH_LABELS[m - 1] !== prev.label) {
        monthPositions.push({ label: MONTH_LABELS[m - 1], col })
      }
    }
  })

  const totalCount = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 dark:text-gray-100">刷题热力图</h3>
        <span className="text-xs text-gray-400">
          近 90 天共 <span className="font-semibold text-gray-600 dark:text-gray-300">{totalCount}</span> 次
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-fit">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-8 mb-1">
            {monthPositions.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400"
                style={{
                  position: 'relative',
                  left: `${m.col * 15}px`,
                  marginRight: i < monthPositions.length - 1
                    ? `${(monthPositions[i + 1].col - m.col - 1) * 15}px`
                    : '0',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1 pt-[2px]">
              {DAY_LABELS.map((l, i) => (
                <span key={i} className="text-[10px] text-gray-400 w-7 text-right leading-[14px]" style={{ height: 14 }}>
                  {i % 2 === 1 ? l : ''}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((d, di) => {
                    const level = d.count < 0 ? -1 : getLevel(d.count)
                    return (
                      <div
                        key={di}
                        className="rounded-sm"
                        style={{ width: 14, height: 14 }}
                        title={d.day ? `${d.day}: ${d.count} 次` : ''}
                      >
                        <div
                          className={`w-full h-full rounded-sm ${level >= 0 ? LEVEL_COLORS[level] : 'bg-transparent'}`}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 justify-end text-[10px] text-gray-400">
            <span>少</span>
            {LEVEL_COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  )
}
