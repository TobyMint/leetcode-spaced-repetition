import { NotesEditor } from './NotesEditor'
import type { ProblemPoolItem } from '../types'

interface Props {
  problem: ProblemPoolItem
  onClose: () => void
}

export function ProblemNotesModal({ problem, onClose }: Props) {
  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-box bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">#{problem.id} {problem.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>
        <NotesEditor
          problem={problem}
          extraFooterButton={
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">关闭</button>
          }
        />
      </div>
    </div>
  )
}
