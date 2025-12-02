import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MainLayout } from "@/components/layout/MainLayout"
import { ToastContainer } from "@/components/ui/toast"
import { LoginPage } from "@/pages/Login"
import { DashboardPage } from "@/pages/Dashboard"
import { 
  ProductsPage, 
  LaboratoriesPage, 
  CategoriesPage,
  FormasFarmaceuticasPage,
  UnidadesMedidaPage,
  TiposEmpaquePage,
  ImpuestosPage,
  MonedasPage,
  NivelesProductoPage,
  PrincipiosActivosPage,
  ClasificacionesPage,
  BuyersPage,
  NewProductWizardPage
} from "@/pages/catalog"
import { SuppliersPage } from "@/pages/suppliers"
import { AppointmentsPage } from "@/pages/scheduling"
import { DocksPage, VehicleTypesPage, ConnectionTestPage, CentrosDistribucionPage, HorariosPage, DiasFestivosPage, UsersPage } from "@/pages/config"
import { AuditPage } from "@/pages/AuditPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { TransportDataPage } from "@/pages/public/TransportDataPage"
import { initializeDatabase, isDatabaseReady } from "@/services/database.service"
import { useAuthStore } from "@/store/auth.store"
import { databaseConfig } from "@/config/database.config"

// Placeholder pages for routes not fully implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">Esta página está en desarrollo</p>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated } = useAuthStore()
  const [dbReady, setDbReady] = useState(isDatabaseReady())
  const initRef = useRef(false)

  // Inicializar base de datos una sola vez
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      if (databaseConfig.adapter === 'google-sheets' && !isDatabaseReady()) {
        console.log('🔄 Cargando datos desde Google Sheets...')
        await initializeDatabase()
        console.log('✅ Base de datos lista')
      }
      setDbReady(true)
    }
    
    init()
  }, [])

  // Mostrar pantalla de carga mientras se inicializa la base de datos
  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando datos desde Google Sheets...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cita/transporte/:token" element={<TransportDataPage />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* Perfil de Usuario */}
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Catálogo */}
          <Route path="/catalogo/productos" element={<ProductsPage />} />
          <Route path="/catalogo/productos-nuevos" element={<NewProductWizardPage />} />
          <Route path="/catalogo/laboratorios" element={<LaboratoriesPage />} />
          <Route path="/catalogo/categorias" element={<CategoriesPage />} />
          <Route path="/catalogo/formas" element={<FormasFarmaceuticasPage />} />
          <Route path="/catalogo/unidades" element={<UnidadesMedidaPage />} />
          <Route path="/catalogo/empaques" element={<TiposEmpaquePage />} />
          <Route path="/catalogo/impuestos" element={<ImpuestosPage />} />
          <Route path="/catalogo/monedas" element={<MonedasPage />} />
          <Route path="/catalogo/niveles" element={<NivelesProductoPage />} />
          <Route path="/catalogo/principios" element={<PrincipiosActivosPage />} />
          <Route path="/catalogo/clasificaciones" element={<ClasificacionesPage />} />
          <Route path="/catalogo/compradores" element={<BuyersPage />} />

          {/* Citas/Scheduling */}
          <Route path="/citas" element={<AppointmentsPage />} />
          <Route path="/citas/nueva" element={<AppointmentsPage />} />

          {/* Proveedores */}
          <Route path="/proveedores" element={<SuppliersPage />} />

          {/* Configuración */}
          <Route path="/config/rdc" element={<CentrosDistribucionPage />} />
          <Route path="/config/puertas" element={<DocksPage />} />
          <Route path="/config/vehiculos" element={<VehicleTypesPage />} />
          <Route path="/config/horarios" element={<HorariosPage />} />
          <Route path="/config/festivos" element={<DiasFestivosPage />} />
          <Route path="/config/usuarios" element={<UsersPage />} />
          <Route path="/config/conexion" element={<ConnectionTestPage />} />

          {/* Seguridad */}
          <Route path="/seguridad" element={<PlaceholderPage title="Módulo de Seguridad" />} />

          {/* Reportes */}
          <Route path="/reportes" element={<PlaceholderPage title="Reportes" />} />

          {/* Auditoría */}
          <Route path="/auditoria" element={<AuditPage />} />
        </Route>

        {/* Catch all - redirect to dashboard or login */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
      <ToastContainer />
    </TooltipProvider>
  )
}

export default App


