import * as React from "react"
import { ProductWizardData, initialProductData } from "./types"

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
}

const WizardContext = React.createContext<WizardContextType | null>(null)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<ProductWizardData>(initialProductData)
  const [currentStep, setCurrentStep] = React.useState(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])

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

