const DESC = ['完全不记得', '看到答案才想起来', '勉强回忆', '勉强答对', '答对但犹豫', '轻松答对']

interface Props {
  onRate: (q: number) => void
}

export function QualityButtons({ onRate }: Props) {
  return (
    <div className="flex gap-2 mb-2">
      {[0, 1, 2, 3, 4, 5].map(q => (
        <button
          key={q}
          className={`quality-btn q${q}`}
          onClick={() => onRate(q)}
          title={DESC[q]}
        >
          {q}
        </button>
      ))}
    </div>
  )
}

export { DESC as qualityDesc }
