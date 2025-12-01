import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useToast } from "@/store/ui.store"
import { db } from "@/services/database.service"

import { WizardProvider, useWizard } from "./WizardContext"
import { WIZARD_STEPS } from "./types"
import { Step1Solicitante } from "./steps/Step1Solicitante"
import { Step2DatosGenerales } from "./steps/Step2DatosGenerales"
import { Step3IngredientesActivos } from "./steps/Step3IngredientesActivos"
import { Step4InformacionAdicional } from "./steps/Step4InformacionAdicional"
import { Step5DatosCompra } from "./steps/Step5DatosCompra"
import { Step6DatosLogisticos } from "./steps/Step6DatosLogisticos"
import { Step7RequerimientosDigitales } from "./steps/Step7RequerimientosDigitales"

function WizardContent() {
  const navigate = useNavigate()
  const toast = useToast()
  const {
    data,
    currentStep,
    setCurrentStep,
    completedSteps,
    markStepComplete,
    isStepComplete,
  } = useWizard()

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const progress = ((currentStep) / WIZARD_STEPS.length) * 100

  const handleNext = () => {
    markStepComplete(currentStep)
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    // Solo permitir navegar a pasos completados o al siguiente
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      // Transformar datos del wizard al formato de Google Sheets
      const productData = {
        // Información del solicitante
        "ID Solicitante": data.solicitante.nombreSolicitante,
        "ID Laboratorio": data.solicitante.nombreLaboratorio,
        
        // Datos generales
        "Nombre": data.datosGenerales.nombreProducto,
        "Nombre Generado": data.nombreGenerado || generateFullName(),
        "Características": data.datosGenerales.caracteristicas,
        "ID Forma Farmacéutica": data.datosGenerales.formaFarmaceuticaId,
        "Cantidad": data.datosGenerales.cantidad,
        "ID Medida Peso/Tamaño": data.datosGenerales.pesoTamanoMedidaId,
        "ID Tipo Empaque": data.datosGenerales.empaqueId,
        "Talla/Capacidad": data.datosGenerales.tallaCapacidad,
        "Calibre/Grosor/Diámetro": data.datosGenerales.calibreGrosorDiametro,
        "Descripción Oferta Especial": data.datosGenerales.ofertaPromoDescripcion,
        
        // Información adicional
        "Vencimiento Registro Sanitario": data.informacionAdicional.vencimientoRegistroSanitario,
        "Número Registro Sanitario": data.informacionAdicional.numeroRegistroSanitario,
        "Código de Barras": data.informacionAdicional.codigoBarras,
        "Es Controlado": data.informacionAdicional.productoControlado === "Sí",
        "Es Refrigerado": data.informacionAdicional.productoRefrigerado === "Sí",
        "Uso Hospitalario": data.informacionAdicional.productoUsoHospitalario === "Sí",
        "Requiere Receta Retenida": data.informacionAdicional.requiereReceta === "Sí",
        "Uso Crónico": data.informacionAdicional.usoCronico === "Sí",
        "Para Farmacias Propias": data.informacionAdicional.farmaciasPropias,
        "Para Farmacias Independientes": data.informacionAdicional.farmaciasIndependientes,
        "Para Uso Institucional/Hospitalario": data.informacionAdicional.institucionalHospitalario,
        "Es Ruteado": data.informacionAdicional.ruteo,
        "Para Venta al por Mayor": data.informacionAdicional.mayoreo,
        "Para Autoservicio": data.informacionAdicional.autoservicio,
        "ID Clasificación": data.informacionAdicional.clasificacionId,
        "ID Tipo de Impuesto": data.informacionAdicional.tipoImpuestoId,
        
        // Datos de compra
        "Precio Compra Con IVA": data.datosCompra.precioCompraConIva,
        "Precio Compra Sin IVA": data.datosCompra.precioCompraSinIva,
        "ID Tipo Moneda": data.datosCompra.tipoMonedaId,
        "Precio Lista Con IVA": data.datosCompra.precioListaConIva,
        "Precio Público Con IVA": data.datosCompra.precioPublicoConIva,
        
        // Datos logísticos
        "Largo Artículo": data.datosLogisticos.largoArticulo,
        "Ancho Artículo": data.datosLogisticos.anchoArticulo,
        "Alto Artículo": data.datosLogisticos.altoArticulo,
        "Peso Artículo": data.datosLogisticos.pesoArticulo,
        "Unidades Por Fardo": data.datosLogisticos.unidadesPorFardo,
        "Temperatura Mínima": data.datosLogisticos.temperaturaMinima,
        "Temperatura Máxima": data.datosLogisticos.temperaturaMaxima,
        
        // Estado
        "Es Borrador": false,
        "Activo": true,
      }

      await db.create("products", productData as unknown as Record<string, unknown>)

      toast.success("¡Producto creado!", "El producto ha sido registrado exitosamente")
      navigate("/catalogo/productos")
    } catch (error) {
      console.error("Error creando producto:", error)
      toast.error("Error", "No se pudo crear el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateFullName = () => {
    const parts = [
      data.datosGenerales.nombreProducto,
      data.datosGenerales.cantidad ? `${data.datosGenerales.cantidad}` : "",
    ].filter(Boolean)
    return parts.join(" ").toUpperCase()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Solicitante />
      case 2:
        return <Step2DatosGenerales />
      case 3:
        return <Step3IngredientesActivos />
      case 4:
        return <Step4InformacionAdicional />
      case 5:
        return <Step5DatosCompra />
      case 6:
        return <Step6DatosLogisticos />
      case 7:
        return <Step7RequerimientosDigitales />
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] -m-6 p-6">
      {/* Fondo que se extiende más allá del contenedor */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Contenido centrado */}
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header con nombre generado */}
        {data.nombreGenerado && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
          >
            <div className="p-2 rounded-lg bg-emerald-500 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                PRODUCTO GENERADO
              </p>
              <p className="font-bold text-emerald-900 dark:text-emerald-100">
                {data.nombreGenerado}
              </p>
            </div>
          </motion.div>
        )}

        {/* Progress Card */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Wizard de Creación de Productos</h1>
              <span className="text-sm text-muted-foreground">
                {currentStep} de {WIZARD_STEPS.length} pasos
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              {/* Step Indicators */}
              <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : isStepComplete(step.id)
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    disabled={step.id > currentStep && !isStepComplete(step.id - 1)}
                  >
                    {isStepComplete(step.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </button>
                ))}
              </div>

              {/* Next/Finish Button */}
              {currentStep < WIZARD_STEPS.length ? (
                <Button onClick={handleNext} className="gap-2">
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Finalizar
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function NewProductWizardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}

