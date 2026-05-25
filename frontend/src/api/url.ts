/** 格式化下次复习时间为易读字符串 */
export function formatNextReview(isoStr: string | null): string {
  if (!isoStr) return '-'
  const d = new Date(isoStr + (isoStr.includes('T') ? '' : 'T00:00:00'))
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000)

  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')

  let relative = ''
  if (diffDays <= 0) relative = '今天'
  else if (diffDays === 1) relative = '明天'
  else if (diffDays <= 7) relative = `${diffDays}天后`

  return relative ? `${relative} ${hh}:${mi}` : `${mm}-${dd} ${hh}:${mi}`
}

/** 获取 LeetCode 题目链接 */
export function getLeetCodeUrl(leetcodeUrl?: string | null): string {
  return leetcodeUrl || '#'
}
