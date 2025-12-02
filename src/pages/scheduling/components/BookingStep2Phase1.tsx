import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Building2,
  Clock,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Schema de validación para Fase 1 (solo datos básicos)
const phase1Schema = z.object({
  proveedor_id: z.string().min(1, "Seleccione un proveedor"),
  contacto_nombre: z.string().min(2, "Ingrese el nombre del contacto"),
  contacto_email: z.string().email("Ingrese un email válido"),
  contacto_telefono: z.string().optional(),
  ordenes_compra: z.string().optional(),
  notas: z.string().optional(),
})

export type AppointmentFormDataPhase1 = z.infer<typeof phase1Schema>

interface BookingSelection {
  centro: { id: string; name: string } | null
  puerta: { id: string; name: string } | null
  fecha: Date | null
  horario: string | null
  horarios?: string[]  // Múltiples horarios seleccionados
}

interface Proveedor {
  id: string
  name: string
  contact_email?: string
  contact_phone?: string
  contact_name?: string
}

interface BookingStep2Phase1Props {
  bookingSelection: BookingSelection
  proveedores: Proveedor[]
  onBack: () => void
  onSubmit: (data: AppointmentFormDataPhase1) => Promise<void>
  isSubmitting?: boolean
}

export function BookingStep2Phase1({
  bookingSelection,
  proveedores,
  onBack,
  onSubmit,
  isSubmitting = false,
}: BookingStep2Phase1Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormDataPhase1>({
    resolver: zodResolver(phase1Schema),
    defaultValues: {
      proveedor_id: "",
      contacto_nombre: "",
      contacto_email: "",
      contacto_telefono: "",
      ordenes_compra: "",
      notas: "",
    },
  })

  const proveedorId = watch("proveedor_id")

  // Cuando se selecciona un proveedor, autocompletar datos de contacto
  React.useEffect(() => {
    if (proveedorId) {
      const proveedor = proveedores.find(p => p.id === proveedorId)
      if (proveedor) {
        if (proveedor.contact_name) setValue("contacto_nombre", proveedor.contact_name)
        if (proveedor.contact_email) setValue("contacto_email", proveedor.contact_email)
        if (proveedor.contact_phone) setValue("contacto_telefono", proveedor.contact_phone)
      }
    }
  }, [proveedorId, proveedores, setValue])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fase 1: Datos de la Cita</h2>
          <p className="text-gray-500 mt-1">Complete los datos básicos para programar la cita</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <span className="text-purple-600 font-medium">Paso 2 de 2</span>
        </Badge>
      </div>

      {/* Selected Slot Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{bookingSelection.centro?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span>{bookingSelection.puerta?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>
                    {bookingSelection.fecha
                      ? format(bookingSelection.fecha, "EEEE d 'de' MMMM", { locale: es })
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-purple-600" />
                  {bookingSelection.horarios && bookingSelection.horarios.length > 1 ? (
                    <div className="flex flex-wrap gap-1">
                      {bookingSelection.horarios.map((h) => (
                        <Badge key={h} variant="secondary" className="text-xs">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="font-medium">{bookingSelection.horario}</span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Proveedor Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Información del Proveedor
              </CardTitle>
              <CardDescription>
                Seleccione el proveedor que realizará la entrega
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor_id">Proveedor *</Label>
                <Select
                  value={proveedorId}
                  onValueChange={(value) => setValue("proveedor_id", value)}
                >
                  <SelectTrigger className={errors.proveedor_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.filter(p => p.id && p.name).map((prov) => (
                      <SelectItem key={prov.id} value={String(prov.id)}>
                        {prov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.proveedor_id && (
                  <p className="text-sm text-red-500">{errors.proveedor_id.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                Datos de Contacto
              </CardTitle>
              <CardDescription>
                Información de la persona que recibirá el enlace para completar los datos de transporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nombre">Nombre del Contacto *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contacto_nombre"
                      placeholder="Nombre completo"
                      className={`pl-9 ${errors.contacto_nombre ? "border-red-500" : ""}`}
                      {...register("contacto_nombre")}
                    />
                  </div>
                  {errors.contacto_nombre && (
                    <p className="text-sm text-red-500">{errors.contacto_nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contacto_email"
                      type="email"
                      placeholder="correo@empresa.com"
                      className={`pl-9 ${errors.contacto_email ? "border-red-500" : ""}`}
                      {...register("contacto_email")}
                    />
                  </div>
                  {errors.contacto_email && (
                    <p className="text-sm text-red-500">{errors.contacto_email.message}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="contacto_telefono">Teléfono (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contacto_telefono"
                      placeholder="Teléfono de contacto"
                      className="pl-9"
                      {...register("contacto_telefono")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-amber-600" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ordenes_compra">Órdenes de Compra</Label>
                <Input
                  id="ordenes_compra"
                  placeholder="Ej: OC-001, OC-002 (separadas por coma)"
                  {...register("ordenes_compra")}
                />
                <p className="text-xs text-gray-500">Opcional: Ingrese los números de órdenes de compra relacionadas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Instrucciones especiales o comentarios..."
                  rows={3}
                  {...register("notas")}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">¿Qué sucede después?</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Se creará la cita con los datos proporcionados</li>
                    <li>Se enviará un correo al contacto con un enlace para completar los datos de transporte (vehículo y conductor)</li>
                    <li>Una vez completados los datos de transporte, la cita quedará lista para aprobación</li>
                    <li>Al aprobar, se generará el código de confirmación y la carta de cita</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando cita...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Crear Cita y Enviar Enlace
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}


