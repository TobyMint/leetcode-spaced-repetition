import { useMemo } from 'react'

const CONFIG: Record<string, { label: string; badge: string }> = {
  new:     { label: '未开始', badge: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  weak:    { label: '薄弱',   badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  medium:  { label: '一般',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  strong:  { label: '熟练',   badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
}

interface Props {
  avgQuality?: number
  totalReviews?: number
}

export function CompetenceLabel({ avgQuality = 0, totalReviews = 0 }: Props) {
  const key = useMemo(() => {
    if (totalReviews === 0) return 'new'
    if (avgQuality < 2.5) return 'weak'
    if (avgQuality < 4.0) return 'medium'
    return 'strong'
  }, [avgQuality, totalReviews])

  const c = CONFIG[key]
  return (
    <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${c.badge}`}>
      {c.label}
    </span>
  )
}
