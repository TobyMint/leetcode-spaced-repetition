/** 获取 LeetCode 题目链接：优先用真实 URL，fallback 到搜索页 */
export function getLeetCodeUrl(title: string, leetcodeUrl?: string | null): string {
  if (leetcodeUrl && leetcodeUrl.includes('/problems/') && leetcodeUrl.length > 30) {
    return leetcodeUrl
  }
  return `https://leetcode.cn/problemset/?search=${encodeURIComponent(title)}`
}
