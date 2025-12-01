import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface DiaFestivo extends BaseEntity {
  Nombre: string
  Fecha?: string
  Descripción?: string
  Anual?: boolean | string
  Activo?: boolean | string
}

// Schema de validación
const festivoSchema = z.object({
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Fecha: stringFromAny,
  Descripción: optionalString,
  Anual: booleanFromString.optional(),
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "holidays",
  labels: {
    singular: "Día Festivo",
    plural: "Días Festivos",
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
      success: "Día festivo creado exitosamente",
      error: "Error al crear el día festivo",
    },
    update: {
      success: "Día festivo actualizado exitosamente",
      error: "Error al actualizar el día festivo",
    },
    delete: {
      success: "Día festivo eliminado exitosamente",
      error: "Error al eliminar el día festivo",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<DiaFestivo>[] = [
  { 
    key: "Nombre" as keyof DiaFestivo, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Fecha" as keyof DiaFestivo, 
    label: "Fecha",
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Descripción" as keyof DiaFestivo, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Anual" as keyof DiaFestivo,
    label: "Anual",
    render: (value) => {
      const isAnual = value === true || value === 'TRUE' || value === 'true' || value === 'Sí'
      return (
        <Badge variant={isAnual ? "default" : "outline"}>
          {isAnual ? "Sí" : "No"}
        </Badge>
      )
    },
  },
  {
    key: "Activo" as keyof DiaFestivo,
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
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del día festivo",
  },
  {
    name: "Fecha",
    label: "Fecha",
    type: "date",
    placeholder: "Seleccione la fecha",
  },
  {
    name: "Descripción",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del día festivo",
    className: "sm:col-span-2",
  },
  {
    name: "Anual",
    label: "Se repite anualmente",
    type: "switch",
    defaultValue: true,
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function DiasFestivosPage() {
  return (
    <CRUDPage<DiaFestivo>
      config={config}
      entityName="holidays"
      columns={columns}
      formFields={formFields}
      formSchema={festivoSchema}
      searchFields={["Nombre", "Fecha"] as (keyof DiaFestivo)[]}
      defaultValues={{ Activo: true, Anual: true }}
    />
  )
}

