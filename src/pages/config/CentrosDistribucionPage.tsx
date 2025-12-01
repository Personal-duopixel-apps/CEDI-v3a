import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados a inglés)
interface CentroDistribucion extends BaseEntity {
  code?: string
  name: string
  address?: string
  city?: string
  country?: string
  timezone?: string
  phone?: string
  email?: string
  is_active?: boolean | string
}

// Schema de validación (nombres mapeados)
const centroSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: optionalString,
  city: optionalString,
  country: optionalString,
  timezone: optionalString,
  phone: stringFromAny,
  email: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "centros_distribucion",
  labels: {
    singular: "Centro de Distribución",
    plural: "Centros de Distribución",
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
      success: "Centro de distribución creado exitosamente",
      error: "Error al crear el centro de distribución",
    },
    update: {
      success: "Centro de distribución actualizado exitosamente",
      error: "Error al actualizar el centro de distribución",
    },
    delete: {
      success: "Centro de distribución eliminado exitosamente",
      error: "Error al eliminar el centro de distribución",
    },
  },
}

// Columnas de la tabla (usando nombres mapeados)
const columns: DataTableColumn<CentroDistribucion>[] = [
  { 
    key: "code" as keyof CentroDistribucion, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "name" as keyof CentroDistribucion, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "address" as keyof CentroDistribucion, 
    label: "Dirección",
    render: (value) => value || '-'
  },
  { 
    key: "city" as keyof CentroDistribucion, 
    label: "Ciudad",
    render: (value) => value || '-'
  },
  { 
    key: "country" as keyof CentroDistribucion, 
    label: "País",
    render: (value) => value || '-'
  },
  { 
    key: "timezone" as keyof CentroDistribucion, 
    label: "Zona Horaria",
    render: (value) => value || '-'
  },
  { 
    key: "phone" as keyof CentroDistribucion, 
    label: "Teléfono",
    render: (value) => value || '-'
  },
  {
    key: "is_active" as keyof CentroDistribucion,
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

// Campos del formulario (usando nombres mapeados)
const formFields: FormField[] = [
  {
    name: "code",
    label: "Código",
    type: "text",
    placeholder: "Código del centro",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del centro de distribución",
  },
  {
    name: "address",
    label: "Dirección",
    type: "textarea",
    placeholder: "Dirección completa",
    className: "sm:col-span-2",
  },
  {
    name: "city",
    label: "Ciudad",
    type: "text",
    placeholder: "Ciudad",
  },
  {
    name: "country",
    label: "País",
    type: "text",
    placeholder: "País",
  },
  {
    name: "timezone",
    label: "Zona Horaria",
    type: "text",
    placeholder: "Ej: America/Guatemala",
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "text",
    placeholder: "Teléfono de contacto",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "correo@ejemplo.com",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function CentrosDistribucionPage() {
  return (
    <CRUDPage<CentroDistribucion>
      config={config}
      entityName="centros_distribucion"
      columns={columns}
      formFields={formFields}
      formSchema={centroSchema}
      searchFields={["code", "name", "city", "country"] as (keyof CentroDistribucion)[]}
      defaultValues={{ is_active: true }}
    />
  )
}
