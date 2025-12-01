import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface PrincipioActivo extends BaseEntity {
  Codigo?: string
  Nombre: string
  Descripción?: string
  Activo?: boolean | string
}

// Schema de validación
const principioSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Descripción: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "active_ingredients",
  labels: {
    singular: "Principio Activo",
    plural: "Principios Activos",
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
      success: "Principio activo creado exitosamente",
      error: "Error al crear el principio activo",
    },
    update: {
      success: "Principio activo actualizado exitosamente",
      error: "Error al actualizar el principio activo",
    },
    delete: {
      success: "Principio activo eliminado exitosamente",
      error: "Error al eliminar el principio activo",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<PrincipioActivo>[] = [
  { 
    key: "Codigo" as keyof PrincipioActivo, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof PrincipioActivo, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Descripción" as keyof PrincipioActivo, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof PrincipioActivo,
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
    placeholder: "Código del principio activo",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del principio activo",
  },
  {
    name: "Descripción",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del principio activo",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function PrincipiosActivosPage() {
  return (
    <CRUDPage<PrincipioActivo>
      config={config}
      entityName="active_ingredients"
      columns={columns}
      formFields={formFields}
      formSchema={principioSchema}
      searchFields={["Codigo", "Nombre"] as (keyof PrincipioActivo)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

