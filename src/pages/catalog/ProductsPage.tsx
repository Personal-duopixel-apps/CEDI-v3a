import * as React from "react"
import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import type { Product, FormField, CRUDConfig } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Schema de validación
const productSchema = z.object({
  sku: z.string().min(3, "El SKU debe tener al menos 3 caracteres"),
  ean: z.string().min(8, "El código EAN debe tener al menos 8 dígitos").max(13),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  short_name: z.string().optional(),
  description: z.string().optional(),
  units_per_package: z.number().min(1, "Debe tener al menos 1 unidad"),
  weight_kg: z.number().optional(),
  temperature_requirement: z.enum(["ambient", "refrigerated", "frozen", "controlled"]),
  requires_cold_chain: z.boolean().default(false),
  is_controlled: z.boolean().default(false),
  is_hazardous: z.boolean().default(false),
  shelf_life_days: z.number().optional(),
  unit_cost: z.number().optional(),
  list_price: z.number().optional(),
  is_active: z.boolean().default(true),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "products",
  labels: {
    singular: "Producto",
    plural: "Productos",
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
      success: "Producto creado exitosamente",
      error: "Error al crear el producto",
    },
    update: {
      success: "Producto actualizado exitosamente",
      error: "Error al actualizar el producto",
    },
    delete: {
      success: "Producto eliminado exitosamente",
      error: "Error al eliminar el producto",
    },
  },
}

const temperatureLabels = {
  ambient: "Ambiente",
  refrigerated: "Refrigerado",
  frozen: "Congelado",
  controlled: "Controlado",
}

const temperatureColors = {
  ambient: "bg-gray-100 text-gray-800",
  refrigerated: "bg-blue-100 text-blue-800",
  frozen: "bg-cyan-100 text-cyan-800",
  controlled: "bg-purple-100 text-purple-800",
}

// Columnas de la tabla
const columns: DataTableColumn<Product>[] = [
  { key: "sku", label: "SKU", sortable: true },
  { key: "name", label: "Nombre", sortable: true },
  { key: "ean", label: "EAN" },
  {
    key: "temperature_requirement",
    label: "Temp.",
    render: (value) => {
      const temp = value as keyof typeof temperatureLabels
      return (
        <Badge className={temperatureColors[temp]}>
          {temperatureLabels[temp]}
        </Badge>
      )
    },
  },
  {
    key: "requires_cold_chain",
    label: "Cadena Frío",
    render: (value) => (value ? "Sí" : "No"),
  },
  {
    key: "is_controlled",
    label: "Controlado",
    render: (value) => (
      value ? <Badge variant="warning">Sí</Badge> : <span className="text-muted-foreground">No</span>
    ),
  },
  {
    key: "list_price",
    label: "Precio",
    render: (value) => value ? `$${Number(value).toFixed(2)}` : "-",
  },
  {
    key: "is_active",
    label: "Estado",
    render: (value) => (
      <Badge variant={value ? "success" : "secondary"}>
        {value ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
]

// Campos del formulario
const formFields: FormField[] = [
  {
    name: "sku",
    label: "SKU",
    type: "text",
    required: true,
    placeholder: "Ej: MED-001",
    description: "Código interno único del producto",
  },
  {
    name: "ean",
    label: "Código EAN",
    type: "text",
    required: true,
    placeholder: "7501234567890",
    maxLength: 13,
    description: "Código de barras del producto",
  },
  {
    name: "name",
    label: "Nombre Completo",
    type: "text",
    required: true,
    placeholder: "Ej: Paracetamol 500mg Tabletas",
    className: "sm:col-span-2",
  },
  {
    name: "short_name",
    label: "Nombre Corto",
    type: "text",
    placeholder: "Ej: Paracetamol",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del producto...",
    className: "sm:col-span-2",
  },
  {
    name: "units_per_package",
    label: "Unidades por Paquete",
    type: "number",
    required: true,
    min: 1,
    defaultValue: 1,
  },
  {
    name: "weight_kg",
    label: "Peso (kg)",
    type: "number",
    step: 0.001,
    min: 0,
    placeholder: "0.050",
  },
  {
    name: "temperature_requirement",
    label: "Requerimiento de Temperatura",
    type: "select",
    required: true,
    options: [
      { value: "ambient", label: "Ambiente (15-25°C)" },
      { value: "refrigerated", label: "Refrigerado (2-8°C)" },
      { value: "frozen", label: "Congelado (<-18°C)" },
      { value: "controlled", label: "Controlado" },
    ],
  },
  {
    name: "shelf_life_days",
    label: "Vida Útil (días)",
    type: "number",
    min: 1,
    placeholder: "365",
  },
  {
    name: "unit_cost",
    label: "Costo Unitario",
    type: "number",
    step: 0.01,
    min: 0,
    placeholder: "15.50",
  },
  {
    name: "list_price",
    label: "Precio de Lista",
    type: "number",
    step: 0.01,
    min: 0,
    placeholder: "35.00",
  },
  {
    name: "requires_cold_chain",
    label: "Requiere Cadena de Frío",
    type: "switch",
    defaultValue: false,
  },
  {
    name: "is_controlled",
    label: "Producto Controlado",
    type: "switch",
    defaultValue: false,
    description: "Requiere control especial de COFEPRIS",
  },
  {
    name: "is_hazardous",
    label: "Material Peligroso",
    type: "switch",
    defaultValue: false,
  },
  {
    name: "is_active",
    label: "Producto Activo",
    type: "switch",
    defaultValue: true,
    description: "Disponible para operaciones",
  },
]

export function ProductsPage() {
  return (
    <CRUDPage<Product>
      config={config}
      entityName="products"
      columns={columns}
      formFields={formFields}
      formSchema={productSchema}
      searchFields={["sku", "name", "ean"]}
      defaultValues={{
        is_active: true,
        requires_cold_chain: false,
        is_controlled: false,
        is_hazardous: false,
        units_per_package: 1,
        temperature_requirement: "ambient",
      }}
    />
  )
}


