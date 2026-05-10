import { useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

const NAV = [
  { key: 'today', label: '今日任务' },
  { key: 'problems', label: '题目总览' },
  { key: 'stats', label: '统计' },
  { key: 'activity', label: '活动日志' },
  { key: 'settings', label: '设置' },
]

interface Props {
  dark: boolean
  onToggleDark: () => void
}

export function Navbar({ dark, onToggleDark }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const current = location.pathname.replace('/', '') || 'today'

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">LeetCode 遗忘曲线</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {NAV.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => navigate(key === 'today' ? '/' : `/${key}`)}
                className={`nav-btn ${current === key ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={onToggleDark}
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="切换暗色模式"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
