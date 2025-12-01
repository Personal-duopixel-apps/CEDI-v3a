import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  currentRdcId: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setCurrentRdc: (rdcId: string) => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

// Usuarios de demostración
const DEMO_USERS: Record<string, User> = {
  'admin@cedi.com': {
    id: 'user-1',
    email: 'admin@cedi.com',
    name: 'Administrador CEDI',
    role: 'superadmin',
    is_active: true,
    rdc_id: 'rdc-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'catalogo@cedi.com': {
    id: 'user-2',
    email: 'catalogo@cedi.com',
    name: 'Admin Catálogo',
    role: 'catalog-admin',
    is_active: true,
    rdc_id: 'rdc-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'citas@cedi.com': {
    id: 'user-3',
    email: 'citas@cedi.com',
    name: 'Admin Citas',
    role: 'scheduling-admin',
    is_active: true,
    rdc_id: 'rdc-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'proveedor@cedi.com': {
    id: 'user-4',
    email: 'proveedor@cedi.com',
    name: 'Usuario Proveedor',
    role: 'supplier-user',
    is_active: true,
    rdc_id: 'rdc-1',
    supplier_id: 'supplier-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'seguridad@cedi.com': {
    id: 'user-5',
    email: 'seguridad@cedi.com',
    name: 'Guardia de Seguridad',
    role: 'security',
    is_active: true,
    rdc_id: 'rdc-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

// Permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'],  // Todo
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
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      currentRdcId: null,

      login: async (email: string, password: string) => {
        // Simulación de login - En producción, esto conectaría a la BD
        const normalizedEmail = email.toLowerCase().trim()
        
        // Contraseña demo: "cedi2024"
        if (password !== 'cedi2024') {
          return false
        }

        const user = DEMO_USERS[normalizedEmail]
        if (!user) {
          return false
        }

        set({
          user,
          isAuthenticated: true,
          currentRdcId: user.rdc_id,
        })

        return true
      },

      logout: () => {
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

        const permissions = ROLE_PERMISSIONS[user.role]
        if (permissions.includes('*')) return true

        // Verificar permiso exacto
        if (permissions.includes(permission)) return true

        // Verificar permisos con wildcard (ej: 'catalog.*')
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


