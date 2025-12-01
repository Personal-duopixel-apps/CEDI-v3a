import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  DoorOpen,
  Clock,
  ChevronLeft,
  Truck,
  User,
  Phone,
  FileText,
  Package,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BookingSelection {
  centro: { id: string; Nombre: string } | null
  puerta: { id: string; Nombre: string } | null
  fecha: Date | null
  horario: string | null
}

interface Proveedor {
  id: string
  Nombre: string
}

interface TipoVehiculo {
  id: string
  Nombre: string
}

interface BookingStep2Props {
  selection: BookingSelection
  proveedores: Proveedor[]
  tiposVehiculo: TipoVehiculo[]
  onBack: () => void
  onSubmit: (data: AppointmentFormData) => void
  isSubmitting?: boolean
}

const appointmentSchema = z.object({
  proveedor_id: z.string().min(1, "Selecciona un proveedor"),
  tipo_vehiculo_id: z.string().min(1, "Selecciona un tipo de vehículo"),
  ordenes_compra: z.string().optional(),
  conductor_nombre: z.string().optional(),
  conductor_telefono: z.string().optional(),
  placas_vehiculo: z.string().optional(),
  notas: z.string().optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export function BookingStep2({
  selection,
  proveedores,
  tiposVehiculo,
  onBack,
  onSubmit,
  isSubmitting = false,
}: BookingStep2Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const proveedorId = watch("proveedor_id")
  const tipoVehiculoId = watch("tipo_vehiculo_id")

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Resumen de selección */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{selection.centro?.Nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">{selection.puerta?.Nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {selection.fecha && format(selection.fecha, "EEEE d 'de' MMMM", { locale: es })} a las {selection.horario}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Cambiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Datos de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor *</Label>
                <Select
                  value={proveedorId}
                  onValueChange={(value) => setValue("proveedor_id", value)}
                >
                  <SelectTrigger className={errors.proveedor_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((prov) => (
                      <SelectItem key={prov.id} value={prov.id}>
                        {prov.Nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.proveedor_id && (
                  <p className="text-sm text-red-500">{errors.proveedor_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_vehiculo">Tipo de Vehículo *</Label>
                <Select
                  value={tipoVehiculoId}
                  onValueChange={(value) => setValue("tipo_vehiculo_id", value)}
                >
                  <SelectTrigger className={errors.tipo_vehiculo_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposVehiculo.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.Nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_vehiculo_id && (
                  <p className="text-sm text-red-500">{errors.tipo_vehiculo_id.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordenes_compra">
                <FileText className="h-4 w-4 inline mr-1" />
                Órdenes de Compra
              </Label>
              <Input
                {...register("ordenes_compra")}
                placeholder="PO-001, PO-002, PO-003"
              />
              <p className="text-xs text-muted-foreground">
                Ingresa los números de PO separados por comas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Datos de transporte (opcionales) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5 text-primary" />
              Datos de Transporte
              <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conductor_nombre">
                  <User className="h-4 w-4 inline mr-1" />
                  Nombre del Conductor
                </Label>
                <Input
                  {...register("conductor_nombre")}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conductor_telefono">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Teléfono del Conductor
                </Label>
                <Input
                  {...register("conductor_telefono")}
                  placeholder="+502 1234 5678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placas_vehiculo">Placas del Vehículo</Label>
              <Input
                {...register("placas_vehiculo")}
                placeholder="ABC-123"
                className="uppercase"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notas")}
              placeholder="Instrucciones especiales, comentarios, etc."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creando cita...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirmar Cita
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

