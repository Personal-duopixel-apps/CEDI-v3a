
import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { usePermission } from "@/hooks/usePermission"

interface ProtectedRouteProps {
    permission?: string
    redirectPath?: string
    children?: React.ReactNode
}

export function ProtectedRoute({
    permission,
    redirectPath = "/",
    children,
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore()
    const { can } = usePermission()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (permission && !can(permission)) {
        // Si no tiene permiso, redirigir al dashboard o path custom
        // Podríamos mostrar una página de 403 también
        console.warn(`Acceso denegado. Se requiere permiso: ${permission}`)
        return <Navigate to={redirectPath} replace />
    }

    return children ? <>{children}</> : <Outlet />
}
