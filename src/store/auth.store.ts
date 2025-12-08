import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  currentRdcId: string | null
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setCurrentRdc: (rdcId: string) => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

// Permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'],
  admin: [
    'catalog.*', 'scheduling.*', 'suppliers.*',
    'users.read', 'users.update', 'reports.*', 'config.*'
  ],
  'scheduling-admin': [
    'scheduling.*', 'suppliers.read', 'catalog.read'
  ],
  'catalog-admin': [
    'catalog.*', 'suppliers.read'
  ],
  'supplier-admin': [
    'scheduling.read', 'scheduling.create', 'scheduling.update',
    'supplier-users.*'
  ],
  'supplier-user': [
    'scheduling.read', 'scheduling.create', 'scheduling.update:own'
  ],
  security: [
    'scheduling.read', 'appointments.checkin'
  ],
  guest: [],
}

const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .single()

    if (error || !data?.roles) {
      console.warn('Could not fetch user role, defaulting to guest', error)
      return 'guest'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.roles as any).name as UserRole
  } catch (err) {
    console.error('Error fetching role:', err)
    return 'guest'
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      currentRdcId: null,
      isLoading: true,

      checkSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()

          if (session?.user) {
            const role = await getUserRole(session.user.id)

            // Map Supabase user to App user
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
              role,
              is_active: true,
              rdc_id: session.user.user_metadata?.rdc_id || 'rdc-1', // Default or from meta
              supplier_id: session.user.user_metadata?.supplier_id,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || new Date().toISOString()
            }

            set({
              user,
              isAuthenticated: true,
              currentRdcId: user.rdc_id
            })
          } else {
            set({ user: null, isAuthenticated: false, currentRdcId: null })
          }
        } catch (error) {
          console.error('Error checking session:', error)
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { success: false, error: error.message }
          }

          if (data.session?.user) {
            const role = await getUserRole(data.session.user.id)

            const user: User = {
              id: data.session.user.id,
              email: data.session.user.email!,
              name: data.session.user.user_metadata?.name || email.split('@')[0],
              role,
              is_active: true,
              rdc_id: data.session.user.user_metadata?.rdc_id || 'rdc-1',
              supplier_id: data.session.user.user_metadata?.supplier_id,
              created_at: data.session.user.created_at,
              updated_at: data.session.user.updated_at || new Date().toISOString(),
            }

            set({
              user,
              isAuthenticated: true,
              currentRdcId: user.rdc_id,
            })
            return { success: true }
          }

          return { success: false, error: 'No se pudo obtener la sesión' }
        } catch (error) {
          return { success: false, error: 'Error inesperado al iniciar sesión' }
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({
          user: null,
          isAuthenticated: false,
          currentRdcId: null,
        })
      },

      setCurrentRdc: (rdcId: string) => {
        set({ currentRdcId: rdcId })
      },

      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false

        const permissions = ROLE_PERMISSIONS[user.role] || []
        if (permissions.includes('*')) return true

        if (permissions.includes(permission)) return true

        const [module] = permission.split('.')
        if (permissions.includes(`${module}.*`)) return true

        return false
      },

      hasRole: (roles: UserRole | UserRole[]) => {
        const { user } = get()
        if (!user) return false

        const roleArray = Array.isArray(roles) ? roles : [roles]
        return roleArray.includes(user.role)
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get()
        if (!user || !user.email) {
          return { success: false, error: 'No user logged in' }
        }

        try {
          // 1. Verify current password
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
          })

          if (signInError) {
            return { success: false, error: 'La contraseña actual es incorrecta' }
          }

          // 2. Update to new password
          const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

          if (updateError) {
            return { success: false, error: updateError.message }
          }

          return { success: true }
        } catch (error) {
          return { success: false, error: 'Error inesperado al actualizar la contraseña' }
        }
      },
    }),
    {
      name: 'cedi-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentRdcId: state.currentRdcId,
      }),
    }
  )
)
