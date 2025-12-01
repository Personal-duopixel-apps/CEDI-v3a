import * as React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/store/ui.store"

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const toast = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<{email?: string; password?: string}>({})

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {}
    
    if (!email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido"
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsLoading(true)
      const success = await login(email, password)
      if (success) {
        toast.success("Bienvenido", "Has iniciado sesión correctamente")
        navigate("/")
      } else {
        toast.error("Error de autenticación", "Email o contraseña incorrectos")
      }
    } catch (error) {
      toast.error("Error", "No se pudo iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-white font-bold text-xl">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">CEDI Pharma</h1>
              <p className="text-white/60 text-sm">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Centro de Distribución<br />
              <span className="text-purple-200">Farmacéutica</span>
            </h2>
            <p className="text-white/70 mt-4 max-w-md">
              Gestiona tu centro de distribución con la plataforma más completa 
              para la industria farmacéutica. Control de inventario, citas de 
              recepción y mucho más.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-6"
          >
            {[
              { value: "24/7", label: "Disponibilidad" },
              { value: "100%", label: "Trazabilidad" },
              { value: "Multi", label: "Tenant" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-white/40 text-sm">
          © 2024 CEDI Pharma. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                  <Package className="h-6 w-6" />
                </div>
                <span className="font-display font-bold text-xl">CEDI Pharma</span>
              </div>
              <CardTitle className="text-2xl font-display">Bienvenido</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@cedi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar Sesión
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Credenciales de demostración:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin:</span>
                    <code className="text-primary">admin@cedi.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catálogo:</span>
                    <code className="text-primary">catalogo@cedi.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Citas:</span>
                    <code className="text-primary">citas@cedi.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proveedor:</span>
                    <code className="text-primary">proveedor@cedi.com</code>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Contraseña:</span>
                    <code className="text-primary font-semibold">cedi2024</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

