import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { getLeetCodeUrl } from '../api/url'
import { DiffBadge } from '../components/DiffBadge'
import { Loading } from '../components/Loading'
import { QualityButtons } from '../components/QualityButtons'
import { ProblemNotesModal } from '../components/ProblemNotesModal'
import { QuickReviewModal } from '../components/QuickReviewModal'
import { RandomPickModal } from '../components/RandomPickModal'
import { useToast } from '../components/Toast'
import { ChevronDown } from 'lucide-react'
import type { Problem, ProblemPoolItem } from '../types'

export function TodayPage() {
  const [data, setData] = useState<{ new: Problem[]; review: Problem[] }>({ new: [], review: [] })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [reviewModal, setReviewModal] = useState<ProblemPoolItem | null>(null)
  const [randomPool, setRandomPool] = useState<ProblemPoolItem[] | null>(null)
  const [notesModal, setNotesModal] = useState<ProblemPoolItem | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    api.getToday().then(setData).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  const all = [...data.new.map(p => ({ ...p, isNew: true })), ...data.review.map(p => ({ ...p, isNew: false }))]

  const handleRate = async (id: number, quality: number) => {
    if (submittingId !== null) return
    setSubmittingId(id)
    try {
      const result = await api.review(id, quality)
      toast(`已评分: ${quality}`)
      setData(prev => {
        const update = (list: Problem[]) =>
          list.filter(p => p.id !== id).map(p => p.id === id ? { ...p, status: result.status, next_review: result.next_review } as Problem : p)
        return { new: update(prev.new).filter(p => p.status !== 'review' && p.status !== 'mastered'), review: update(prev.review) }
      })
    } catch (e: any) {
      toast(e.message, 'error')
    } finally { setSubmittingId(null) }
  }

  if (loading) return <Loading />

  return (
    <div className="page-enter space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">今日任务</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{all.length} 道题</span>
          {all.length > 0 && (
            <button
              onClick={() => setRandomPool(all.map(p => ({ id: p.id, title: p.title, difficulty: p.difficulty })))}
              className="text-sm text-purple-500 hover:text-purple-700 hover:underline"
            >
              随机一题
            </button>
          )}
        </div>
      </div>

      {all.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg">今天没有需要刷的题目</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">可以去"题目总览"手动添加新题，或者等明天再来</p>
        </div>
      ) : (
        all.map(p => (
          <div key={p.id} className="card problem-row" id={`problem-${p.id}`}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-8">#{p.id}</span>
                <a
                  href={getLeetCodeUrl(p.title, p.leetcode_url)}
                  target="_blank"
                  onClick={e => e.stopPropagation()}
                  className="font-medium text-blue-600 hover:underline"
                  rel="noreferrer"
                >
                  {p.title}
                </a>
                <DiffBadge diff={p.difficulty} />
                {p.isNew
                  ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">新题</span>
                  : <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">复习</span>
                }
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
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

      {reviewModal && (
        <QuickReviewModal
          problem={reviewModal}
          onRate={(q) => { handleRate(reviewModal.id, q); setReviewModal(null) }}
          onClose={() => setReviewModal(null)}
        />
      )}

      {randomPool && (
        <RandomPickModal
          pool={randomPool}
          onReview={(p) => setReviewModal(p)}
          onClose={() => setRandomPool(null)}
        />
      )}
      {notesModal && (
        <ProblemNotesModal problem={notesModal} onClose={() => setNotesModal(null)} />
      )}
    </div>
  )
}
