import * as React from "react"
import { Outlet, Navigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { ToastContainer } from "@/components/ui/toast"
import { useAuthStore } from "@/store/auth.store"
import { useUIStore } from "@/store/ui.store"

export function MainLayout() {
  const { isAuthenticated } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] transition-all duration-300 p-6",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}


