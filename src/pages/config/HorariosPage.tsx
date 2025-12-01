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

// Columnas de la tabla - coinciden con Google Sheet
const columns: DataTableColumn<Horario>[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "dock_id", label: "Puerta", sortable: true },
  { key: "day", label: "Día", render: (value) => value || '-' },
  { key: "start_time", label: "Hora Inicio", render: (value) => value || '-' },
  { key: "end_time", label: "Hora Fin", render: (value) => value || '-' },
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

// Campos del formulario - con relación a Puerta
const formFields: FormField[] = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del horario",
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
    type: "time",
    placeholder: "Ej: 08:00",
  },
  {
    name: "end_time",
    label: "Hora Fin",
    type: "time",
    placeholder: "Ej: 17:00",
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

