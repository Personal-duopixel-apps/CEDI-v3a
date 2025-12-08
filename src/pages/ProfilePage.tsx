import * as React from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Save,
  Camera,
  Key,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/store/ui.store"
import { ROLE_LABELS } from "@/lib/constants"

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  department: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      department: "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitProfile = (data: ProfileFormData) => {
    // Aquí se guardaría en la base de datos
    console.log("Perfil actualizado:", data)
    toast.success("Perfil actualizado", "Tu información ha sido actualizada correctamente")
    setIsEditingProfile(false)
  }

  const onSubmitPassword = (data: PasswordFormData) => {
    // Aquí se cambiaría la contraseña
    console.log("Contraseña cambiada")
    toast.success("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente")
    setIsChangingPassword(false)
    resetPassword()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {/* Tarjeta de perfil principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <UserAvatar name={user?.name || "Usuario"} className="h-24 w-24 text-2xl" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {user?.role ? ROLE_LABELS[user.role] : "Usuario"}
                </Badge>
                <Badge variant="secondary">
                  Activo
                </Badge>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? "Cancelar" : "Editar Perfil"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de edición de perfil */}
      {isEditingProfile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Editar Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...registerProfile("name")}
                        className="pl-10"
                        placeholder="Tu nombre"
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="text-sm text-red-500">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...registerProfile("email")}
                        type="email"
                        className="pl-10"
                        placeholder="tu@email.com"
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...registerProfile("phone")}
                        className="pl-10"
                        placeholder="+502 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...registerProfile("department")}
                        className="pl-10"
                        placeholder="Ej: Logística"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Gestiona tu contraseña y seguridad de la cuenta
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
            >
              {isChangingPassword ? "Cancelar" : "Cambiar Contraseña"}
            </Button>
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  {...registerPassword("currentPassword")}
                  type="password"
                  placeholder="••••••••"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    {...registerPassword("newPassword")}
                    type="password"
                    placeholder="••••••••"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    {...registerPassword("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Key className="h-4 w-4 mr-2" />
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Información de la cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ID de Usuario</p>
              <p className="font-mono text-sm">{user?.id || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="font-medium">{user?.role ? ROLE_LABELS[user.role] : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Centro de Distribución</p>
              <p className="font-medium">CEDI Principal</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Último Acceso</p>
              <p className="font-medium">{new Date().toLocaleDateString("es-GT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

