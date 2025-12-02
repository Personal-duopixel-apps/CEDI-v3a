import * as React from "react"
import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import type { Supplier, FormField, CRUDConfig } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Schema de validación
const supplierSchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20).optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email("Email inválido").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  is_active: z.boolean().default(true),
  payment_terms_days: z.number().min(0).optional().or(z.nan()),
  notes: z.string().optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "suppliers",
  labels: {
    singular: "Proveedor",
    plural: "Proveedores",
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
      success: "Proveedor creado exitosamente",
      error: "Error al crear el proveedor",
    },
    update: {
      success: "Proveedor actualizado exitosamente",
      error: "Error al actualizar el proveedor",
    },
    delete: {
      success: "Proveedor eliminado exitosamente",
      error: "Error al eliminar el proveedor",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<Supplier>[] = [
  { key: "code", label: "Código", sortable: true },
  { key: "name", label: "Nombre", sortable: true },
  { key: "tax_id", label: "NIT" },
  { key: "city", label: "Ciudad", sortable: true },
  { key: "contact_name", label: "Contacto" },
  { key: "contact_email", label: "Email" },
  {
    key: "payment_terms_days",
    label: "Plazo",
    render: (value) => value ? `${value} días` : "-",
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

// Países de América
const americanCountries = [
  "Guatemala",
  "México",
  "Estados Unidos",
  "Canadá",
  "Argentina",
  "Belice",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "Honduras",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
]

// Departamentos de Guatemala
const guatemalaStates = [
  "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula",
  "El Progreso", "Escuintla", "Guatemala", "Huehuetenango",
  "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango",
  "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos",
  "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"
]

// Campos del formulario
const formFields: FormField[] = [
  {
    name: "code",
    label: "Código",
    type: "text",
    required: true,
    placeholder: "Ej: PROV001",
    maxLength: 20,
  },
  {
    name: "name",
    label: "Nombre Comercial",
    type: "text",
    required: true,
    placeholder: "Ej: Distribuidora Farmacéutica Nacional",
  },
  {
    name: "legal_name",
    label: "Razón Social",
    type: "text",
    required: false,
    placeholder: "Ej: DIFARNA S.A. de C.V.",
  },
  {
    name: "tax_id",
    label: "NIT",
    type: "text",
    required: false,
    placeholder: "123456-7",
    maxLength: 15,
  },
  {
    name: "address",
    label: "Dirección",
    type: "text",
    required: false,
    placeholder: "12 Calle 1-25, Zona 10",
    className: "sm:col-span-2",
  },
  {
    name: "country",
    label: "País",
    type: "select",
    required: false,
    defaultValue: "Guatemala",
    options: americanCountries.map(c => ({ value: c, label: c })),
  },
  {
    name: "state",
    label: "Departamento/Estado",
    type: "select",
    required: false,
    options: guatemalaStates.map(s => ({ value: s, label: s })),
  },
  {
    name: "city",
    label: "Ciudad",
    type: "text",
    required: false,
    placeholder: "Ciudad de Guatemala",
  },
  {
    name: "postal_code",
    label: "Código Postal",
    type: "text",
    required: false,
    placeholder: "01010",
    maxLength: 10,
  },
  {
    name: "contact_name",
    label: "Nombre del Contacto",
    type: "text",
    required: false,
    placeholder: "María García",
  },
  {
    name: "contact_email",
    label: "Email del Contacto",
    type: "email",
    required: false,
    placeholder: "contacto@proveedor.mx",
  },
  {
    name: "contact_phone",
    label: "Teléfono del Contacto",
    type: "text",
    required: false,
    placeholder: "+52 55 9876 5432",
  },
  {
    name: "payment_terms_days",
    label: "Plazo de Pago (días)",
    type: "number",
    min: 0,
    max: 180,
    placeholder: "30",
  },
  {
    name: "notes",
    label: "Notas",
    type: "textarea",
    placeholder: "Notas adicionales sobre el proveedor...",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
    label: "Proveedor Activo",
    type: "switch",
    defaultValue: true,
    description: "El proveedor puede programar citas",
  },
]

export function SuppliersPage() {
  return (
    <CRUDPage<Supplier>
      config={config}
      entityName="suppliers"
      columns={columns}
      formFields={formFields}
      formSchema={supplierSchema}
      searchFields={["code", "name", "tax_id", "contact_name"]}
      defaultValues={{
        is_active: true,
        country: "Guatemala",
      }}
    />
  )
}


