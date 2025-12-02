import * as React from "react"
import { ProductWizardData, initialProductData } from "./types"
import { db } from "@/services/database.service"

// Interfaz para los items de catálogo
interface CatalogItem {
  id: string
  name: string
  code?: string
  [key: string]: unknown
}

// Interfaz para el caché de catálogos
interface CatalogsCache {
  buyers: CatalogItem[]
  laboratories: CatalogItem[]
  suppliers: CatalogItem[]
  pharmaceutical_forms: CatalogItem[]
  measurement_units: CatalogItem[]
  package_types: CatalogItem[]
  active_ingredients: CatalogItem[]
  classifications: CatalogItem[]
  taxes: CatalogItem[]
  product_levels: CatalogItem[]
  currencies: CatalogItem[]
}

interface WizardContextType {
  data: ProductWizardData
  updateData: <K extends keyof ProductWizardData>(
    section: K,
    values: Partial<ProductWizardData[K]>
  ) => void
  setData: React.Dispatch<React.SetStateAction<ProductWizardData>>
  currentStep: number
  setCurrentStep: (step: number) => void
  completedSteps: number[]
  markStepComplete: (step: number) => void
  isStepComplete: (step: number) => boolean
  generateProductName: () => string
  // Caché de catálogos
  catalogs: CatalogsCache
  catalogsLoading: boolean
}

const WizardContext = React.createContext<WizardContextType | null>(null)

// Caché inicial vacío
const initialCatalogs: CatalogsCache = {
  buyers: [],
  laboratories: [],
  suppliers: [],
  pharmaceutical_forms: [],
  measurement_units: [],
  package_types: [],
  active_ingredients: [],
  classifications: [],
  taxes: [],
  product_levels: [],
  currencies: [],
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<ProductWizardData>(initialProductData)
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const [catalogs, setCatalogs] = React.useState<CatalogsCache>(initialCatalogs)
  const [catalogsLoading, setCatalogsLoading] = React.useState(true)

  // Cargar todos los catálogos una sola vez al montar el wizard
  React.useEffect(() => {
    async function loadAllCatalogs() {
      try {
        console.log("📦 Cargando todos los catálogos del wizard...")
        const [
          buyers,
          laboratories,
          suppliers,
          pharmaceutical_forms,
          measurement_units,
          package_types,
          active_ingredients,
          classifications,
          taxes,
          product_levels,
          currencies,
        ] = await Promise.all([
          db.getAll("buyers"),
          db.getAll("laboratories"),
          db.getAll("suppliers"),
          db.getAll("pharmaceutical_forms"),
          db.getAll("measurement_units"),
          db.getAll("package_types"),
          db.getAll("active_ingredients"),
          db.getAll("classifications"),
          db.getAll("taxes"),
          db.getAll("product_levels"),
          db.getAll("currencies"),
        ])

        setCatalogs({
          buyers: buyers as CatalogItem[],
          laboratories: laboratories as CatalogItem[],
          suppliers: suppliers as CatalogItem[],
          pharmaceutical_forms: pharmaceutical_forms as CatalogItem[],
          measurement_units: measurement_units as CatalogItem[],
          package_types: package_types as CatalogItem[],
          active_ingredients: active_ingredients as CatalogItem[],
          classifications: classifications as CatalogItem[],
          taxes: taxes as CatalogItem[],
          product_levels: product_levels as CatalogItem[],
          currencies: currencies as CatalogItem[],
        })

        console.log("✅ Catálogos del wizard cargados:", {
          buyers: buyers.length,
          laboratories: laboratories.length,
          suppliers: suppliers.length,
          pharmaceutical_forms: pharmaceutical_forms.length,
          measurement_units: measurement_units.length,
          package_types: package_types.length,
          active_ingredients: active_ingredients.length,
          classifications: classifications.length,
          taxes: taxes.length,
          product_levels: product_levels.length,
          currencies: currencies.length,
        })
      } catch (error) {
        console.error("❌ Error cargando catálogos del wizard:", error)
      } finally {
        setCatalogsLoading(false)
      }
    }
    loadAllCatalogs()
  }, [])

  const updateData = React.useCallback(<K extends keyof ProductWizardData>(
    section: K,
    values: Partial<ProductWizardData[K]>
  ) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }))
  }, [])

  const markStepComplete = React.useCallback((step: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(step)) return prev
      return [...prev, step]
    })
  }, [])

  const isStepComplete = React.useCallback((step: number) => {
    return completedSteps.includes(step)
  }, [completedSteps])

  // Generar nombre del producto basado en los datos
  const generateProductName = React.useCallback(() => {
    const { datosGenerales } = data
    const parts: string[] = []

    if (datosGenerales.nombreProducto) {
      parts.push(datosGenerales.nombreProducto)
    }
    if (datosGenerales.cantidad) {
      parts.push(String(datosGenerales.cantidad))
    }
    // Aquí se podría agregar la forma farmacéutica y empaque cuando estén disponibles

    const nombre = parts.join(" ").toUpperCase()
    setData(prev => ({ ...prev, nombreGenerado: nombre }))
    return nombre
  }, [data])

  return (
    <WizardContext.Provider
      value={{
        data,
        updateData,
        setData,
        currentStep,
        setCurrentStep,
        completedSteps,
        markStepComplete,
        isStepComplete,
        generateProductName,
        catalogs,
        catalogsLoading,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = React.useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider")
  }
  return context
}

