import type { ProblemPoolItem } from '../types'

interface Props {
  problem: ProblemPoolItem
  onConfirm: () => void
  onClose: () => void
}

export function ResetConfirmModal({ problem, onConfirm, onClose }: Props) {
  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="modal-box bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">确认重置</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          确定要重置 <strong>#{problem.id} {problem.title}</strong> 的学习进度吗？
        </p>
        <p className="text-xs text-red-500 mb-4">这将清除所有复习记录和间隔数据，题目回到"未开始"状态。</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">确认重置</button>
        </div>
      </div>
    </div>
  )
}
