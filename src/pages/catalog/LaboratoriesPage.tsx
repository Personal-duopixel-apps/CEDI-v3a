import * as React from "react"
import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import type { Laboratory, FormField, CRUDConfig } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Schema de validación
const laboratorySchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(10),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  country: z.string().min(2, "El país es requerido"),
  is_active: z.boolean().default(true),
  contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "laboratories",
  labels: {
    singular: "Laboratorio",
    plural: "Laboratorios",
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
      success: "Laboratorio creado exitosamente",
      error: "Error al crear el laboratorio",
    },
    update: {
      success: "Laboratorio actualizado exitosamente",
      error: "Error al actualizar el laboratorio",
    },
    delete: {
      success: "Laboratorio eliminado exitosamente",
      error: "Error al eliminar el laboratorio",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<Laboratory>[] = [
  { key: "code", label: "Código", sortable: true },
  { key: "name", label: "Nombre", sortable: true },
  { key: "country", label: "País", sortable: true },
  {
    key: "is_active",
    label: "Estado",
    render: (value) => (
      <Badge variant={value ? "success" : "secondary"}>
        {value ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  { key: "contact_email", label: "Email" },
]

// Campos del formulario
const formFields: FormField[] = [
  {
    name: "code",
    label: "Código",
    type: "text",
    required: true,
    placeholder: "Ej: PFZ",
    maxLength: 10,
    description: "Código único del laboratorio (máx. 10 caracteres)",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Pfizer",
  },
  {
    name: "country",
    label: "País",
    type: "select",
    required: true,
    options: [
      { value: "México", label: "México" },
      { value: "USA", label: "Estados Unidos" },
      { value: "Alemania", label: "Alemania" },
      { value: "Suiza", label: "Suiza" },
      { value: "Francia", label: "Francia" },
      { value: "Reino Unido", label: "Reino Unido" },
      { value: "España", label: "España" },
      { value: "India", label: "India" },
      { value: "China", label: "China" },
      { value: "Otro", label: "Otro" },
    ],
  },
  {
    name: "contact_email",
    label: "Email de Contacto",
    type: "email",
    placeholder: "contacto@laboratorio.com",
  },
  {
    name: "contact_phone",
    label: "Teléfono de Contacto",
    type: "text",
    placeholder: "+52 55 1234 5678",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
    description: "El laboratorio está disponible para asignar a productos",
  },
]

export function LaboratoriesPage() {
  return (
    <CRUDPage<Laboratory>
      config={config}
      entityName="laboratories"
      columns={columns}
      formFields={formFields}
      formSchema={laboratorySchema}
      searchFields={["code", "name", "country"]}
      defaultValues={{ is_active: true }}
    />
  )
}

