import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface CentroDistribucion extends BaseEntity {
  Codigo?: string
  Nombre: string
  Dirección?: string
  Ciudad?: string
  País?: string
  "Zona Horaria"?: string
  Email?: string
  Activo?: boolean | string
}

// Schema de validación
const centroSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Dirección: optionalString,
  Ciudad: optionalString,
  País: optionalString,
  "Zona Horaria": optionalString,
  Telefono: stringFromAny,
  Email: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "distribution_centers",
  labels: {
    singular: "Centro de Distribución",
    plural: "Centros de Distribución",
  },
  displayField: "Nombre",
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

// Columnas de la tabla
const columns: DataTableColumn<CentroDistribucion>[] = [
  { 
    key: "Codigo" as keyof CentroDistribucion, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof CentroDistribucion, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Dirección" as keyof CentroDistribucion, 
    label: "Dirección",
    render: (value) => value || '-'
  },
  { 
    key: "Ciudad" as keyof CentroDistribucion, 
    label: "Ciudad",
    render: (value) => value || '-'
  },
  { 
    key: "País" as keyof CentroDistribucion, 
    label: "País",
    render: (value) => value || '-'
  },
  { 
    key: "Zona Horaria" as keyof CentroDistribucion, 
    label: "Zona Horaria",
    render: (value) => value || '-'
  },
  { 
    key: "Telefono" as keyof CentroDistribucion, 
    label: "Teléfono",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof CentroDistribucion,
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
    name: "Codigo",
    label: "Código",
    type: "text",
    placeholder: "Código del centro",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del centro de distribución",
  },
  {
    name: "Dirección",
    label: "Dirección",
    type: "textarea",
    placeholder: "Dirección completa",
    className: "sm:col-span-2",
  },
  {
    name: "Ciudad",
    label: "Ciudad",
    type: "text",
    placeholder: "Ciudad",
  },
  {
    name: "País",
    label: "País",
    type: "text",
    placeholder: "País",
  },
  {
    name: "Zona Horaria",
    label: "Zona Horaria",
    type: "text",
    placeholder: "Ej: UTC-6",
  },
  {
    name: "Telefono",
    label: "Teléfono",
    type: "text",
    placeholder: "Teléfono de contacto",
  },
  {
    name: "Email",
    label: "Email",
    type: "email",
    placeholder: "correo@ejemplo.com",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function CentrosDistribucionPage() {
  return (
    <CRUDPage<CentroDistribucion>
      config={config}
      entityName="distribution_centers"
      columns={columns}
      formFields={formFields}
      formSchema={centroSchema}
      searchFields={["Codigo", "Nombre", "Ciudad", "País"] as (keyof CentroDistribucion)[]}
      defaultValues={{ Activo: true }}
    />
  )
}
