import * as React from "react"
import { Calendar, FileText, Barcode, Shield, Snowflake, Building2, Pill, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWizard } from "../WizardContext"

const SI_NO_OPTIONS = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
]

export function Step4InformacionAdicional() {
  const { data, updateData, catalogs, catalogsLoading } = useWizard()
  
  // Usar los catálogos del contexto
  const clasificaciones = catalogs.classifications
  const impuestos = catalogs.taxes
  const nivelesProducto = catalogs.product_levels
  const isLoading = catalogsLoading

  const handleChange = (field: string, value: string | boolean) => {
    updateData("informacionAdicional", { [field]: value })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Información adicional</h2>
        <div className="w-16 h-1 bg-purple-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Registro sanitario */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vencimientoRegistroSanitario" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Vencimiento del registro sanitario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vencimientoRegistroSanitario"
              type="date"
              value={data.informacionAdicional.vencimientoRegistroSanitario}
              onChange={(e) => handleChange("vencimientoRegistroSanitario", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroRegistroSanitario" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Número de registro sanitario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numeroRegistroSanitario"
              placeholder="Número de registro sanitario"
              value={data.informacionAdicional.numeroRegistroSanitario}
              onChange={(e) => handleChange("numeroRegistroSanitario", e.target.value)}
            />
          </div>
        </div>

        {/* Código de barras */}
        <div className="space-y-2">
          <Label htmlFor="codigoBarras" className="flex items-center gap-2">
            <Barcode className="h-4 w-4 text-muted-foreground" />
            Código de barras <span className="text-red-500">*</span>
          </Label>
          <Input
            id="codigoBarras"
            placeholder="Código de barras del producto"
            value={data.informacionAdicional.codigoBarras}
            onChange={(e) => handleChange("codigoBarras", e.target.value)}
          />
        </div>

        {/* Características del producto */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Producto controlado
            </Label>
            <Select
              value={data.informacionAdicional.productoControlado}
              onValueChange={(value) => handleChange("productoControlado", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                {SI_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Snowflake className="h-4 w-4 text-muted-foreground" />
              Producto refrigerado
            </Label>
            <Select
              value={data.informacionAdicional.productoRefrigerado}
              onValueChange={(value) => handleChange("productoRefrigerado", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                {SI_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Producto de uso hospitalario
            </Label>
            <Select
              value={data.informacionAdicional.productoUsoHospitalario}
              onValueChange={(value) => handleChange("productoUsoHospitalario", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                {SI_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Pill className="h-4 w-4 text-muted-foreground" />
              Requiere receta
            </Label>
            <Select
              value={data.informacionAdicional.requiereReceta}
              onValueChange={(value) => handleChange("requiereReceta", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                {SI_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Uso Crónico
            </Label>
            <Select
              value={data.informacionAdicional.usoCronico}
              onValueChange={(value) => handleChange("usoCronico", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
              <SelectContent>
                {SI_NO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Canales de comercialización */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Canales de comercialización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="farmaciasPropias"
                  checked={data.informacionAdicional.farmaciasPropias}
                  onCheckedChange={(checked) => handleChange("farmaciasPropias", checked as boolean)}
                />
                <Label htmlFor="farmaciasPropias" className="text-sm font-normal cursor-pointer">
                  Farmacias propias
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="farmaciasIndependientes"
                  checked={data.informacionAdicional.farmaciasIndependientes}
                  onCheckedChange={(checked) => handleChange("farmaciasIndependientes", checked as boolean)}
                />
                <Label htmlFor="farmaciasIndependientes" className="text-sm font-normal cursor-pointer">
                  Farmacias independientes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="institucionalHospitalario"
                  checked={data.informacionAdicional.institucionalHospitalario}
                  onCheckedChange={(checked) => handleChange("institucionalHospitalario", checked as boolean)}
                />
                <Label htmlFor="institucionalHospitalario" className="text-sm font-normal cursor-pointer">
                  Institucional/hospitalario
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ruteo"
                  checked={data.informacionAdicional.ruteo}
                  onCheckedChange={(checked) => handleChange("ruteo", checked as boolean)}
                />
                <Label htmlFor="ruteo" className="text-sm font-normal cursor-pointer">
                  Ruteo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mayoreo"
                  checked={data.informacionAdicional.mayoreo}
                  onCheckedChange={(checked) => handleChange("mayoreo", checked as boolean)}
                />
                <Label htmlFor="mayoreo" className="text-sm font-normal cursor-pointer">
                  Mayoreo
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoservicio"
                  checked={data.informacionAdicional.autoservicio}
                  onCheckedChange={(checked) => handleChange("autoservicio", checked as boolean)}
                />
                <Label htmlFor="autoservicio" className="text-sm font-normal cursor-pointer">
                  Autoservicio
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clasificación e impuestos */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Clasificación <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.informacionAdicional.clasificacionId}
              onValueChange={(value) => handleChange("clasificacionId", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione..."} />
              </SelectTrigger>
              <SelectContent>
                {clasificaciones.filter(i => i.id && i.name).map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Tipo de impuesto <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.informacionAdicional.tipoImpuestoId}
              onValueChange={(value) => handleChange("tipoImpuestoId", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione..."} />
              </SelectTrigger>
              <SelectContent>
                {impuestos.filter(i => i.id && i.name).map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tipo de producto (Niveles) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tipo de producto:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm">
                  Nivel 1 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.informacionAdicional.nivel1Id}
                  onValueChange={(value) => handleChange("nivel1Id", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nivelesProducto.filter(i => i.id && i.name).map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Nivel 2 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.informacionAdicional.nivel2Id}
                  onValueChange={(value) => handleChange("nivel2Id", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nivelesProducto.filter(i => i.id && i.name).map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Nivel 3 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.informacionAdicional.nivel3Id}
                  onValueChange={(value) => handleChange("nivel3Id", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nivelesProducto.filter(i => i.id && i.name).map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Nivel 4</Label>
                <Select
                  value={data.informacionAdicional.nivel4Id}
                  onValueChange={(value) => handleChange("nivel4Id", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nivelesProducto.filter(i => i.id && i.name).map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

