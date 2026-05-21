import { useEffect, useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { api } from '../api/client'
import { useToast } from './Toast'
import type { ProblemPoolItem } from '../types'

SyntaxHighlighter.registerLanguage('python', python)

interface Props {
  problem: ProblemPoolItem
  onClose: () => void
}

export function ProblemNotesModal({ problem, onClose }: Props) {
  const [notes, setNotes] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    api.getProblemNotes(problem.id).then(d => {
      setNotes(d.notes || '')
      setCode(d.code || '')
    }).catch(() => {})
  }, [problem.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.saveProblemNotes(problem.id, notes, code)
      toast('笔记已保存')
    } catch (e: any) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-box bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">#{problem.id} {problem.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Notes */}
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

          {/* Code */}
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
        <div className="flex gap-2 justify-end px-6 pb-5 pt-3 border-t dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">关闭</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
