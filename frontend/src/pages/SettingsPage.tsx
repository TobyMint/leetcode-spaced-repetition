import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useToast } from '../components/Toast'

export function SettingsPage() {
  const [settings, setSettings] = useState({ new_per_day: 3, max_review_per_day: 10, mastered_consecutive: 5, mastered_interval: 21 })
  const { toast } = useToast()

  useEffect(() => {
    api.getSettings().then(s => setSettings({
      new_per_day: parseInt(s.new_per_day) || 3,
      max_review_per_day: parseInt(s.max_review_per_day) || 10,
      mastered_consecutive: parseInt(s.mastered_consecutive) || 5,
      mastered_interval: parseInt(s.mastered_interval) || 21,
    })).catch(() => {})
  }, [])

  const save = async () => {
    try {
      await api.updateSettings(settings)
      toast('设置已保存')
    } catch (e: any) { toast(e.message, 'error') }
  }

  return (
    <div className="page-enter space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">设置</h2>
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">每日新题数量</label>
          <input
            type="number" value={settings.new_per_day} min={0} max={20}
            onChange={e => setSettings(s => ({ ...s, new_per_day: parseInt(e.target.value) || 0 }))}
            className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-3 py-2 w-32 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">每天学习几道新题（设为 0 则只复习）</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">每日复习上限</label>
          <input
            type="number" value={settings.max_review_per_day} min={0} max={100}
            onChange={e => setSettings(s => ({ ...s, max_review_per_day: parseInt(e.target.value) || 0 }))}
            className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-3 py-2 w-32 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">每天最多复习几道题</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">已掌握标准 — 连续正确次数</label>
          <input
            type="number" value={settings.mastered_consecutive} min={1} max={20}
            onChange={e => setSettings(s => ({ ...s, mastered_consecutive: parseInt(e.target.value) || 1 }))}
            className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-3 py-2 w-32 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">已掌握标准 — 间隔天数</label>
          <input
            type="number" value={settings.mastered_interval} min={1} max={365}
            onChange={e => setSettings(s => ({ ...s, mastered_interval: parseInt(e.target.value) || 1 }))}
            className="border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md px-3 py-2 w-32 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">连续正确且间隔超过此天数后标记为"已掌握"</p>
        </div>
        <button onClick={save} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors">保存</button>
      </div>
    </div>
  )
}
