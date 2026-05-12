import { useEffect, useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { api } from '../api/client'
import { getLeetCodeUrl } from '../api/url'
import { DiffBadge } from './DiffBadge'
import { useToast } from './Toast'
import type { ProblemPoolItem } from '../types'

SyntaxHighlighter.registerLanguage('python', python)

interface Props {
  pool: ProblemPoolItem[]
  onReview: (p: ProblemPoolItem) => void
  onClose: () => void
}

type View = 'pick' | 'notes'

function pickOne(pool: ProblemPoolItem[]): ProblemPoolItem {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function RandomPickModal({ pool, onReview, onClose }: Props) {
  const [current, setCurrent] = useState(() => pickOne(pool))
  const [view, setView] = useState<View>('pick')
  const [notes, setNotes] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (view === 'notes') {
      api.getProblemNotes(current.id).then(d => {
        setNotes(d.notes || '')
        setCode(d.code || '')
      }).catch(() => {})
    }
  }, [view, current.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.saveProblemNotes(current.id, notes, code)
      toast('笔记已保存')
    } catch (e: any) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDoProblem = () => {
    window.open(getLeetCodeUrl(current.title, current.leetcode_url), '_blank')
    onReview(current)
    onClose()
  }

  const handleOverlayClick = () => {
    if (view === 'notes') {
      setView('pick')
    } else {
      onClose()
    }
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      {view === 'pick' ? (
        <div className="modal-box bg-white dark:bg-gray-800 rounded-xl p-6 w-80 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">随机推荐</p>
          <a
            href={getLeetCodeUrl(current.title, current.leetcode_url)}
            target="_blank"
            onClick={onClose}
            className="text-lg font-semibold text-blue-600 hover:underline"
            rel="noreferrer"
          >
            #{current.id} {current.title}
          </a>
          <div className="mt-2"><DiffBadge diff={current.difficulty} /></div>
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={handleDoProblem}
              className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              刷这个
            </button>
            <button
              onClick={() => setCurrent(pickOne(pool))}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              再换一个
            </button>
            <button
              onClick={() => setView('notes')}
              className="px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              笔记
            </button>
          </div>
        </div>
      ) : (
        <div className="modal-box bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('pick')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm flex items-center gap-1"
              >
                <span>&larr;</span> <span>返回</span>
              </button>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">#{current.id} {current.title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">解题笔记</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={5}
                placeholder="记录解题思路、易错点、复杂度分析..."
                className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">代码</label>
                <button
                  onClick={() => setPreview(!preview)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {preview ? '编辑' : '预览高亮'}
                </button>
              </div>
              {preview ? (
                <div className="rounded-lg overflow-hidden border dark:border-gray-600 text-sm">
                  <SyntaxHighlighter language="python" style={githubGist} customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.8125rem' }}>
                    {code || '# 还没有代码'}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  rows={12}
                  placeholder="# Python 代码&#10;def solution():&#10;    pass"
                  className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 justify-between px-6 pb-5 pt-3 border-t dark:border-gray-700">
            <button
              onClick={handleDoProblem}
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              刷这个
            </button>
            <div className="flex gap-2">
              <button onClick={() => setView('pick')} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">返回</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
