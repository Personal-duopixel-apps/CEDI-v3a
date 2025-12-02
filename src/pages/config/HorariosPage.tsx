import * as React from "react"
import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, Settings } from "lucide-react"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import { useSettingsStore, type TimeInterval } from "@/store/settings.store"
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
  const { timeInterval, setTimeInterval } = useSettingsStore()
  
  const handleIntervalChange = (checked: boolean) => {
    setTimeInterval(checked ? 30 : 60)
  }

  return (
    <div className="space-y-6">
      {/* Configuración de Intervalo de Horarios */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Configuración de Visualización
          </CardTitle>
          <CardDescription>
            Configura cómo se muestran los horarios en el calendario y el wizard de citas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="interval-switch" className="text-base font-medium cursor-pointer">
                  Mostrar horarios cada media hora
                </Label>
                <p className="text-sm text-muted-foreground">
                  {timeInterval === 30 
                    ? "Los horarios se muestran cada 30 minutos (6:00, 6:30, 7:00...)" 
                    : "Los horarios se muestran cada hora (6:00, 7:00, 8:00...)"}
                </p>
              </div>
            </div>
            <Switch
              id="interval-switch"
              checked={timeInterval === 30}
              onCheckedChange={handleIntervalChange}
            />
          </div>
          
          {/* Preview de los horarios */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Vista previa de horarios:</p>
            <div className="flex flex-wrap gap-1">
              {timeInterval === 30 ? (
                <>
                  <Badge variant="outline">6:00 AM</Badge>
                  <Badge variant="outline">6:30 AM</Badge>
                  <Badge variant="outline">7:00 AM</Badge>
                  <Badge variant="outline">7:30 AM</Badge>
                  <Badge variant="outline">8:00 AM</Badge>
                  <span className="text-muted-foreground">...</span>
                </>
              ) : (
                <>
                  <Badge variant="outline">6:00 AM</Badge>
                  <Badge variant="outline">7:00 AM</Badge>
                  <Badge variant="outline">8:00 AM</Badge>
                  <Badge variant="outline">9:00 AM</Badge>
                  <Badge variant="outline">10:00 AM</Badge>
                  <span className="text-muted-foreground">...</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CRUD de Horarios */}
      <CRUDPage<Horario>
        config={config}
        entityName="horarios"
        columns={columns}
        formFields={formFields}
        formSchema={horarioSchema}
        searchFields={["name", "day", "dock_id"]}
        defaultValues={{ is_available: true }}
      />
    </div>
  )
}

