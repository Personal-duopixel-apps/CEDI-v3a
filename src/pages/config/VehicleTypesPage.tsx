import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, numberFromString } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo de vehículo basado en Google Sheets
interface VehicleType extends BaseEntity {
  Codigo?: string
  Nombre: string
  Descripción?: string
  'Peso (ton)'?: number
  Activo?: boolean | string
}

// Schema de validación
const vehicleTypeSchema = z.object({
  Codigo: optionalString,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Descripción: optionalString,
  'Peso (ton)': numberFromString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "vehicle_types",
  labels: {
    singular: "Tipo de Vehículo",
    plural: "Tipos de Vehículo",
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
      success: "Tipo de vehículo creado exitosamente",
      error: "Error al crear el tipo de vehículo",
    },
    update: {
      success: "Tipo de vehículo actualizado exitosamente",
      error: "Error al actualizar el tipo de vehículo",
    },
    delete: {
      success: "Tipo de vehículo eliminado exitosamente",
      error: "Error al eliminar el tipo de vehículo",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<VehicleType>[] = [
  { 
    key: "Codigo" as keyof VehicleType, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof VehicleType, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Descripción" as keyof VehicleType, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  { 
    key: "Peso (ton)" as keyof VehicleType, 
    label: "Peso (ton)",
    render: (value) => value ? `${value} ton` : '-'
  },
  {
    key: "Activo" as keyof VehicleType,
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
    placeholder: "Ej: CAM-01",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Camión 3.5 Toneladas",
  },
  {
    name: "Descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del tipo de vehículo",
    className: "sm:col-span-2",
  },
  {
    name: "Capacidad Peso",
    label: "Capacidad de Peso (kg)",
    type: "number",
    min: 0,
    placeholder: "3500",
  },
  {
    name: "Capacidad Volumen",
    label: "Capacidad de Volumen (m³)",
    type: "number",
    min: 0,
    step: 0.1,
    placeholder: "15.5",
  },
  {
    name: "Requiere Refrigeracion",
    label: "Requiere Refrigeración",
    type: "switch",
    defaultValue: false,
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function VehicleTypesPage() {
  return (
    <CRUDPage<VehicleType>
      config={config}
      entityName="vehicle_types"
      columns={columns}
      formFields={formFields}
      formSchema={vehicleTypeSchema}
      searchFields={["Codigo", "Nombre"] as (keyof VehicleType)[]}
      defaultValues={{ Activo: true, 'Requiere Refrigeracion': false }}
    />
  )
}
