
import { useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'

interface PermissionOptions {
    /**
     * ID del propietario del recurso para validar permisos :own
     */
    ownerId?: string
    /**
     * ID del proveedor del recurso para validar permisos :own
     * (Útil para validar si el recurso pertenece al mismo supplier del usuario)
     */
    resourceSupplierId?: string
}

export function usePermission() {
    const { user, hasPermission: hasRawPermission } = useAuthStore()

    /**
     * Verifica si el usuario tiene permiso para realizar una acción.
     * Soporta validación de propiedad (:own)
     * 
     * @param permission Permiso a verificar (ej. 'scheduling.update')
     * @param options Opciones adicionales para validar propiedad
     */
    const can = useCallback((permission: string, options?: PermissionOptions) => {
        // 1. Verificar permiso tal cual (ej. 'scheduling.update')
        // Esto cubre: superadmin (*), admin (scheduling.*) y usuarios con el permiso explícito
        if (hasRawPermission(permission)) {
            return true
        }

        // 2. Si no tiene el permiso total, verificar si tiene permiso :own
        // Solo si el permiso solicitado NO termina ya en :own
        if (!permission.endsWith(':own')) {
            const ownPermission = `${permission}:own`

            if (hasRawPermission(ownPermission)) {
                // El usuario tiene permiso :own (ej. 'scheduling.update:own')
                // Ahora debemos validar si es el dueño del recurso

                if (!user) return false

                // Caso A: Validación por Supplier ID (común en B2B)
                if (options?.resourceSupplierId) {
                    return user.supplier_id === options.resourceSupplierId
                }

                // Caso B: Validación por Owner ID (creador del registro)
                if (options?.ownerId) {
                    return user.id === options.ownerId
                }

                // Si tiene permiso :own pero no se pasaron opciones para validar propiedad,
                // denegamos el acceso proactivamente (fail safe)
                console.warn(`Permiso ${ownPermission} requiere options.ownerId o options.resourceSupplierId`)
                return false
            }
        }

        return false
    }, [user, hasRawPermission])

    return { can }
}

// Componente helper para renderizado condicional
interface CanProps extends PermissionOptions {
    I: string
    a?: string // opcional, para permitir leer como "I update scheduling" o "I update"
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function Can({ I, a, children, fallback = null, ...options }: CanProps) {
    const { can } = usePermission()

    // Construir string de permiso. Ej: a="scheduling", I="update" -> "scheduling.update"
    // O si solo se pasa I="users.read" -> "users.read"
    const permission = a ? `${a}.${I}` : I

    if (can(permission, options)) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
