import { QualityButtons, qualityDesc } from './QualityButtons'
import type { ProblemPoolItem } from '../types'

interface Props {
  problem: ProblemPoolItem
  onRate: (quality: number) => void
  onClose: () => void
}

export function QuickReviewModal({ problem, onRate, onClose }: Props) {
  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="modal-box bg-white dark:bg-gray-800 rounded-xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
        <p className="font-medium text-gray-800 dark:text-gray-100 mb-1">#{problem.id} {problem.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">这道题做得怎么样？</p>
        <QualityButtons onRate={onRate} />
        <div className="flex gap-3 text-xs text-gray-400 mt-2">
          <span>0-2: 不会</span><span>3: 勉强</span><span>4: 犹豫</span><span>5: 轻松</span>
        </div>
      </div>
    </div>
  )
}

export { qualityDesc }
