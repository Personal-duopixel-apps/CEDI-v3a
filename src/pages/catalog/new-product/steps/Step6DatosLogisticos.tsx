
import { Ruler, Box, Thermometer, Layers, Info } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWizard } from "../WizardContext"

const SI_NO_OPTIONS = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
]

export function Step6DatosLogisticos() {
  const { data, updateData } = useWizard()

  const handleChange = (field: string, value: string | number) => {
    updateData("datosLogisticos", { [field]: value })

    // Recalcular volúmenes automáticamente
    if (["largoArticulo", "anchoArticulo", "altoArticulo"].includes(field)) {
      const largo = field === "largoArticulo" ? (value as number) : data.datosLogisticos.largoArticulo
      const ancho = field === "anchoArticulo" ? (value as number) : data.datosLogisticos.anchoArticulo
      const alto = field === "altoArticulo" ? (value as number) : data.datosLogisticos.altoArticulo
      updateData("datosLogisticos", { volumenArticulo: largo * ancho * alto })
    }

    if (["largoFardo", "anchoFardo", "altoFardo"].includes(field)) {
      const largo = field === "largoFardo" ? (value as number) : data.datosLogisticos.largoFardo
      const ancho = field === "anchoFardo" ? (value as number) : data.datosLogisticos.anchoFardo
      const alto = field === "altoFardo" ? (value as number) : data.datosLogisticos.altoFardo
      updateData("datosLogisticos", { volumenFardo: largo * ancho * alto })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Datos logísticos</h2>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Dimensiones */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dimensiones del artículo */}
        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dimensiones del artículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Largo (artículo) en cm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.largoArticulo || ""}
                onChange={(e) => handleChange("largoArticulo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Ancho (artículo) en cm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.anchoArticulo || ""}
                onChange={(e) => handleChange("anchoArticulo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Alto (artículo) en cm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.altoArticulo || ""}
                onChange={(e) => handleChange("altoArticulo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Volumen (artículo) en cm³</Label>
              <Input
                type="number"
                value={data.datosLogisticos.volumenArticulo.toFixed(2)}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Peso (artículo) en libras <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.pesoArticulo || ""}
                onChange={(e) => handleChange("pesoArticulo", parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dimensiones del fardo */}
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Box className="h-4 w-4" />
              Dimensiones del fardo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Largo (fardo) en cm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.largoFardo || ""}
                onChange={(e) => handleChange("largoFardo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Ancho (fardo) en cm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.anchoFardo || ""}
                onChange={(e) => handleChange("anchoFardo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Alto (fardo) en cm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.altoFardo || ""}
                onChange={(e) => handleChange("altoFardo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Peso (fardo) en libras <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={data.datosLogisticos.pesoFardo || ""}
                onChange={(e) => handleChange("pesoFardo", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Volumen (fardo) en cm³</Label>
              <Input
                type="number"
                value={data.datosLogisticos.volumenFardo.toFixed(2)}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Unidades por fardo (original) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={data.datosLogisticos.unidadesPorFardo || ""}
                onChange={(e) => handleChange("unidadesPorFardo", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Código de barras (fardo original)</Label>
              <Input
                placeholder="Código de barras del fardo"
                value={data.datosLogisticos.codigoBarrasFardo}
                onChange={(e) => handleChange("codigoBarrasFardo", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Datos de paletizado */}
        <Card className="bg-amber-50 dark:bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Datos de paletizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Fardos por cama <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={data.datosLogisticos.fardosPorCama || ""}
                onChange={(e) => handleChange("fardosPorCama", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Camas por Pallet <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={data.datosLogisticos.camasPorPallet || ""}
                onChange={(e) => handleChange("camasPorPallet", parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condiciones de almacenamiento */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Condiciones de almacenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Temperatura Mín. (°C)</Label>
              <Input
                type="number"
                placeholder="15"
                value={data.datosLogisticos.temperaturaMinima || ""}
                onChange={(e) => handleChange("temperaturaMinima", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Temperatura Máx. (°C)</Label>
              <Input
                type="number"
                placeholder="25"
                value={data.datosLogisticos.temperaturaMaxima || ""}
                onChange={(e) => handleChange("temperaturaMaxima", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Manejo por lotes</Label>
              <Select
                value={data.datosLogisticos.manejoPorLotes}
                onValueChange={(value) => handleChange("manejoPorLotes", value)}
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
          </div>

          <div className="mt-6 flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50">
                  <Info className="h-4 w-4" />
                  Ver ejemplos de medidas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ejemplos de medidas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tableta/Cápsula pequeña</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Largo: 2 cm</p>
                        <p>Ancho: 1 cm</p>
                        <p>Alto: 0.5 cm</p>
                        <p>Peso: 0.01 lb</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Frasco 120ml</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Largo: 5 cm</p>
                        <p>Ancho: 5 cm</p>
                        <p>Alto: 12 cm</p>
                        <p>Peso: 0.3 lb</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Caja de medicamento</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Largo: 10 cm</p>
                        <p>Ancho: 5 cm</p>
                        <p>Alto: 3 cm</p>
                        <p>Peso: 0.1 lb</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Fardo estándar</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Largo: 40 cm</p>
                        <p>Ancho: 30 cm</p>
                        <p>Alto: 25 cm</p>
                        <p>Peso: 10 lb</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

