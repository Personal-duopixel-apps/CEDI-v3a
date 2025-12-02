import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Roles de usuario disponibles
const USER_ROLES = [
  { value: "Admin", label: "Administrador" },
  { value: "Catálogo", label: "Catálogo" },
  { value: "Citas", label: "Citas" },
  { value: "Proveedor", label: "Proveedor" },
] as const

// Tipo de Usuario basado en Google Sheets
interface User extends BaseEntity {
  name: string
  username: string
  email?: string
  password?: string
  role: string
  supplier_id?: string  // Solo para roles Citas/Proveedor
  phone?: string
  is_active?: boolean | string
}

// Schema de validación
const userSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: stringFromAny.optional(),
  role: z.string().min(1, "Debe seleccionar un rol"),
  supplier_id: optionalString,
  phone: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "users",
  labels: {
    singular: "Usuario",
    plural: "Usuarios",
  },
  displayField: "name",
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  messages: {
    create: {
      success: "Usuario creado exitosamente",
      error: "Error al crear el usuario",
    },
    update: {
      success: "Usuario actualizado exitosamente",
      error: "Error al actualizar el usuario",
    },
    delete: {
      success: "Usuario eliminado exitosamente",
      error: "Error al eliminar el usuario",
    },
  },
}

// Función para obtener el color del badge según el rol
const getRoleBadgeVariant = (role: string): "default" | "secondary" | "success" | "warning" => {
  switch (role) {
    case "Admin":
      return "default"
    case "Catálogo":
      return "secondary"
    case "Citas":
      return "warning"
    case "Proveedor":
      return "success"
    default:
      return "secondary"
  }
}

// Columnas de la tabla
const columns: DataTableColumn<User>[] = [
  { 
    key: "name", 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "username", 
    label: "Usuario", 
    sortable: true 
  },
  { 
    key: "email", 
    label: "Email",
    render: (value) => value || '-'
  },
  {
    key: "role",
    label: "Perfil",
    sortable: true,
    render: (value) => {
      const role = value as string
      return (
        <Badge variant={getRoleBadgeVariant(role)}>
          {role || 'Sin rol'}
        </Badge>
      )
    },
  },
  { 
    key: "supplier_id", 
    label: "Proveedor",
    render: (value) => value || '-'
  },
  { 
    key: "phone", 
    label: "Teléfono",
    render: (value) => value || '-'
  },
  {
    key: "is_active",
    label: "Estado",
    render: (value) => {
      const isActive = value === true || value === 'TRUE' || value === 'true' || value === 'Sí' || value === undefined
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
]

// Campos del formulario
const formFields: FormField[] = [
  {
    name: "name",
    label: "Nombre Completo",
    type: "text",
    required: true,
    placeholder: "Ej: Juan Pérez",
  },
  {
    name: "username",
    label: "Usuario",
    type: "text",
    required: true,
    placeholder: "Ej: jperez",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Ej: juan@empresa.com",
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "••••••••",
    description: "Dejar en blanco para mantener la contraseña actual",
  },
  {
    name: "role",
    label: "Perfil de Usuario",
    type: "select",
    required: true,
    placeholder: "Seleccionar perfil...",
    options: USER_ROLES.map(r => ({ value: r.value, label: r.label })),
    description: "Admin y Catálogo: acceso total. Citas y Proveedor: solo datos de su proveedor.",
  },
  {
    name: "supplier_id",
    label: "Proveedor Asociado",
    type: "select",
    placeholder: "Seleccionar proveedor...",
    optionsEntity: "suppliers",
    description: "Solo para perfiles Citas o Proveedor. Este usuario solo verá datos de este proveedor.",
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "text",
    placeholder: "Ej: +502 5555-5555",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
    description: "Los usuarios inactivos no pueden iniciar sesión",
  },
]

export function UsersPage() {
  return (
    <CRUDPage<User>
      config={config}
      entityName="users"
      columns={columns}
      formFields={formFields}
      formSchema={userSchema}
      searchFields={["name", "username", "email", "role"]}
      defaultValues={{ is_active: true, role: "Proveedor" }}
    />
  )
}

