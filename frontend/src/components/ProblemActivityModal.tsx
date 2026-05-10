import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { ActivityLogEntry, ProblemPoolItem } from '../types'

const LABELS: Record<string, string> = { review: '复习评分', add: '添加题目', reset: '重置进度' }
const COLORS: Record<string, string> = {
  review: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900',
  add: 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900',
  reset: 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-900',
}

interface Props {
  problem: ProblemPoolItem
  onClose: () => void
}

export function ProblemActivityModal({ problem, onClose }: Props) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])

  useEffect(() => {
    api.getProblemActivity(problem.id).then(setLogs).catch(() => setLogs([]))
  }, [problem.id])

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="modal-box bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-h-96 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">#{problem.id} {problem.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">&times;</button>
        </div>
        <p className="text-xs text-gray-400 mb-3">操作记录</p>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">暂无记录</p>
        ) : (
          logs.map(log => {
            const d = new Date(log.created_at)
            const time = d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            return (
              <div key={log.id} className="flex items-center gap-2 text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-xs text-gray-400 w-24 shrink-0">{time}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${COLORS[log.action] || ''}`}>{LABELS[log.action] || log.action}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{log.detail}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
