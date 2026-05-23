import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { getLeetCodeUrl } from '../api/url'
import { DiffBadge } from '../components/DiffBadge'
import { CompetenceLabel } from '../components/StatusLabel'
import { Loading } from '../components/Loading'
import { QualityButtons } from '../components/QualityButtons'
import { ProblemNotesModal } from '../components/ProblemNotesModal'
import { RandomPickModal } from '../components/RandomPickModal'
import { useToast } from '../components/Toast'
import { ChevronDown } from 'lucide-react'
import type { TodayQueueItem, ProblemPoolItem } from '../types'

export function TodayPage() {
  const [queue, setQueue] = useState<TodayQueueItem[]>([])
  const [globalRound, setGlobalRound] = useState(1)
  const [quota, setQuota] = useState(7)
  const [doneToday, setDoneToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [randomPool, setRandomPool] = useState<ProblemPoolItem[] | null>(null)
  const [notesModal, setNotesModal] = useState<ProblemPoolItem | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const { toast } = useToast()

  const load = useCallback(() => {
    api.getToday().then(d => {
      setQueue(d.queue)
      setGlobalRound(d.global_round)
      setQuota(d.quota)
      setDoneToday(d.done_today)
    }).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRate = async (id: number, quality: number) => {
    if (submittingId !== null) return
    setSubmittingId(id)
    try {
      await api.review(id, quality)
      toast(`已评分: ${quality}`)
      load()  // 刷新队列
    } catch (e: any) { toast(e.message, 'error') }
    finally { setSubmittingId(null) }
  }

  if (loading) return <Loading />

  const remaining = quota - doneToday

  return (
    <div className="page-enter space-y-3">
      {/* 轮次进度条 */}
      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            第 {globalRound} 轮
          </h2>
          <span className="text-sm text-gray-500">{doneToday} / {quota} 今日已刷</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${Math.min(100, (doneToday / quota) * 100)}%` }}
          />
        </div>
        {remaining > 0 ? (
          <p className="text-xs text-gray-400">今日还剩 {remaining} 道，加油 🔥</p>
        ) : doneToday >= quota && queue.length > 0 ? (
          <p className="text-xs text-emerald-500">今日任务已完成！还有余力可以继续刷 👏</p>
        ) : queue.length === 0 ? (
          <p className="text-xs text-gray-400">🎉 当前队列已清空，暂时没有待刷题目</p>
        ) : null}
      </div>

      {/* 题目列表 */}
      {queue.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg">暂时没有待刷的题目</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            所有题目都在复习间隔中，稍后再来看
          </p>
        </div>
      ) : (
        queue.map(p => (
          <div key={p.id} className={`card problem-row ${p.round >= globalRound ? 'opacity-70' : ''}`} id={`problem-${p.id}`}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-gray-400 text-sm shrink-0">#{p.id}</span>
                <a
                  href={getLeetCodeUrl(p.title, p.leetcode_url)}
                  target="_blank"
                  onClick={e => e.stopPropagation()}
                  className="font-medium text-blue-600 hover:underline truncate"
                  rel="noreferrer"
                >
                  {p.title}
                </a>
                <DiffBadge diff={p.difficulty} />
                <CompetenceLabel avgQuality={p.avg_quality} totalReviews={p.total_reviews} />
              </div>
              <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
            </div>
            {expanded === p.id && (
              <div className="pt-4 border-t dark:border-gray-700 mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">做完后给自己打分：</p>
                <QualityButtons onRate={(q) => handleRate(p.id, q)} />
                <div className="flex gap-4 text-xs text-gray-400 mt-2">
                  <span>0-2: 不会</span><span>3: 勉强</span><span>4: 犹豫</span><span>5: 轻松</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setNotesModal({ id: p.id, title: p.title, difficulty: p.difficulty }) }}
                    className="text-emerald-500 hover:underline ml-auto"
                  >
                    写笔记
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {queue.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setRandomPool(queue.map(p => ({ id: p.id, title: p.title, difficulty: p.difficulty, leetcode_url: p.leetcode_url })))}
            className="text-sm text-purple-500 hover:text-purple-700 hover:underline"
          >
            随机一题
          </button>
        </div>
      )}

      {randomPool && (
        <RandomPickModal
          pool={randomPool}
          onReview={(p, q) => { handleRate(p.id, q); setRandomPool(null) }}
          onClose={() => setRandomPool(null)}
        />
      )}
      {notesModal && (
        <ProblemNotesModal problem={notesModal} onClose={() => setNotesModal(null)} />
      )}
    </div>
  )
}
