import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets - relacionado a Centro de Distribución
interface DiaFestivo extends BaseEntity {
  name: string
  distribution_center_id?: string  // Relación con Centro
  date?: string
  notes?: string
  is_working_day?: boolean | string
  start_time?: string
  end_time?: string
}

// Schema de validación
const festivoSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  distribution_center_id: z.string().optional(),
  date: stringFromAny,
  notes: optionalString,
  is_working_day: booleanFromString.optional(),
  start_time: optionalString,
  end_time: optionalString,
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "dias_festivos",  // Nombre correcto de la entidad
  labels: {
    singular: "Día Festivo",
    plural: "Días Festivos",
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

// Columnas de la tabla - coinciden con Google Sheet
const columns: DataTableColumn<DiaFestivo>[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "distribution_center_id", label: "Centro", sortable: true },
  { key: "date", label: "Fecha", sortable: true, render: (value) => value ? String(value) : '-' },
  { key: "notes", label: "Descripción", render: (value) => value ? String(value) : '-' },
  {
    key: "is_working_day",
    label: "Día Laboral",
    render: (value) => {
      const isWorkingDay = value === true || value === 'TRUE' || value === 'true' || value === 'Sí'
      return (
        <Badge variant={isWorkingDay ? "default" : "outline"}>
          {isWorkingDay ? "Sí" : "No"}
        </Badge>
      )
    },
  },
  { key: "start_time", label: "Hora Inicio", render: (value) => value ? String(value) : '-' },
  { key: "end_time", label: "Hora Fin", render: (value) => value ? String(value) : '-' },
]

// Campos del formulario - con relación a Centro de Distribución
const formFields: FormField[] = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del día festivo",
  },
  {
    name: "distribution_center_id",
    label: "Centro de Distribución",
    type: "select",
    required: true,
    placeholder: "Seleccionar centro...",
    optionsEntity: "centros_distribucion",  // Carga opciones dinámicas
  },
  {
    name: "date",
    label: "Fecha",
    type: "date",
    required: true,
    placeholder: "Seleccione la fecha",
  },
  {
    name: "notes",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del día festivo",
    className: "sm:col-span-2",
  },
  {
    name: "is_working_day",
    label: "Es día laboral (horario especial)",
    type: "switch",
    defaultValue: false,
    description: "Si está activo, indica que hay operaciones con horario especial",
  },
  {
    name: "start_time",
    label: "Hora Inicio (si es laboral)",
    type: "time",
    placeholder: "Ej: 08:00",
  },
  {
    name: "end_time",
    label: "Hora Fin (si es laboral)",
    type: "time",
    placeholder: "Ej: 14:00",
  },
]

export function DiasFestivosPage() {
  return (
    <CRUDPage<DiaFestivo>
      config={config}
      entityName="dias_festivos"
      columns={columns}
      formFields={formFields}
      formSchema={festivoSchema}
      searchFields={["name", "date"]}
      defaultValues={{ is_working_day: false }}
    />
  )
}

