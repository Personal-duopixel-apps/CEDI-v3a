import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface Horario extends BaseEntity {
  Nombre: string
  "Día"?: string
  "Hora Inicio"?: string
  "Hora Fin"?: string
  Descripción?: string
  Activo?: boolean | string
}

// Schema de validación
const horarioSchema = z.object({
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  "Día": optionalString,
  "Hora Inicio": stringFromAny,
  "Hora Fin": stringFromAny,
  Descripción: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "schedules",
  labels: {
    singular: "Horario",
    plural: "Horarios",
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

// Columnas de la tabla
const columns: DataTableColumn<Horario>[] = [
  { 
    key: "Nombre" as keyof Horario, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Día" as keyof Horario, 
    label: "Día",
    render: (value) => value || '-'
  },
  { 
    key: "Hora Inicio" as keyof Horario, 
    label: "Hora Inicio",
    render: (value) => value || '-'
  },
  { 
    key: "Hora Fin" as keyof Horario, 
    label: "Hora Fin",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof Horario,
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
    placeholder: "Nombre del horario",
  },
  {
    name: "Día",
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
    name: "Hora Inicio",
    label: "Hora Inicio",
    type: "text",
    placeholder: "Ej: 08:00",
  },
  {
    name: "Hora Fin",
    label: "Hora Fin",
    type: "text",
    placeholder: "Ej: 17:00",
  },
  {
    name: "Descripción",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del horario",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function HorariosPage() {
  return (
    <CRUDPage<Horario>
      config={config}
      entityName="schedules"
      columns={columns}
      formFields={formFields}
      formSchema={horarioSchema}
      searchFields={["Nombre", "Día"] as (keyof Horario)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

