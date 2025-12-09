
import { DollarSign, Percent, Plus, Trash2, Gift, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWizard } from "../WizardContext"
import type { BonificacionItem } from "../types"

const SI_NO_OPTIONS = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
]

export function Step5DatosCompra() {
  const { data, updateData, catalogs, catalogsLoading } = useWizard()

  // Usar los catálogos del contexto
  const monedas = catalogs.currencies
  const isLoading = catalogsLoading

  const handleChange = (field: string, value: string | number) => {
    updateData("datosCompra", { [field]: value })
  }

  // Calcular márgenes automáticamente
  const calcularMargen = (precioVenta: number, precioCompra: number) => {
    if (precioCompra <= 0) return 0
    return ((precioVenta - precioCompra) / precioCompra) * 100
  }

  // Actualizar precio y recalcular margen
  const handlePrecioChange = (field: string, value: number, margenField: string) => {
    updateData("datosCompra", {
      [field]: value,
      [margenField]: calcularMargen(value, data.datosCompra.precioCompraConIva)
    })
  }

  // Bonificaciones
  const addBonificacion = () => {
    const newItem: BonificacionItem = { base: "", cantidad: "", costo: 0 }
    updateData("datosCompra", {
      bonificaciones: [...data.datosCompra.bonificaciones, newItem],
    })
  }

  const removeBonificacion = (index: number) => {
    const updated = data.datosCompra.bonificaciones.filter((_, i) => i !== index)
    updateData("datosCompra", { bonificaciones: updated })
  }

  const updateBonificacion = (index: number, field: keyof BonificacionItem, value: string | number) => {
    const updated = data.datosCompra.bonificaciones.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateData("datosCompra", { bonificaciones: updated })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Datos de compra</h2>
        <div className="w-16 h-1 bg-blue-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Márgenes y precios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Márgenes y precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Datos de compra */}
            <Card className="bg-slate-50 dark:bg-slate-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Datos de compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">
                    Precio de compra (Con IVA) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={data.datosCompra.precioCompraConIva || ""}
                    onChange={(e) => handleChange("precioCompraConIva", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Precio de compra (Sin IVA)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={data.datosCompra.precioCompraSinIva || ""}
                    onChange={(e) => handleChange("precioCompraSinIva", parseFloat(e.target.value) || 0)}
                    className="bg-muted"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Tipo de moneda <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={data.datosCompra.tipoMonedaId}
                    onValueChange={(value) => handleChange("tipoMonedaId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione el tipo de moneda"} />
                    </SelectTrigger>
                    <SelectContent>
                      {monedas.filter(i => i.id && i.name).map((item) => (
                        <SelectItem key={item.id} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Costo a Bofasa</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Costo a Bofasa"
                      value={data.datosCompra.costoBofasa || ""}
                      onChange={(e) => handleChange("costoBofasa", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Margen</Label>
                    <Input
                      value={`${data.datosCompra.margenCostoBofasa.toFixed(2)}%`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Precios de venta */}
            <Card className="bg-emerald-50 dark:bg-emerald-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Precios de venta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Precio de lista (Con IVA)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={data.datosCompra.precioListaConIva || ""}
                      onChange={(e) => handlePrecioChange("precioListaConIva", parseFloat(e.target.value) || 0, "margenPrecioLista")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Margen</Label>
                    <Input
                      value={`${data.datosCompra.margenPrecioLista.toFixed(2)}%`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Precio público (Con IVA) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={data.datosCompra.precioPublicoConIva || ""}
                      onChange={(e) => handlePrecioChange("precioPublicoConIva", parseFloat(e.target.value) || 0, "margenPrecioPublico")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Margen</Label>
                    <Input
                      value={`${data.datosCompra.margenPrecioPublico.toFixed(2)}%`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Precio de mayorista (Con IVA)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={data.datosCompra.precioMayoristaConIva || ""}
                      onChange={(e) => handlePrecioChange("precioMayoristaConIva", parseFloat(e.target.value) || 0, "margenPrecioMayorista")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Margen</Label>
                    <Input
                      value={`${data.datosCompra.margenPrecioMayorista.toFixed(2)}%`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Precio hospitalario (Con IVA)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={data.datosCompra.precioHospitalarioConIva || ""}
                      onChange={(e) => handlePrecioChange("precioHospitalarioConIva", parseFloat(e.target.value) || 0, "margenPrecioHospitalario")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Margen</Label>
                    <Input
                      value={`${data.datosCompra.margenPrecioHospitalario.toFixed(2)}%`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descuentos y bonos */}
            <Card className="bg-amber-50 dark:bg-amber-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Descuentos y bonos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Descuento %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ingrese el descuento"
                    value={data.datosCompra.descuentoPorcentaje || ""}
                    onChange={(e) => handleChange("descuentoPorcentaje", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Descuento de pronto pago %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ingrese el descuento de pronto pago"
                    value={data.datosCompra.descuentoProntoPagoPorcentaje || ""}
                    onChange={(e) => handleChange("descuentoProntoPagoPorcentaje", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Días de pronto pago</Label>
                  <Input
                    type="number"
                    placeholder="Ingrese los días"
                    value={data.datosCompra.diasProntoPago || ""}
                    onChange={(e) => handleChange("diasProntoPago", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Trae bono</Label>
                  <Select
                    value={data.datosCompra.traeBono}
                    onValueChange={(value) => handleChange("traeBono", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label className="text-sm">Valor del bono</Label>
                  <Input
                    placeholder="Ingrese el valor del bono (Push money)"
                    value={data.datosCompra.valorBono}
                    onChange={(e) => handleChange("valorBono", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Se crea código hijo</Label>
                  <Select
                    value={data.datosCompra.seCreaCodHijo}
                    onValueChange={(value) => handleChange("seCreaCodHijo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Bonificaciones */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Bonificaciones
            </CardTitle>
            <Button onClick={addBonificacion} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar bonificación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.datosCompra.bonificaciones.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay bonificaciones agregadas
            </p>
          ) : (
            <div className="space-y-4">
              {data.datosCompra.bonificaciones.map((item, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm">Bonificación {index + 1} - Base</Label>
                    <Input
                      placeholder="Base"
                      value={item.base}
                      onChange={(e) => updateBonificacion(index, "base", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm">Cantidad de bonificación</Label>
                    <Input
                      placeholder="Cantidad de bonificación"
                      value={item.cantidad}
                      onChange={(e) => updateBonificacion(index, "cantidad", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm">Costo de bonificación</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.costo || ""}
                      onChange={(e) => updateBonificacion(index, "costo", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBonificacion(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

