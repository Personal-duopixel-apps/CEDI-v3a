import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Truck, User, Phone, FileText, Check, AlertCircle } from "lucide-react"
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

// Schema de validación para datos de transporte
const transportDataSchema = z.object({
  tipo_vehiculo: z.string().min(1, "Seleccione un tipo de vehículo"),
  placas_vehiculo: z.string().min(3, "Ingrese las placas del vehículo"),
  marca_vehiculo: z.string().optional(),
  modelo_vehiculo: z.string().optional(),
  color_vehiculo: z.string().optional(),
  conductor_nombre: z.string().min(3, "Ingrese el nombre del conductor"),
  conductor_telefono: z.string().min(8, "Ingrese un teléfono válido"),
  conductor_licencia: z.string().optional(),
  conductor_dpi: z.string().optional(),
  ayudantes_cantidad: z.string().optional(),
  notas_transporte: z.string().optional(),
})

type TransportFormData = z.infer<typeof transportDataSchema>

interface AppointmentInfo {
  id: string
  fecha: string
  hora: string
  puerta: string
  centro: string
  proveedor: string
}

interface TransportDataFormProps {
  appointmentInfo: AppointmentInfo
  tiposVehiculo: Array<{ id: string; name: string }>
  onSubmit: (data: TransportFormData) => Promise<void>
  isSubmitting?: boolean
}

export function TransportDataForm({
  appointmentInfo,
  tiposVehiculo,
  onSubmit,
  isSubmitting = false,
}: TransportDataFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransportFormData>({
    resolver: zodResolver(transportDataSchema),
  })

  const tipoVehiculo = watch("tipo_vehiculo")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Datos de Transporte</h1>
          <p className="text-gray-600 mt-2">Complete los datos del vehículo y conductor para su cita</p>
        </motion.div>

        {/* Appointment Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Información de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Fecha:</span>
                  <p className="font-medium">{appointmentInfo.fecha}</p>
                </div>
                <div>
                  <span className="text-gray-500">Hora:</span>
                  <p className="font-medium">{appointmentInfo.hora}</p>
                </div>
                <div>
                  <span className="text-gray-500">Centro:</span>
                  <p className="font-medium">{appointmentInfo.centro}</p>
                </div>
                <div>
                  <span className="text-gray-500">Puerta:</span>
                  <p className="font-medium">{appointmentInfo.puerta}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Proveedor:</span>
                  <p className="font-medium">{appointmentInfo.proveedor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transport Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Datos del Vehículo
              </CardTitle>
              <CardDescription>
                Ingrese la información del vehículo que realizará la entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Vehicle Section */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_vehiculo">Tipo de Vehículo *</Label>
                    <Select
                      value={tipoVehiculo}
                      onValueChange={(value) => setValue("tipo_vehiculo", value)}
                    >
                      <SelectTrigger className={errors.tipo_vehiculo ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposVehiculo.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.name}>
                            {tipo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tipo_vehiculo && (
                      <p className="text-sm text-red-500">{errors.tipo_vehiculo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placas_vehiculo">Placas del Vehículo *</Label>
                    <Input
                      id="placas_vehiculo"
                      placeholder="Ej: P-123ABC"
                      {...register("placas_vehiculo")}
                      className={errors.placas_vehiculo ? "border-red-500" : ""}
                    />
                    {errors.placas_vehiculo && (
                      <p className="text-sm text-red-500">{errors.placas_vehiculo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marca_vehiculo">Marca</Label>
                    <Input
                      id="marca_vehiculo"
                      placeholder="Ej: Freightliner"
                      {...register("marca_vehiculo")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelo_vehiculo">Modelo</Label>
                    <Input
                      id="modelo_vehiculo"
                      placeholder="Ej: 2022"
                      {...register("modelo_vehiculo")}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="color_vehiculo">Color</Label>
                    <Input
                      id="color_vehiculo"
                      placeholder="Ej: Blanco"
                      {...register("color_vehiculo")}
                    />
                  </div>
                </div>

                {/* Driver Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Datos del Conductor
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="conductor_nombre">Nombre Completo *</Label>
                      <Input
                        id="conductor_nombre"
                        placeholder="Nombre del conductor"
                        {...register("conductor_nombre")}
                        className={errors.conductor_nombre ? "border-red-500" : ""}
                      />
                      {errors.conductor_nombre && (
                        <p className="text-sm text-red-500">{errors.conductor_nombre.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conductor_telefono">Teléfono *</Label>
                      <Input
                        id="conductor_telefono"
                        placeholder="Ej: 5555-1234"
                        {...register("conductor_telefono")}
                        className={errors.conductor_telefono ? "border-red-500" : ""}
                      />
                      {errors.conductor_telefono && (
                        <p className="text-sm text-red-500">{errors.conductor_telefono.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conductor_licencia">No. de Licencia</Label>
                      <Input
                        id="conductor_licencia"
                        placeholder="Número de licencia"
                        {...register("conductor_licencia")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conductor_dpi">DPI/Identificación</Label>
                      <Input
                        id="conductor_dpi"
                        placeholder="Número de DPI"
                        {...register("conductor_dpi")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ayudantes_cantidad">Cantidad de Ayudantes</Label>
                      <Select
                        onValueChange={(value) => setValue("ayudantes_cantidad", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sin ayudantes</SelectItem>
                          <SelectItem value="1">1 ayudante</SelectItem>
                          <SelectItem value="2">2 ayudantes</SelectItem>
                          <SelectItem value="3">3 ayudantes</SelectItem>
                          <SelectItem value="4+">4 o más</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="border-t pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="notas_transporte">Notas Adicionales</Label>
                    <Textarea
                      id="notas_transporte"
                      placeholder="Información adicional sobre el transporte..."
                      {...register("notas_transporte")}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Enviar Datos de Transporte
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <p className="flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Los campos marcados con * son obligatorios
          </p>
        </motion.div>
      </div>
    </div>
  )
}

