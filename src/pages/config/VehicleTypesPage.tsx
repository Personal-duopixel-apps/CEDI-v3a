import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo de vehículo basado en Google Sheets (nombres mapeados)
interface VehicleType extends BaseEntity {
  code?: string
  name: string
  description?: string
  max_weight?: string | number  // Peso (ton) mapeado
  is_active?: boolean | string
}

// Schema de validación
const vehicleTypeSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: optionalString,
  max_weight: stringFromAny,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "vehicle_types",
  labels: {
    singular: "Tipo de Vehículo",
    plural: "Tipos de Vehículo",
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

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<VehicleType>[] = [
  { 
    key: "code", 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "name", 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "description", 
    label: "Descripción",
    render: (value) => value || '-'
  },
  { 
    key: "max_weight", 
    label: "Peso (ton)",
    render: (value) => value ? `${value} ton` : '-'
  },
  {
    key: "is_active",
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

// Campos del formulario (nombres mapeados)
const formFields: FormField[] = [
  {
    name: "code",
    label: "Código",
    type: "text",
    placeholder: "Ej: CAM-01",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Camión 3.5 Toneladas",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del tipo de vehículo",
    className: "sm:col-span-2",
  },
  {
    name: "max_weight",
    label: "Peso (ton)",
    type: "number",
    min: 0,
    step: 0.1,
    placeholder: "3.5",
  },
  {
    name: "is_active",
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
      searchFields={["code", "name"]}
      defaultValues={{ is_active: true }}
    />
  )
}
