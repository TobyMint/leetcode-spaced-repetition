import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { getLeetCodeUrl } from '../api/url'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'
import type { ActivityLogEntry } from '../types'

const PAGE_SIZE = 20

const LABELS: Record<string, string> = { review: '复习评分', add: '添加题目', reset: '重置进度' }
const COLORS: Record<string, string> = {
  review: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900',
  add: 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900',
  reset: 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-900',
}

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const loadPage = useCallback((p: number) => {
    setLoading(true)
    api.getActivityLog(PAGE_SIZE, (p - 1) * PAGE_SIZE)
      .then(d => { setLogs(d.logs); setTotal(d.total) })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    loadPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">活动日志</h2>
        {total > 0 && <span className="text-sm text-gray-400">共 {total} 条</span>}
      </div>

      {loading ? <Loading /> : logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg">暂无活动记录</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">开始刷题后这里会显示你的操作记录</p>
        </div>
      ) : (
        <>
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
                      href={getLeetCodeUrl(log.title || '')}
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

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goTo(1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-sm rounded-md border dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >&laquo;</button>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-sm rounded-md border dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >&lsaquo;</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | 'gap')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('gap')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, i) =>
                  item === 'gap' ? (
                    <span key={`gap-${i}`} className="px-1 text-gray-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goTo(item)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        item === page
                          ? 'bg-blue-500 text-white'
                          : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >{item}</button>
                  )
                )}

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-sm rounded-md border dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >&rsaquo;</button>
              <button
                onClick={() => goTo(totalPages)}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-sm rounded-md border dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >&raquo;</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
