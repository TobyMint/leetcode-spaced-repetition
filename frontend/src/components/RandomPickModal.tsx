import { useState } from 'react'
import { getLeetCodeUrl } from '../api/url'
import { DiffBadge } from './DiffBadge'
import type { ProblemPoolItem } from '../types'

interface Props {
  pool: ProblemPoolItem[]
  onReview: (p: ProblemPoolItem) => void
  onClose: () => void
}

function pickOne(pool: ProblemPoolItem[]): ProblemPoolItem {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function RandomPickModal({ pool, onReview, onClose }: Props) {
  const [current, setCurrent] = useState(() => pickOne(pool))

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="modal-box bg-white dark:bg-gray-800 rounded-xl p-6 w-80 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">随机推荐</p>
        <a
          href={getLeetCodeUrl(current.title)}
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
            onClick={() => { onReview(current); onClose() }}
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
        </div>
      </div>
    </div>
  )
}
