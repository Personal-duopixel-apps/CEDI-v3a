import * as React from "react"
import { Plus, Trash2, FlaskConical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/services/database.service"
import { useWizard } from "../WizardContext"
import type { PrincipioActivoItem } from "../types"

interface CatalogItem {
  id: string
  Nombre: string
}

export function Step3IngredientesActivos() {
  const { data, updateData } = useWizard()
  const [principiosActivos, setPrincipiosActivos] = React.useState<CatalogItem[]>([])
  const [unidadesMedida, setUnidadesMedida] = React.useState<CatalogItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadCatalogs() {
      try {
        const [principios, unidades] = await Promise.all([
          db.getAll("active_ingredients"),
          db.getAll("measurement_units"),
        ])
        setPrincipiosActivos(principios as CatalogItem[])
        setUnidadesMedida(unidades as CatalogItem[])
      } catch (error) {
        console.error("Error cargando catálogos:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCatalogs()
  }, [])

  const addPrincipioActivo = () => {
    const newItem: PrincipioActivoItem = {
      principioActivoId: "",
      concentracion: "",
      unidadMedidaId: "",
      ml: "",
    }
    updateData("ingredientesActivos", {
      principiosActivos: [...data.ingredientesActivos.principiosActivos, newItem],
    })
  }

  const removePrincipioActivo = (index: number) => {
    const updated = data.ingredientesActivos.principiosActivos.filter((_, i) => i !== index)
    updateData("ingredientesActivos", { principiosActivos: updated })
  }

  const removeAll = () => {
    updateData("ingredientesActivos", { principiosActivos: [] })
  }

  const updatePrincipioActivo = (index: number, field: keyof PrincipioActivoItem, value: string) => {
    const updated = data.ingredientesActivos.principiosActivos.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    updateData("ingredientesActivos", { principiosActivos: updated })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Ingredientes activos</h2>
        <div className="w-16 h-1 bg-orange-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Subheader */}
      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Principios activos</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Este paso es <span className="text-orange-600 font-medium">opcional</span>. Puede agregar principios activos o continuar sin ellos.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Principios activos agregados</h4>
        <div className="flex items-center gap-2">
          {data.ingredientesActivos.principiosActivos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Eliminar todos
            </Button>
          )}
          <Button onClick={addPrincipioActivo} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar otro
          </Button>
        </div>
      </div>

      {/* List */}
      {data.ingredientesActivos.principiosActivos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay principios activos agregados
            </p>
            <Button onClick={addPrincipioActivo} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar principio activo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.ingredientesActivos.principiosActivos.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-medium">Principio activo {index + 1}</h5>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrincipioActivo(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Principio activo */}
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Principio activo: <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={item.principioActivoId}
                      onValueChange={(value) => updatePrincipioActivo(index, "principioActivoId", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {principiosActivos.map((pa) => (
                          <SelectItem key={pa.id} value={pa.Nombre}>
                            {pa.Nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Concentración */}
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Concentración: <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Ej: 500"
                      value={item.concentracion}
                      onChange={(e) => updatePrincipioActivo(index, "concentracion", e.target.value)}
                    />
                  </div>

                  {/* Unidad de medida */}
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Unidad de medida: <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={item.unidadMedidaId}
                      onValueChange={(value) => updatePrincipioActivo(index, "unidadMedidaId", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesMedida.map((um) => (
                          <SelectItem key={um.id} value={um.Nombre}>
                            {um.Nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* mL */}
                  <div className="space-y-2">
                    <Label className="text-sm">mL:</Label>
                    <Input
                      placeholder="Ej: 100"
                      value={item.ml}
                      onChange={(e) => updatePrincipioActivo(index, "ml", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

