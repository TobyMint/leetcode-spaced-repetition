interface Props { diff: string }

export function DiffBadge({ diff }: Props) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap diff-${diff}`}>
      {diff}
    </span>
  )
}
