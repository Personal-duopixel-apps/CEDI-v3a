
import { Package, FileText, Pill, Hash, Scale, Box, Ruler, Tag } from "lucide-react"
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
import { useWizard } from "../WizardContext"

export function Step2DatosGenerales() {
  const { data, updateData, generateProductName, catalogs, catalogsLoading } = useWizard()

  // Usar los catálogos del contexto
  const formasFarmaceuticas = catalogs.pharmaceutical_forms
  const unidadesMedida = catalogs.measurement_units
  const tiposEmpaque = catalogs.package_types
  const isLoading = catalogsLoading

  const handleChange = (field: string, value: string | number) => {
    updateData("datosGenerales", { [field]: value })
    // Regenerar nombre cuando cambian campos relevantes
    if (["nombreProducto", "cantidad"].includes(field)) {
      setTimeout(generateProductName, 100)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Datos generales</h2>
        <div className="w-16 h-1 bg-emerald-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Form */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Nombre del producto */}
        <div className="space-y-2">
          <Label htmlFor="nombreProducto" className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Nombre del producto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombreProducto"
            placeholder="Ingrese el nombre del producto"
            value={data.datosGenerales.nombreProducto}
            onChange={(e) => handleChange("nombreProducto", e.target.value)}
          />
        </div>

        {/* Características */}
        <div className="space-y-2">
          <Label htmlFor="caracteristicas" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Características
          </Label>
          <Textarea
            id="caracteristicas"
            placeholder="Describe las características"
            value={data.datosGenerales.caracteristicas}
            onChange={(e) => handleChange("caracteristicas", e.target.value)}
            rows={3}
          />
        </div>

        {/* Forma farmacéutica */}
        <div className="space-y-2">
          <Label htmlFor="formaFarmaceuticaId" className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            Forma farmacéutica <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.datosGenerales.formaFarmaceuticaId}
            onValueChange={(value) => handleChange("formaFarmaceuticaId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione la forma farmacéutica"} />
            </SelectTrigger>
            <SelectContent>
              {formasFarmaceuticas.filter(i => i.id && i.name).map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cantidad */}
        <div className="space-y-2">
          <Label htmlFor="cantidad" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Cantidad <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cantidad"
            type="number"
            placeholder="Ingrese la cantidad"
            value={data.datosGenerales.cantidad || ""}
            onChange={(e) => handleChange("cantidad", parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Peso | Tamaño | Medida */}
        <div className="space-y-2">
          <Label htmlFor="pesoTamanoMedidaId" className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            Peso | Tamaño | Medida
          </Label>
          <Select
            value={data.datosGenerales.pesoTamanoMedidaId}
            onValueChange={(value) => handleChange("pesoTamanoMedidaId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione peso/tamaño/medida"} />
            </SelectTrigger>
            <SelectContent>
              {unidadesMedida.filter(i => i.id && i.name).map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Empaque */}
        <div className="space-y-2">
          <Label htmlFor="empaqueId" className="flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            Empaque <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.datosGenerales.empaqueId}
            onValueChange={(value) => handleChange("empaqueId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione el empaque"} />
            </SelectTrigger>
            <SelectContent>
              {tiposEmpaque.filter(i => i.id && i.name).map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Talla | Capacidad */}
        <div className="space-y-2">
          <Label htmlFor="tallaCapacidad" className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            Talla | Capacidad
          </Label>
          <Input
            id="tallaCapacidad"
            placeholder="Especifique talla o capacidad"
            value={data.datosGenerales.tallaCapacidad}
            onChange={(e) => handleChange("tallaCapacidad", e.target.value)}
          />
        </div>

        {/* Calibre/Grosor/Diámetro */}
        <div className="space-y-2">
          <Label htmlFor="calibreGrosorDiametro" className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            Calibre/Grosor/Diámetro
          </Label>
          <Input
            id="calibreGrosorDiametro"
            placeholder="Aplica para agujas"
            value={data.datosGenerales.calibreGrosorDiametro}
            onChange={(e) => handleChange("calibreGrosorDiametro", e.target.value)}
          />
        </div>

        {/* Oferta/Promo/Atado/Obsequio/Corto vence/Precio especial */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ofertaPromoDescripcion" className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Oferta/Promo/Atado/Obsequio/Corto vence/Precio especial
          </Label>
          <Textarea
            id="ofertaPromoDescripcion"
            placeholder="Describa la oferta/promo/atado/obsequio/corto vence/precio especial"
            value={data.datosGenerales.ofertaPromoDescripcion}
            onChange={(e) => handleChange("ofertaPromoDescripcion", e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

