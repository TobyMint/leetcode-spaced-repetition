import { useState } from 'react'
import { getLeetCodeUrl } from '../api/url'
import { DiffBadge } from './DiffBadge'
import { NotesEditor } from './NotesEditor'
import { QualityButtons } from './QualityButtons'
import type { ProblemPoolItem } from '../types'

interface Props {
  pool: ProblemPoolItem[]
  onReview: (p: ProblemPoolItem, quality: number) => void
  onClose: () => void
}

type View = 'pick' | 'notes'

function pickOne(pool: ProblemPoolItem[]): ProblemPoolItem {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function RandomPickModal({ pool, onReview, onClose }: Props) {
  const [current, setCurrent] = useState(() => pickOne(pool))
  const [view, setView] = useState<View>('pick')

  const handleRate = (quality: number) => {
    onReview(current, quality)
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
            className="text-lg font-semibold text-blue-600 hover:underline"
            rel="noreferrer"
          >
            #{current.id} {current.title}
          </a>
          <div className="mt-2"><DiffBadge diff={current.difficulty} /></div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 mb-2">做完后给自己打分：</p>
          <QualityButtons onRate={handleRate} />
          <div className="flex gap-3 text-xs text-gray-400 mb-4 justify-center">
            <span>0-2: 不会</span><span>3: 勉强</span><span>4: 犹豫</span><span>5: 轻松</span>
          </div>

          <div className="flex gap-2 justify-center">
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

          <NotesEditor
            problem={current}
            extraFooterButton={
              <button onClick={() => setView('pick')} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">返回</button>
            }
          >
            <div className="border-t dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">做完后给自己打分：</p>
              <QualityButtons onRate={handleRate} />
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <span>0-2: 不会</span><span>3: 勉强</span><span>4: 犹豫</span><span>5: 轻松</span>
              </div>
            </div>
          </NotesEditor>
        </div>
      )}
    </div>
  )
}
