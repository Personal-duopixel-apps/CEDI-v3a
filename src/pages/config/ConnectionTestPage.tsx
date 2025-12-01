import * as React from "react"
import { motion } from "framer-motion"
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  Table,
  Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { databaseConfig } from "@/config/database.config"
import { testConnection, getSpreadsheetInfo, loadAllData } from "@/services/googleSheets.service"

interface ConnectionStatus {
  tested: boolean
  loading: boolean
  success: boolean
  message: string
  sheets?: string[]
  spreadsheetTitle?: string
  spreadsheetUrl?: string
}

interface DataLoadResult {
  [entity: string]: {
    success: boolean
    count: number
    columns: string[]
    sample: Record<string, unknown>[]
  }
}

export function ConnectionTestPage() {
  const [status, setStatus] = React.useState<ConnectionStatus>({
    tested: false,
    loading: false,
    success: false,
    message: "",
  })
  const [dataLoading, setDataLoading] = React.useState(false)
  const [loadedData, setLoadedData] = React.useState<DataLoadResult | null>(null)

  const handleTestConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true }))
    
    try {
      const result = await testConnection()
      
      if (result.success) {
        const info = await getSpreadsheetInfo()
        setStatus({
          tested: true,
          loading: false,
          success: true,
          message: result.message,
          sheets: result.sheets,
          spreadsheetTitle: info.title,
          spreadsheetUrl: info.url,
        })
      } else {
        setStatus({
          tested: true,
          loading: false,
          success: false,
          message: result.message,
        })
      }
    } catch (error) {
      setStatus({
        tested: true,
        loading: false,
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      })
    }
  }

  const handleLoadData = async () => {
    setDataLoading(true)
    try {
      const data = await loadAllData()
      setLoadedData(data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const requiredSheets = Object.values(databaseConfig.googleSheets.sheetNames)
  const existingSheets = status.sheets || []
  const missingSheets = requiredSheets.filter(s => !existingSheets.includes(s))

  const totalRecords = loadedData 
    ? Object.values(loadedData).reduce((sum, d) => sum + d.count, 0) 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Prueba de Conexión</h1>
        <p className="text-muted-foreground">
          Verifica la conexión con Google Sheets
        </p>
      </div>

      {/* Config Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Adaptador</p>
              <div className="font-mono text-sm">
                <Badge variant={databaseConfig.adapter === 'google-sheets' ? 'success' : 'secondary'}>
                  {databaseConfig.adapter}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spreadsheet ID</p>
              <p className="font-mono text-xs break-all">
                {databaseConfig.googleSheets.spreadsheetId}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">API Key</p>
              <p className="font-mono text-xs">
                {databaseConfig.googleSheets.apiKey.substring(0, 20)}...
                <span className="text-muted-foreground"> (oculta por seguridad)</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTestConnection} 
              disabled={status.loading}
            >
              {status.loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Probar Conexión
            </Button>
            
            {status.success && (
              <Button 
                onClick={handleLoadData} 
                disabled={dataLoading}
                variant="outline"
              >
                {dataLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Cargar Datos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Result */}
      {status.tested && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={status.success ? "border-emerald-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {status.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {status.success ? "Conexión Exitosa" : "Error de Conexión"}
              </CardTitle>
              <CardDescription>{status.message}</CardDescription>
            </CardHeader>

            {status.success && (
              <CardContent className="space-y-4">
                {/* Spreadsheet Info */}
                {status.spreadsheetTitle && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                      <div>
                        <p className="font-medium">{status.spreadsheetTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {existingSheets.length} hojas encontradas
                        </p>
                      </div>
                    </div>
                    <a href={status.spreadsheetUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Abrir <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                )}

                {/* Sheets Status */}
                <div>
                  <p className="text-sm font-medium mb-2">Hojas en el Spreadsheet:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingSheets.map(sheet => (
                      <Badge 
                        key={sheet} 
                        variant={requiredSheets.includes(sheet) ? "success" : "secondary"}
                      >
                        {sheet}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Sheets Warning */}
                {missingSheets.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      ⚠️ Hojas faltantes (debes crearlas):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missingSheets.map(sheet => (
                        <Badge key={sheet} variant="warning">
                          {sheet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {missingSheets.length === 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm font-medium text-emerald-800">
                      ✅ Todas las hojas requeridas están presentes
                    </p>
                  </div>
                )}
              </CardContent>
            )}

            {!status.success && (
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Posibles causas:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>La API Key no es válida o no tiene permisos</li>
                    <li>El Spreadsheet ID es incorrecto</li>
                    <li>La hoja no está compartida como "Cualquiera con el enlace"</li>
                    <li>La API de Google Sheets no está habilitada en tu proyecto</li>
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}

      {/* Loaded Data */}
      {loadedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5" />
                Datos Cargados
              </CardTitle>
              <CardDescription>
                Se cargaron {totalRecords} registros en total de {Object.keys(loadedData).length} entidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(loadedData).map(([entity, data]) => (
                  <div key={entity} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entity}</span>
                        <Badge variant={data.success ? "success" : "destructive"}>
                          {data.count} registros
                        </Badge>
                      </div>
                      {data.columns.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {data.columns.length} columnas
                        </span>
                      )}
                    </div>
                    
                    {data.success && data.count > 0 && (
                      <div className="p-3">
                        {/* Columnas */}
                        <p className="text-xs text-muted-foreground mb-2">
                          Columnas: {data.columns.join(", ")}
                        </p>
                        
                        {/* Muestra de datos */}
                        {data.sample.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="text-xs w-full">
                              <thead>
                                <tr className="border-b">
                                  {data.columns.slice(0, 5).map(col => (
                                    <th key={col} className="text-left p-2 font-medium">
                                      {col}
                                    </th>
                                  ))}
                                  {data.columns.length > 5 && (
                                    <th className="text-left p-2 text-muted-foreground">
                                      +{data.columns.length - 5} más
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {data.sample.map((row, idx) => (
                                  <tr key={idx} className="border-b last:border-0">
                                    {data.columns.slice(0, 5).map(col => (
                                      <td key={col} className="p-2 truncate max-w-[150px]">
                                        {String(row[col] ?? '')}
                                      </td>
                                    ))}
                                    {data.columns.length > 5 && (
                                      <td className="p-2 text-muted-foreground">...</td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {data.success && data.count === 0 && (
                      <div className="p-3 text-sm text-muted-foreground">
                        Sin datos (hoja vacía o solo encabezados)
                      </div>
                    )}
                    
                    {!data.success && (
                      <div className="p-3 text-sm text-red-600">
                        Error al cargar datos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-2">1. Crear hojas en tu Spreadsheet:</p>
            <p className="text-muted-foreground">
              Crea una pestaña para cada entidad: {requiredSheets.join(", ")}
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">2. Agregar encabezados:</p>
            <p className="text-muted-foreground">
              En la fila 1 de cada hoja, pon los nombres de las columnas 
              (id, name, created_at, etc.)
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">3. Compartir la hoja:</p>
            <p className="text-muted-foreground">
              Click en "Compartir" → "Cualquiera con el enlace" → "Lector"
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
