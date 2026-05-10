import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'
import type { ActivityLogEntry } from '../types'

const LABELS: Record<string, string> = { review: '复习评分', add: '添加题目', reset: '重置进度' }
const COLORS: Record<string, string> = {
  review: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900',
  add: 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900',
  reset: 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-900',
}

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    api.getActivityLog().then(setLogs).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div className="page-enter space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">活动日志</h2>

      {logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg">暂无活动记录</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">开始刷题后这里会显示你的操作记录</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y dark:divide-gray-700">
            {logs.map(log => {
              const d = new Date(log.created_at)
              const time = d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
              return (
                <div key={log.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-xs text-gray-400 w-24 shrink-0">{time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${COLORS[log.action] || ''}`}>
                    {LABELS[log.action] || log.action}
                  </span>
                  <a
                    href={`https://leetcode.cn/problemset/?search=${encodeURIComponent(log.title || '')}`}
                    target="_blank"
                    className="text-sm font-medium text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    {log.problem_id ? `#${log.problem_id}` : ''} {log.title || ''}
                  </a>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{log.detail}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
