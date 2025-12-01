import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface UnidadMedida extends BaseEntity {
  Codigo?: string
  Nombre: string
  Abreviatura?: string
  Descripcion?: string
  Activo?: boolean | string
}

// Schema de validación
const unidadSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Abreviatura: optionalString,
  Descripcion: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "measurement_units",
  labels: {
    singular: "Unidad de Medida",
    plural: "Unidades de Medida",
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
      success: "Unidad de medida creada exitosamente",
      error: "Error al crear la unidad de medida",
    },
    update: {
      success: "Unidad de medida actualizada exitosamente",
      error: "Error al actualizar la unidad de medida",
    },
    delete: {
      success: "Unidad de medida eliminada exitosamente",
      error: "Error al eliminar la unidad de medida",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<UnidadMedida>[] = [
  { 
    key: "Codigo" as keyof UnidadMedida, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof UnidadMedida, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Abreviatura" as keyof UnidadMedida, 
    label: "Abreviatura",
    render: (value) => value || '-'
  },
  { 
    key: "Descripcion" as keyof UnidadMedida, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof UnidadMedida,
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
    placeholder: "Código de la unidad",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Kilogramo, Litro, Unidad...",
  },
  {
    name: "Abreviatura",
    label: "Abreviatura",
    type: "text",
    placeholder: "Ej: kg, L, ud...",
  },
  {
    name: "Descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la unidad de medida",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function UnidadesMedidaPage() {
  return (
    <CRUDPage<UnidadMedida>
      config={config}
      entityName="measurement_units"
      columns={columns}
      formFields={formFields}
      formSchema={unidadSchema}
      searchFields={["Codigo", "Nombre", "Abreviatura"] as (keyof UnidadMedida)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

