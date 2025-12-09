
import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import type { Buyer, FormField, CRUDConfig } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Schema de validación
const buyerSchema = z.object({
  code: z.string().min(2, "El código debe tener al menos 2 caracteres").max(20),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  is_active: z.boolean().default(true),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "buyers",
  labels: {
    singular: "Comprador",
    plural: "Compradores",
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
      success: "Comprador creado exitosamente",
      error: "Error al crear el comprador",
    },
    update: {
      success: "Comprador actualizado exitosamente",
      error: "Error al actualizar el comprador",
    },
    delete: {
      success: "Comprador eliminado exitosamente",
      error: "Error al eliminar el comprador",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<Buyer>[] = [
  { key: "code", label: "Código", sortable: true },
  { key: "name", label: "Nombre", sortable: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Teléfono" },
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
    name: "code",
    label: "Código",
    type: "text",
    required: true,
    placeholder: "Ej: BUY001",
    maxLength: 20,
  },
  {
    name: "name",
    label: "Nombre Completo",
    type: "text",
    required: true,
    placeholder: "Juan Martínez",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "jmartinez@cedi.mx",
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "text",
    placeholder: "+52 55 1111 2222",
  },
  {
    name: "is_active",
    label: "Comprador Activo",
    type: "switch",
    defaultValue: true,
    description: "Puede ser asignado a proveedores",
  },
]

export function BuyersPage() {
  return (
    <CRUDPage<Buyer>
      config={config}
      entityName="buyers"
      columns={columns}
      formFields={formFields}
      formSchema={buyerSchema}
      searchFields={["code", "name", "email"]}
      defaultValues={{ is_active: true }}
    />
  )
}


