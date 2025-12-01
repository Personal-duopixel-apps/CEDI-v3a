import * as React from "react"
import { User, Building2, Phone, Mail, Calendar, UserCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/services/database.service"
import { useWizard } from "../WizardContext"

interface Buyer {
  id: string
  Nombre: string
}

export function Step1Solicitante() {
  const { data, updateData } = useWizard()
  const [buyers, setBuyers] = React.useState<Buyer[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadBuyers() {
      try {
        const buyersData = await db.getAll("buyers")
        setBuyers(buyersData as Buyer[])
      } catch (error) {
        console.error("Error cargando compradores:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBuyers()
  }, [])

  const handleChange = (field: string, value: string) => {
    updateData("solicitante", { [field]: value })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Información del solicitante</h2>
        <div className="w-16 h-1 bg-primary mx-auto mt-2 rounded-full" />
      </div>

      {/* Form */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Nombre razón social */}
        <div className="space-y-2">
          <Label htmlFor="nombreRazonSocial" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Nombre razón social <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombreRazonSocial"
            placeholder="Ingrese el nombre de la razón social"
            value={data.solicitante.nombreRazonSocial}
            onChange={(e) => handleChange("nombreRazonSocial", e.target.value)}
          />
        </div>

        {/* Nombre del solicitante */}
        <div className="space-y-2">
          <Label htmlFor="nombreSolicitante" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Nombre del solicitante <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombreSolicitante"
            placeholder="Nombre completo del solicitante"
            value={data.solicitante.nombreSolicitante}
            onChange={(e) => handleChange("nombreSolicitante", e.target.value)}
          />
        </div>

        {/* Nombre del laboratorio */}
        <div className="space-y-2">
          <Label htmlFor="nombreLaboratorio" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Nombre del laboratorio
          </Label>
          <Input
            id="nombreLaboratorio"
            placeholder="Nombre del laboratorio"
            value={data.solicitante.nombreLaboratorio}
            onChange={(e) => handleChange("nombreLaboratorio", e.target.value)}
          />
        </div>

        {/* Teléfono/Celular */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Teléfono/Celular
          </Label>
          <div className="flex">
            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
              <span className="text-sm">🇬🇹</span>
            </div>
            <Input
              id="telefono"
              type="tel"
              placeholder="Número de teléfono"
              value={data.solicitante.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              className="rounded-l-none"
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-2">
          <Label htmlFor="fecha" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Fecha
          </Label>
          <Input
            id="fecha"
            type="date"
            value={data.solicitante.fecha}
            onChange={(e) => handleChange("fecha", e.target.value)}
          />
        </div>

        {/* Correo electrónico */}
        <div className="space-y-2">
          <Label htmlFor="correoElectronico" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Correo electrónico <span className="text-red-500">*</span>
          </Label>
          <Input
            id="correoElectronico"
            type="email"
            placeholder="correo@ejemplo.com"
            value={data.solicitante.correoElectronico}
            onChange={(e) => handleChange("correoElectronico", e.target.value)}
          />
        </div>

        {/* Comprador */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="compradorId" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            Comprador <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.solicitante.compradorId}
            onValueChange={(value) => handleChange("compradorId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Cargando compradores..." : "Busca o selecciona un comprador..."} />
            </SelectTrigger>
            <SelectContent>
              {buyers.map((buyer) => (
                <SelectItem key={buyer.id} value={buyer.id}>
                  {buyer.Nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

