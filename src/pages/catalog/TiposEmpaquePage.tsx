import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface TipoEmpaque extends BaseEntity {
  Codigo?: string
  Nombre: string
  Descripcion?: string
  Activo?: boolean | string
}

// Schema de validación
const empaqueSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Descripcion: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "package_types",
  labels: {
    singular: "Tipo de Empaque",
    plural: "Tipos de Empaque",
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
      success: "Tipo de empaque creado exitosamente",
      error: "Error al crear el tipo de empaque",
    },
    update: {
      success: "Tipo de empaque actualizado exitosamente",
      error: "Error al actualizar el tipo de empaque",
    },
    delete: {
      success: "Tipo de empaque eliminado exitosamente",
      error: "Error al eliminar el tipo de empaque",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<TipoEmpaque>[] = [
  { 
    key: "Codigo" as keyof TipoEmpaque, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof TipoEmpaque, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Descripcion" as keyof TipoEmpaque, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof TipoEmpaque,
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
    placeholder: "Código del tipo de empaque",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Caja, Blister, Frasco...",
  },
  {
    name: "Descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del tipo de empaque",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function TiposEmpaquePage() {
  return (
    <CRUDPage<TipoEmpaque>
      config={config}
      entityName="package_types"
      columns={columns}
      formFields={formFields}
      formSchema={empaqueSchema}
      searchFields={["Codigo", "Nombre"] as (keyof TipoEmpaque)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

