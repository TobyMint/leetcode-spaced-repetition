import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ToastItem { id: number; message: string; type: 'success' | 'error' }

const ToastContext = createContext<{ toast: (msg: string, type?: 'success' | 'error') => void }>({
  toast: () => {},
})

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[1000] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
