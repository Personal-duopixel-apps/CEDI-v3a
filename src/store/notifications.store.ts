import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Notification {
  id: string
  type: "appointment" | "pending" | "completed" | "info" | "warning"
  title: string
  description: string
  time: string
  color: string
  read: boolean
  createdAt: number
}

interface NotificationsState {
  notifications: Notification[]
  readNotificationIds: string[]
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Omit<Notification, "read" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  removeNotification: (id: string) => void
  
  // Getters
  getUnreadCount: () => number
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      readNotificationIds: [],
      
      setNotifications: (notifications) => {
        const { readNotificationIds } = get()
        // Marcar las notificaciones que ya fueron leídas
        const notificationsWithReadStatus = notifications.map(n => ({
          ...n,
          read: readNotificationIds.includes(n.id),
          createdAt: n.createdAt || Date.now(),
        }))
        set({ notifications: notificationsWithReadStatus })
      },
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          read: false,
          createdAt: Date.now(),
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 20), // Máximo 20 notificaciones
        }))
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          readNotificationIds: [...new Set([...state.readNotificationIds, id])],
        }))
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          readNotificationIds: [
            ...new Set([
              ...state.readNotificationIds,
              ...state.notifications.map((n) => n.id),
            ]),
          ],
        }))
      },
      
      clearAll: () => {
        set((state) => ({
          notifications: [],
          readNotificationIds: [
            ...state.readNotificationIds,
            ...state.notifications.map((n) => n.id),
          ],
        }))
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
      
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },
    }),
    {
      name: "notifications-storage",
      partialize: (state) => ({
        readNotificationIds: state.readNotificationIds,
      }),
    }
  )
)

