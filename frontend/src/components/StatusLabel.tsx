const map: Record<string, string> = {
  new: '未开始', learning: '学习中', review: '复习中', mastered: '已掌握',
}

interface Props { status: string }

export function StatusLabel({ status }: Props) {
  return (
    <span className={`status-${status} px-2 py-0.5 rounded text-xs whitespace-nowrap`}>
      {map[status] || status}
    </span>
  )
}
