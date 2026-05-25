import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { formatNextReview, getLeetCodeUrl } from '../api/url'
import { DiffBadge } from '../components/DiffBadge'
import { Loading } from '../components/Loading'
import { CompetenceLabel } from '../components/StatusLabel'
import { QuickReviewModal } from '../components/QuickReviewModal'
import { ResetConfirmModal } from '../components/ResetConfirmModal'
import { ProblemActivityModal } from '../components/ProblemActivityModal'
import { ProblemNotesModal } from '../components/ProblemNotesModal'
import { RandomPickModal } from '../components/RandomPickModal'
import { useToast } from '../components/Toast'
import type { Problem, ProblemPoolItem } from '../types'

function getCompetence(avgQuality: number, totalReviews: number): string {
  if (totalReviews === 0) return 'new'
  if (avgQuality < 2.5) return 'weak'
  if (avgQuality < 4.0) return 'medium'
  return 'strong'
}

export function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [fComp, setFComp] = useState('')
  const [fDiff, setFDiff] = useState('')
  const [fCat, setFCat] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [reviewModal, setReviewModal] = useState<ProblemPoolItem | null>(null)
  const [resetModal, setResetModal] = useState<ProblemPoolItem | null>(null)
  const [activityModal, setActivityModal] = useState<ProblemPoolItem | null>(null)
  const [notesModal, setNotesModal] = useState<ProblemPoolItem | null>(null)
  const [randomPool, setRandomPool] = useState<ProblemPoolItem[] | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDiff, setNewDiff] = useState('中等')
  const [newCat, setNewCat] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    api.getProblems().then(setProblems).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  const filtered = problems.filter(p => {
    const comp = getCompetence(p.avg_quality, p.total_reviews)
    return (!fComp || comp === fComp) &&
      (!fDiff || p.difficulty === fDiff) &&
      (!fCat || p.category === fCat)
  })

  const categories = [...new Set(problems.map(p => p.category).filter(Boolean))] as string[]

  const handleReview = async (id: number, quality: number) => {
    if (submittingId !== null) return
    setSubmittingId(id)
    try {
      const result = await api.review(id, quality)
      toast(`已评分: ${quality}`)
      setProblems(prev => prev.map(p => p.id === id ? {
        ...p,
        next_review: result.next_review,
        avg_quality: result.avg_quality,
        total_reviews: result.total_reviews,
        round: result.round,
      } : p))
    } catch (e: any) { toast(e.message, 'error') }
    finally { setSubmittingId(null) }
  }

  const handleReset = async (id: number) => {
    try {
      await api.resetProblem(id)
      toast('进度已重置')
      const updated = await api.getProblems()
      setProblems(updated)
    } catch (e: any) { toast(e.message, 'error') }
  }

  const handleAdd = async () => {
    if (!newTitle.trim()) return toast('请输入题目名称', 'error')
    try {
      await api.addProblem({ title: newTitle, difficulty: newDiff, category: newCat, url: newUrl })
      toast('添加成功')
      setShowAdd(false)
      setNewTitle(''); setNewCat(''); setNewUrl('')
      const updated = await api.getProblems()
      setProblems(updated)
    } catch (e: any) { toast(e.message, 'error') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此题？')) return
    try {
      await api.deleteProblem(id)
      toast('已删除')
      const updated = await api.getProblems()
      setProblems(updated)
    } catch (e: any) { toast(e.message, 'error') }
  }

  if (loading) return <Loading />

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">题目总览</h2>
        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <button
              onClick={() => setRandomPool(filtered.map(p => ({ id: p.id, title: p.title, difficulty: p.difficulty, leetcode_url: p.leetcode_url })))}
              className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
            >
              随机一题
            </button>
          )}
          <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition-colors">
            + 添加题目
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select value={fComp} onChange={e => setFComp(e.target.value)} className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-2 py-1 text-sm">
          <option value="">全部程度</option>
          <option value="new">未开始</option>
          <option value="weak">薄弱</option>
          <option value="medium">一般</option>
          <option value="strong">熟练</option>
        </select>
        <select value={fDiff} onChange={e => setFDiff(e.target.value)} className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-2 py-1 text-sm">
          <option value="">全部难度</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
        <select value={fCat} onChange={e => setFCat(e.target.value)} className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-2 py-1 text-sm">
          <option value="">全部分类</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        筛选结果：<span className="font-semibold text-gray-700 dark:text-gray-200">{filtered.length}</span> 道题
      </div>

      {showAdd && (
        <div className="card">
          <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-100">添加新题目</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="题目名称" className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm" />
            <select value={newDiff} onChange={e => setNewDiff(e.target.value)} className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-3 py-2 text-sm">
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="分类（可选）" className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm" />
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="LeetCode 链接（可选）" className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-600 transition-colors">添加</button>
            <button onClick={() => setShowAdd(false)} className="text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">取消</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 text-left w-12">#</th>
              <th className="px-4 py-2 text-left">题目</th>
              <th className="px-4 py-2 text-left w-20">难度</th>
              <th className="px-4 py-2 text-left w-20">分类</th>
              <th className="px-4 py-2 text-left w-16">掌握</th>
              <th className="px-4 py-2 text-left w-28">下次复习</th>
              <th className="px-4 py-2 text-left w-52">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="problem-row border-t dark:border-gray-700">
                <td className="px-4 py-2 text-gray-400">{p.id}</td>
                <td className="px-4 py-2 font-medium">
                  <a href={getLeetCodeUrl(p.leetcode_url)} target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">{p.title}</a>
                </td>
                <td className="px-4 py-2"><DiffBadge diff={p.difficulty} /></td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{p.category || '-'}</td>
                <td className="px-4 py-2"><CompetenceLabel avgQuality={p.avg_quality} totalReviews={p.total_reviews} /></td>
                <td className="px-4 py-2 text-gray-400 text-xs whitespace-nowrap">{formatNextReview(p.next_review)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => setReviewModal({ id: p.id, title: p.title, difficulty: p.difficulty })}
                    disabled={submittingId === p.id}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >刷了</button>
                  <button
                    onClick={() => setNotesModal({ id: p.id, title: p.title, difficulty: p.difficulty })}
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition-colors ml-1.5 ${
                      p.notes
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 ring-1 ring-emerald-300 dark:ring-emerald-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                  >笔记</button>
                  <button onClick={() => setActivityModal({ id: p.id, title: p.title, difficulty: p.difficulty })} className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors ml-1.5">日志</button>
                  <button onClick={() => setResetModal({ id: p.id, title: p.title, difficulty: p.difficulty })} className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-amber-600 hover:bg-amber-100 dark:bg-gray-700 dark:text-amber-400 dark:hover:bg-gray-600 transition-colors ml-1.5">重置</button>
                  {!p.is_preset && (
                    <button onClick={() => handleDelete(p.id)} className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-red-500 hover:bg-red-100 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors ml-1.5">删除</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviewModal && (
        <QuickReviewModal problem={reviewModal} onRate={(q) => { handleReview(reviewModal.id, q); setReviewModal(null) }} onClose={() => setReviewModal(null)} />
      )}
      {resetModal && (
        <ResetConfirmModal problem={resetModal} onConfirm={() => { handleReset(resetModal.id); setResetModal(null) }} onClose={() => setResetModal(null)} />
      )}
      {activityModal && (
        <ProblemActivityModal problem={activityModal} onClose={() => setActivityModal(null)} />
      )}
      {notesModal && (
        <ProblemNotesModal problem={notesModal} onClose={() => setNotesModal(null)} />
      )}
      {randomPool && (
        <RandomPickModal pool={randomPool} onReview={(p, q) => { handleReview(p.id, q); setRandomPool(null) }} onClose={() => setRandomPool(null)} />
      )}
    </div>
  )
}
