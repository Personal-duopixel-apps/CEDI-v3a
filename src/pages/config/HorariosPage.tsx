import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets - relacionado a Puertas
interface Horario extends BaseEntity {
  name: string
  dock_id?: string  // Relación con Puerta
  day?: string
  start_time?: string
  end_time?: string
  is_available?: boolean | string
  notes?: string
}

// Schema de validación
const horarioSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  dock_id: z.string().optional(),  // ID de la puerta
  day: optionalString,
  start_time: stringFromAny,
  end_time: stringFromAny,
  is_available: booleanFromString.optional(),
  notes: optionalString,
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "horarios",  // Nombre correcto de la entidad
  labels: {
    singular: "Horario",
    plural: "Horarios",
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
      success: "Horario creado exitosamente",
      error: "Error al crear el horario",
    },
    update: {
      success: "Horario actualizado exitosamente",
      error: "Error al actualizar el horario",
    },
    delete: {
      success: "Horario eliminado exitosamente",
      error: "Error al eliminar el horario",
    },
  },
}

// Función para formatear hora con AM/PM
const formatTimeWithAmPm = (time: string | undefined): string => {
  if (!time) return '-'
  const [hourStr, minutes] = time.split(':')
  const hour = parseInt(hourStr, 10)
  if (isNaN(hour)) return time
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes || '00'} ${ampm}`
}

// Columnas de la tabla - coinciden con Google Sheet
const columns: DataTableColumn<Horario>[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "dock_id", label: "Puerta", sortable: true },
  { key: "day", label: "Día", render: (value) => value || '-' },
  { key: "start_time", label: "Hora Inicio", render: (value) => formatTimeWithAmPm(value as string) },
  { key: "end_time", label: "Hora Fin", render: (value) => formatTimeWithAmPm(value as string) },
  {
    key: "is_available",
    label: "Disponible",
    render: (value) => {
      const isAvailable = value === true || value === 'TRUE' || value === 'true' || value === 'Sí' || value === undefined
      return (
        <Badge variant={isAvailable ? "success" : "secondary"}>
          {isAvailable ? "Sí" : "No"}
        </Badge>
      )
    },
  },
]

// Generar opciones de hora con AM/PM
const generateTimeOptions = () => {
  const options = []
  for (let hour = 5; hour <= 22; hour++) {
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hourStr = hour.toString()
    const displayHour = hour12.toString()
    
    // Hora en punto
    options.push({
      value: `${hourStr}:00`,
      label: `${displayHour}:00 ${ampm}`
    })
    // Media hora
    options.push({
      value: `${hourStr}:30`,
      label: `${displayHour}:30 ${ampm}`
    })
  }
  return options
}

const timeOptions = generateTimeOptions()

// Campos del formulario - con relación a Puerta
const formFields: FormField[] = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del horario",
    className: "sm:col-span-2",  // Ocupa el 100% del ancho
  },
  {
    name: "dock_id",
    label: "Puerta",
    type: "select",
    required: true,
    placeholder: "Seleccionar puerta...",
    optionsEntity: "docks",  // Carga opciones dinámicas de puertas
  },
  {
    name: "day",
    label: "Día",
    type: "select",
    placeholder: "Seleccione un día",
    options: [
      { value: "Lunes", label: "Lunes" },
      { value: "Martes", label: "Martes" },
      { value: "Miércoles", label: "Miércoles" },
      { value: "Jueves", label: "Jueves" },
      { value: "Viernes", label: "Viernes" },
      { value: "Sábado", label: "Sábado" },
      { value: "Domingo", label: "Domingo" },
    ],
  },
  {
    name: "start_time",
    label: "Hora Inicio",
    type: "select",
    placeholder: "Seleccione hora de inicio",
    options: timeOptions,
  },
  {
    name: "end_time",
    label: "Hora Fin",
    type: "select",
    placeholder: "Seleccione hora de fin",
    options: timeOptions,
  },
  {
    name: "notes",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del horario",
    className: "sm:col-span-2",
  },
  {
    name: "is_available",
    label: "Disponible",
    type: "switch",
    defaultValue: true,
    description: "Indica si este horario está disponible para citas",
  },
]

export function HorariosPage() {
  return (
    <CRUDPage<Horario>
      config={config}
      entityName="horarios"
      columns={columns}
      formFields={formFields}
      formSchema={horarioSchema}
      searchFields={["name", "day", "dock_id"]}
      defaultValues={{ is_available: true }}
    />
  )
}

