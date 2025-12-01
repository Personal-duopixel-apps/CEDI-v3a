import * as React from "react"
import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import type { Dock, FormField, CRUDConfig } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Schema de validación - coincide con columnas de Google Sheet
const dockSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  code: z.union([z.string(), z.number()]).optional(), // Número de Puerta (puede venir como número)
  distribution_center_id: z.string().optional(),
  type: z.string().optional(),
  capacity: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  notes: z.string().optional(), // Descripción
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "docks",
  labels: {
    singular: "Andén",
    plural: "Andenes",
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
      success: "Andén creado exitosamente",
      error: "Error al crear el andén",
    },
    update: {
      success: "Andén actualizado exitosamente",
      error: "Error al actualizar el andén",
    },
    delete: {
      success: "Andén eliminado exitosamente",
      error: "Error al eliminar el andén",
    },
  },
}

// Columnas de la tabla - coinciden con Google Sheet
const columns: DataTableColumn<Dock>[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "code", label: "Número", sortable: true },
  { key: "distribution_center_id", label: "Centro", sortable: true },
  { key: "type", label: "Tipo", sortable: true },
  { 
    key: "capacity", 
    label: "Capacidad",
    render: (value) => value ? String(value) : "-",
  },
  {
    key: "status",
    label: "Estado",
    render: (value) => {
      const isActive = value === "OPERATIONAL" || value === "Activo"
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {value || "Sin estado"}
        </Badge>
      )
    },
  },
]

// Campos del formulario - coinciden con Google Sheet
const formFields: FormField[] = [
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Puerta 1",
  },
  {
    name: "code",
    label: "Número de Puerta",
    type: "text",
    required: false,
    placeholder: "Ej: 1",
  },
  {
    name: "distribution_center_id",
    label: "Centro de Distribución",
    type: "select",
    required: true,
    placeholder: "Seleccionar centro...",
    optionsEntity: "centros_distribucion", // Carga opciones dinámicas
  },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: false,
    options: [
      { value: "Recepción", label: "Recepción" },
      { value: "Despacho", label: "Despacho" },
      { value: "Mixto", label: "Mixto" },
    ],
  },
  {
    name: "capacity",
    label: "Capacidad",
    type: "number",
    required: false,
    placeholder: "500",
    min: 0,
  },
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: false,
    options: [
      { value: "OPERATIONAL", label: "Operacional" },
      { value: "MAINTENANCE", label: "En Mantenimiento" },
      { value: "CLOSED", label: "Cerrado" },
    ],
  },
  {
    name: "notes",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la puerta...",
    className: "sm:col-span-2",
  },
]

export function DocksPage() {
  return (
    <CRUDPage<Dock>
      config={config}
      entityName="docks"
      columns={columns}
      formFields={formFields}
      formSchema={dockSchema}
      searchFields={["code", "name", "type"]}
      defaultValues={{ status: "OPERATIONAL" }}
    />
  )
}

