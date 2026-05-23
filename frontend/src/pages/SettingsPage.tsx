import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'

export function SettingsPage() {
  const [dailyQuota, setDailyQuota] = useState(7)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    api.getSettings().then(s => {
      setDailyQuota(parseInt(s.daily_quota) || 7)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const save = async () => {
    try {
      await api.updateSettings({ daily_quota: dailyQuota })
      toast('设置已保存')
    } catch (e: any) { toast(e.message, 'error') }
  }

  return (
    <div className="page-enter space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">设置</h2>
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">每日题目数量</label>
          <input
            type="number" value={dailyQuota} min={1} max={50}
            onChange={e => setDailyQuota(parseInt(e.target.value) || 1)}
            className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-3 py-2 w-32 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">每天推送几道题（弱题优先，全部循环不遗漏）</p>
        </div>
        <button onClick={save} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors">保存</button>
      </div>
    </div>
  )
}
