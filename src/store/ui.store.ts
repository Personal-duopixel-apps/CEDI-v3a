import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface UIStore {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapse: () => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  // Loading
  isLoading: boolean
  loadingMessage: string
  setLoading: (loading: boolean, message?: string) => void

  // Modals
  activeModal: string | null
  modalData: unknown
  openModal: (modalId: string, data?: unknown) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Theme
  theme: 'light',
  setTheme: (theme) => {
    set({ theme })
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  },

  // Toasts
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}`
    const newToast = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))
    
    // Auto remove after duration
    const duration = toast.duration ?? 5000
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },
  
  clearToasts: () => set({ toasts: [] }),

  // Loading
  isLoading: false,
  loadingMessage: '',
  setLoading: (loading, message = '') => {
    set({ isLoading: loading, loadingMessage: message })
  },

  // Modals
  activeModal: null,
  modalData: null,
  openModal: (modalId, data) => {
    set({ activeModal: modalId, modalData: data })
  },
  closeModal: () => {
    set({ activeModal: null, modalData: null })
  },
}))

// Helper hook for toasts
export function useToast() {
  const addToast = useUIStore((state) => state.addToast)
  
  return {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message }),
  }
}

