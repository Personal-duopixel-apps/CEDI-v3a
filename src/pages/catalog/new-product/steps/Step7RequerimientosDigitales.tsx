import * as React from "react"
import { Upload, FileText, X, File, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useWizard } from "../WizardContext"
import type { DocumentoItem } from "../types"

const REQUIRED_DOCUMENTS = [
  { id: "registro_sanitario", nombre: "Registro sanitario", tipo: ".pdf", requerido: true },
  { id: "proyeccion_ventas", nombre: "Proyección de ventas 6 meses", tipo: ".excel", requerido: true },
  { id: "ubicacion_farmacia", nombre: "Ubicación sugerida por farmacia", tipo: ".excel", requerido: true },
  { id: "comparacion_precios", nombre: "Comparación de precios vs. competencia", tipo: ".excel", requerido: true },
  { id: "ficha_tecnica", nombre: "Ficha técnica", tipo: ".pdf", requerido: true },
  { id: "imagen_producto", nombre: "Imagen del producto", tipo: ".jpg, 800x800, 150 dpi", requerido: true },
]

const PHYSICAL_REQUIREMENTS = [
  "Entregar producto original en oficinas",
]

const ACCEPTED_FORMATS = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function Step7RequerimientosDigitales() {
  const { data, updateData } = useWizard()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newDocuments: DocumentoItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      nombre: file.name,
      tipo: file.type,
      archivo: file,
    }))

    updateData("requerimientosDigitales", {
      documentos: [...data.requerimientosDigitales.documentos, ...newDocuments],
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeDocument = (id: string) => {
    updateData("requerimientosDigitales", {
      documentos: data.requerimientosDigitales.documentos.filter((doc) => doc.id !== id),
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("pdf")) return "📄"
    if (tipo.includes("image")) return "🖼️"
    if (tipo.includes("sheet") || tipo.includes("excel")) return "📊"
    if (tipo.includes("word") || tipo.includes("document")) return "📝"
    return "📁"
  }

  const hasRegistroSanitario = data.requerimientosDigitales.documentos.some(
    (doc) => doc.nombre.toLowerCase().includes("registro") || doc.nombre.toLowerCase().includes("sanitario")
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Requerimientos digitales</h2>
        <div className="w-16 h-1 bg-red-500 mx-auto mt-2 rounded-full" />
      </div>

      {/* Documentos requeridos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Documentos requeridos</h3>
        <p className="text-center text-muted-foreground">
          Para completar el registro del producto, debe proporcionar los siguientes documentos
        </p>
        
        {!hasRegistroSanitario && (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">* Debe cargar al menos el registro sanitario</span>
          </div>
        )}

        {/* Lista de requisitos digitales */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Requisitos digitales obligatorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {REQUIRED_DOCUMENTS.map((doc, index) => (
                <div key={doc.id} className="text-sm text-muted-foreground">
                  {index + 1}. {doc.nombre} ({doc.tipo})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requisitos físicos */}
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requisitos físicos obligatorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {PHYSICAL_REQUIREMENTS.map((req, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {index + 1}. {req}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Zona de carga */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">
                Arrastra y suelta tus archivos aquí o{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  haz clic para seleccionar
                </button>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Formatos soportados: PDF, DOC, DOCX, JPG, PNG, EXCEL
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 6 archivos – Tamaño máximo por archivo: 10MB
              </p>
            </div>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              Seleccionar archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FORMATS}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos cargados */}
      <Card>
        <CardContent className="p-6">
          {data.requerimientosDigitales.documentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <File className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No se encontraron documentos para este producto</p>
              <p className="text-sm text-muted-foreground">
                Los documentos aparecerán aquí una vez que sean subidos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  Documentos cargados ({data.requerimientosDigitales.documentos.length})
                </h4>
                {hasRegistroSanitario && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Registro sanitario cargado</span>
                  </div>
                )}
              </div>
              {data.requerimientosDigitales.documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(doc.tipo)}</span>
                    <div>
                      <p className="font-medium text-sm">{doc.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.archivo && formatFileSize(doc.archivo.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
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

