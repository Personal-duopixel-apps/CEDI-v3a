import * as React from "react"
import { z } from "zod"
import { format, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DataTable, type DataTableColumn } from "@/components/crud/DataTable"
import { 
  Clock, 
  Settings, 
  Plus, 
  Pencil, 
  Trash2, 
  Building2, 
  DoorOpen, 
  CalendarDays,
  CalendarOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useSettingsStore } from "@/store/settings.store"
import { db } from "@/services/database.service"
import { useToast } from "@/store/ui.store"
import { cn } from "@/lib/utils"
import type { BaseEntity } from "@/types"

// ==================== INTERFACES ====================

interface Horario extends BaseEntity {
  name: string
  distribution_center_id?: string
  dock_ids?: string  // IDs de puertas separados por coma
  days?: string  // Días que aplica: "lunes,martes,miércoles,jueves,viernes"
  start_time?: string
  end_time?: string
  is_active?: boolean | string
  inactive_message?: string  // Mensaje cuando está deshabilitado
  notes?: string
}

interface Excepcion extends BaseEntity {
  name: string
  horario_id?: string  // Relación con el horario
  distribution_center_id?: string
  dock_ids?: string  // Puertas afectadas
  date?: string  // Fecha específica
  exception_type?: string  // "cerrado" | "horario_especial"
  start_time?: string  // Si es horario especial
  end_time?: string
  message?: string  // Mensaje personalizado
  is_recurring?: boolean | string  // Si se repite cada año
}

interface Centro extends BaseEntity {
  name: string
  city?: string
}

interface Puerta extends BaseEntity {
  name: string
  distribution_center_id?: string
  type?: string
}

// ==================== CONSTANTES ====================

const DAYS_OF_WEEK = [
  { value: "lunes", label: "Lunes", short: "L" },
  { value: "martes", label: "Martes", short: "M" },
  { value: "miércoles", label: "Miércoles", short: "X" },
  { value: "jueves", label: "Jueves", short: "J" },
  { value: "viernes", label: "Viernes", short: "V" },
  { value: "sábado", label: "Sábado", short: "S" },
  { value: "domingo", label: "Domingo", short: "D" },
]

const EXCEPTION_TYPES = [
  { value: "cerrado", label: "Cerrado (No disponible)" },
  { value: "horario_especial", label: "Horario Especial" },
]

// Generar opciones de hora con AM/PM
const generateTimeOptions = () => {
  const options = []
  for (let hour = 5; hour <= 22; hour++) {
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hourStr = hour.toString()
    const displayHour = hour12.toString()
    
    options.push({ value: `${hourStr}:00`, label: `${displayHour}:00 ${ampm}` })
    options.push({ value: `${hourStr}:30`, label: `${displayHour}:30 ${ampm}` })
  }
  return options
}

const timeOptions = generateTimeOptions()

const formatTimeWithAmPm = (time: string | undefined): string => {
  if (!time) return '-'
  const [hourStr, minutes] = time.split(':')
  const hour = parseInt(hourStr, 10)
  if (isNaN(hour)) return time
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes || '00'} ${ampm}`
}

// ==================== COMPONENTE PRINCIPAL ====================

export function HorariosPage() {
  const { timeInterval, setTimeInterval } = useSettingsStore()
  const toast = useToast()
  
  // Estado general
  const [activeTab, setActiveTab] = React.useState("horarios")
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Datos
  const [horarios, setHorarios] = React.useState<Horario[]>([])
  const [excepciones, setExcepciones] = React.useState<Excepcion[]>([])
  const [centros, setCentros] = React.useState<Centro[]>([])
  const [puertas, setPuertas] = React.useState<Puerta[]>([])
  
  // Diálogos
  const [isHorarioDialogOpen, setIsHorarioDialogOpen] = React.useState(false)
  const [isExcepcionDialogOpen, setIsExcepcionDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [editingHorario, setEditingHorario] = React.useState<Horario | null>(null)
  const [editingExcepcion, setEditingExcepcion] = React.useState<Excepcion | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  const [deleteType, setDeleteType] = React.useState<"horario" | "excepcion">("horario")
  
  // Formulario de Horario
  const [horarioForm, setHorarioForm] = React.useState({
    name: "",
    distribution_center_id: "",
    dock_ids: [] as string[],
    days: [] as string[],
    start_time: "",
    end_time: "",
    is_active: true,
    inactive_message: "Cerrado",
    notes: "",
  })
  
  // Formulario de Excepción
  const [excepcionForm, setExcepcionForm] = React.useState({
    name: "",
    horario_id: "",
    distribution_center_id: "",
    dock_ids: [] as string[],
    date: undefined as Date | undefined,
    exception_type: "cerrado",
    start_time: "",
    end_time: "",
    message: "",
    is_recurring: false,
  })
  
  // Puertas filtradas por centro seleccionado
  const filteredPuertasHorario = React.useMemo(() => {
    if (!horarioForm.distribution_center_id) return []
    return puertas.filter(p => 
      p.distribution_center_id === horarioForm.distribution_center_id ||
      p.distribution_center_id === centros.find(c => c.id === horarioForm.distribution_center_id)?.name
    )
  }, [horarioForm.distribution_center_id, puertas, centros])
  
  const filteredPuertasExcepcion = React.useMemo(() => {
    if (!excepcionForm.distribution_center_id) return []
    return puertas.filter(p => 
      p.distribution_center_id === excepcionForm.distribution_center_id ||
      p.distribution_center_id === centros.find(c => c.id === excepcionForm.distribution_center_id)?.name
    )
  }, [excepcionForm.distribution_center_id, puertas, centros])
  
  // Cargar datos
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [horariosData, excepcionesData, centrosData, puertasData] = await Promise.all([
          db.getAll("horarios"),
          db.getAll("dias_festivos"), // Usamos la misma hoja para excepciones
          db.getAll("centros_distribucion"),
          db.getAll("docks"),
        ])
        setHorarios(horariosData as Horario[])
        setExcepciones(excepcionesData as Excepcion[])
        setCentros(centrosData as Centro[])
        setPuertas(puertasData as Puerta[])
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast.error("Error", "No se pudieron cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])
  
  // Helpers
  const getCentroName = (centroId: string | undefined) => {
    if (!centroId) return '-'
    const centro = centros.find(c => c.id === centroId || c.name === centroId)
    return centro?.name || centroId
  }
  
  const getPuertasNames = (dockIds: string | undefined) => {
    if (!dockIds) return '-'
    const ids = dockIds.split(',').map(id => id.trim())
    const names = ids.map(id => {
      const puerta = puertas.find(p => p.id === id || p.name === id)
      return puerta?.name || id
    })
    return names.join(', ')
  }
  
  const getDaysDisplay = (days: string | undefined) => {
    if (!days) return '-'
    const daysList = days.split(',').map(d => d.trim().toLowerCase())
    
    // Verificar patrones comunes
    const weekdays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
    const weekend = ['sábado', 'domingo']
    const allDays = [...weekdays, ...weekend]
    
    if (weekdays.every(d => daysList.includes(d)) && !weekend.some(d => daysList.includes(d))) {
      return 'Lunes a Viernes'
    }
    if (weekend.every(d => daysList.includes(d)) && !weekdays.some(d => daysList.includes(d))) {
      return 'Fin de Semana'
    }
    if (allDays.every(d => daysList.includes(d))) {
      return 'Todos los días'
    }
    
    // Mostrar días individuales con letras cortas
    return daysList.map(d => {
      const day = DAYS_OF_WEEK.find(dw => dw.value === d)
      return day?.short || d.charAt(0).toUpperCase()
    }).join(', ')
  }
  
  // ==================== HORARIOS ====================
  
  const columnsHorarios: DataTableColumn<Horario>[] = [
    { key: "name", label: "Nombre", sortable: true },
    { 
      key: "distribution_center_id", 
      label: "Centro", 
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {getCentroName(value as string)}
        </div>
      )
    },
    { 
      key: "dock_ids", 
      label: "Puertas", 
      render: (value) => {
        const names = getPuertasNames(value as string)
        const count = value ? (value as string).split(',').length : 0
        return (
          <div className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[150px]" title={names}>
              {count > 2 ? `${count} puertas` : names}
            </span>
          </div>
        )
      }
    },
    { 
      key: "days", 
      label: "Días", 
      render: (value) => (
        <Badge variant="outline">{getDaysDisplay(value as string)}</Badge>
      )
    },
    { 
      key: "start_time", 
      label: "Horario", 
      render: (_, item) => (
        <span className="text-sm">
          {formatTimeWithAmPm(item.start_time)} - {formatTimeWithAmPm(item.end_time)}
        </span>
      )
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value, item) => {
        const isActive = value === true || value === 'TRUE' || value === 'true' || value === 'Sí' || value === undefined
        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Activo
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Inactivo
              </Badge>
            )}
          </div>
        )
      },
    },
  ]
  
  const handleCreateHorario = () => {
    setEditingHorario(null)
    setHorarioForm({
      name: "",
      distribution_center_id: "",
      dock_ids: [],
      days: [],
      start_time: "",
      end_time: "",
      is_active: true,
      inactive_message: "Cerrado",
      notes: "",
    })
    setIsHorarioDialogOpen(true)
  }
  
  const handleEditHorario = (horario: Horario) => {
    console.log("📝 Editando horario:", horario)
    console.log("📝 distribution_center_id:", horario.distribution_center_id)
    console.log("📝 dock_ids:", horario.dock_ids)
    console.log("📝 days:", horario.days)
    
    setEditingHorario(horario)
    
    // Procesar dock_ids - puede venir como string separado por comas o como un solo valor
    let dockIds: string[] = []
    if (horario.dock_ids) {
      dockIds = horario.dock_ids.split(',').map(id => id.trim())
    }
    
    // Procesar days - puede venir como string separado por comas
    let days: string[] = []
    if (horario.days) {
      days = horario.days.split(',').map(d => d.trim().toLowerCase())
    }
    
    // Buscar el ID del centro de distribución
    // Puede venir como ID, como nombre, o como número
    let centroId = horario.distribution_center_id || ""
    console.log("📝 Buscando centro con valor:", centroId)
    console.log("📝 Centros disponibles:", centros.map(c => ({ id: c.id, name: c.name })))
    
    if (centroId) {
      // Primero intentar buscar por ID exacto
      let centroEncontrado = centros.find(c => c.id === centroId)
      
      // Si no se encuentra, buscar por nombre
      if (!centroEncontrado) {
        centroEncontrado = centros.find(c => c.name === centroId)
      }
      
      // Si no se encuentra, intentar buscar por ID numérico (puede venir como "1" pero el ID ser diferente)
      if (!centroEncontrado) {
        const centroIndex = parseInt(centroId) - 1
        if (!isNaN(centroIndex) && centroIndex >= 0 && centroIndex < centros.length) {
          centroEncontrado = centros[centroIndex]
        }
      }
      
      if (centroEncontrado) {
        centroId = centroEncontrado.id
        console.log("📝 Centro encontrado:", centroEncontrado.name, "con ID:", centroId)
      } else {
        console.log("📝 Centro NO encontrado para valor:", centroId)
      }
    }
    
    console.log("📝 centroId resuelto:", centroId)
    console.log("📝 dockIds procesados:", dockIds)
    console.log("📝 days procesados:", days)
    
    setHorarioForm({
      name: horario.name || "",
      distribution_center_id: centroId,
      dock_ids: dockIds,
      days: days,
      start_time: horario.start_time || "",
      end_time: horario.end_time || "",
      is_active: horario.is_active === true || horario.is_active === 'TRUE' || horario.is_active === 'true' || horario.is_active === 'Sí' || horario.is_active === undefined,
      inactive_message: horario.inactive_message || "Cerrado",
      notes: horario.notes || "",
    })
    setIsHorarioDialogOpen(true)
  }
  
  const handleCentroChangeHorario = (value: string) => {
    setHorarioForm(prev => ({
      ...prev,
      distribution_center_id: value,
      dock_ids: [],
    }))
  }
  
  const handleDayToggle = (day: string) => {
    setHorarioForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }
  
  const handleSelectWeekdays = () => {
    setHorarioForm(prev => ({
      ...prev,
      days: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
    }))
  }
  
  const handleSelectWeekend = () => {
    setHorarioForm(prev => ({
      ...prev,
      days: ['sábado', 'domingo']
    }))
  }
  
  const handleSelectAllDays = () => {
    setHorarioForm(prev => ({
      ...prev,
      days: DAYS_OF_WEEK.map(d => d.value)
    }))
  }
  
  const handlePuertaToggleHorario = (puertaId: string) => {
    setHorarioForm(prev => ({
      ...prev,
      dock_ids: prev.dock_ids.includes(puertaId)
        ? prev.dock_ids.filter(id => id !== puertaId)
        : [...prev.dock_ids, puertaId]
    }))
  }
  
  const handleSelectAllPuertasHorario = () => {
    setHorarioForm(prev => ({
      ...prev,
      dock_ids: filteredPuertasHorario.map(p => p.id)
    }))
  }
  
  const handleSubmitHorario = async () => {
    if (!horarioForm.name || !horarioForm.distribution_center_id || horarioForm.dock_ids.length === 0 || horarioForm.days.length === 0) {
      toast.error("Error", "Complete todos los campos requeridos")
      return
    }
    
    setIsSubmitting(true)
    try {
      // Obtener el nombre del centro para guardarlo también
      const centroSeleccionado = centros.find(c => c.id === horarioForm.distribution_center_id)
      const centroNombre = centroSeleccionado?.name || horarioForm.distribution_center_id
      
      // Obtener los nombres de las puertas para guardarlos también
      const puertasNombres = horarioForm.dock_ids.map(id => {
        const puerta = puertas.find(p => p.id === id)
        return puerta?.name || id
      }).join(',')
      
      const dataToSave = {
        name: horarioForm.name,
        distribution_center_id: horarioForm.distribution_center_id,
        dock_ids: horarioForm.dock_ids.join(','),
        days: horarioForm.days.join(','),
        start_time: horarioForm.start_time,
        end_time: horarioForm.end_time,
        is_active: horarioForm.is_active,
        inactive_message: horarioForm.inactive_message,
        notes: horarioForm.notes,
        // Campos para Google Sheets (con nombres en español)
        "Nombre": horarioForm.name,
        "ID Centro de Distribución": horarioForm.distribution_center_id,
        "Centro de Distribución": centroNombre,
        "Puertas": puertasNombres,  // Guardar nombres para mejor lectura
        "Días": horarioForm.days.join(','),
        "Hora Inicio": horarioForm.start_time,
        "Hora Fin": horarioForm.end_time,
        "Activo": horarioForm.is_active ? "Sí" : "No",
        "Mensaje Inactivo": horarioForm.inactive_message,
        "Descripción": horarioForm.notes,
      }
      
      console.log("💾 Guardando horario:", dataToSave)
      
      if (editingHorario) {
        await db.update("horarios", editingHorario.id, dataToSave)
        setHorarios(prev => prev.map(h => 
          h.id === editingHorario.id 
            ? { ...h, ...dataToSave, dock_ids: horarioForm.dock_ids.join(','), days: horarioForm.days.join(',') } 
            : h
        ))
        toast.success("Horario actualizado", "El horario se ha actualizado correctamente")
      } else {
        const created = await db.create("horarios", dataToSave) as Horario | { id: string }
        console.log("💾 Respuesta de creación:", created)
        
        // Usar el ID devuelto por el servidor o generar uno temporal
        const newId = (created as { id: string })?.id || `temp-${Date.now()}`
        
        // Crear el nuevo horario con los datos del formulario y el ID del servidor
        const newHorario: Horario = {
          id: newId,
          name: horarioForm.name,
          distribution_center_id: horarioForm.distribution_center_id,
          dock_ids: horarioForm.dock_ids.join(','),
          days: horarioForm.days.join(','),
          start_time: horarioForm.start_time,
          end_time: horarioForm.end_time,
          is_active: horarioForm.is_active,
          inactive_message: horarioForm.inactive_message,
          notes: horarioForm.notes,
        }
        
        // Agregar solo si no existe ya (evitar duplicados)
        setHorarios(prev => {
          const exists = prev.some(h => h.id === newId)
          if (exists) {
            return prev
          }
          return [...prev, newHorario]
        })
        toast.success("Horario creado", "El horario se ha creado correctamente")
      }
      
      setIsHorarioDialogOpen(false)
    } catch (error) {
      console.error("Error guardando horario:", error)
      toast.error("Error", "No se pudo guardar el horario")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // ==================== EXCEPCIONES ====================
  
  const columnsExcepciones: DataTableColumn<Excepcion>[] = [
    { key: "name", label: "Nombre", sortable: true },
    { 
      key: "distribution_center_id", 
      label: "Centro", 
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {getCentroName(value as string)}
        </div>
      )
    },
    { 
      key: "date", 
      label: "Fecha", 
      render: (value, item) => {
        const dateStr = value as string
        const isRecurring = item.is_recurring === true || item.is_recurring === 'TRUE' || item.is_recurring === 'true'
        return (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{dateStr || '-'}</span>
            {isRecurring && (
              <Badge variant="outline" className="text-xs">Anual</Badge>
            )}
          </div>
        )
      }
    },
    { 
      key: "exception_type", 
      label: "Tipo", 
      render: (value) => {
        const type = value as string
        if (type === 'cerrado') {
          return (
            <Badge variant="destructive" className="gap-1">
              <CalendarOff className="h-3 w-3" />
              Cerrado
            </Badge>
          )
        }
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Horario Especial
          </Badge>
        )
      }
    },
    { 
      key: "message", 
      label: "Mensaje", 
      render: (value) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={value as string}>
          {value || '-'}
        </span>
      )
    },
  ]
  
  const handleCreateExcepcion = () => {
    setEditingExcepcion(null)
    setExcepcionForm({
      name: "",
      horario_id: "",
      distribution_center_id: "",
      dock_ids: [],
      date: undefined,
      exception_type: "cerrado",
      start_time: "",
      end_time: "",
      message: "",
      is_recurring: false,
    })
    setIsExcepcionDialogOpen(true)
  }
  
  const handleEditExcepcion = (excepcion: Excepcion) => {
    setEditingExcepcion(excepcion)
    const dockIds = excepcion.dock_ids ? excepcion.dock_ids.split(',').map(id => id.trim()) : []
    let dateValue: Date | undefined = undefined
    if (excepcion.date) {
      try {
        dateValue = parseISO(excepcion.date)
        if (!isValid(dateValue)) dateValue = undefined
      } catch {
        dateValue = undefined
      }
    }
    setExcepcionForm({
      name: excepcion.name || "",
      horario_id: excepcion.horario_id || "",
      distribution_center_id: excepcion.distribution_center_id || "",
      dock_ids: dockIds,
      date: dateValue,
      exception_type: excepcion.exception_type || "cerrado",
      start_time: excepcion.start_time || "",
      end_time: excepcion.end_time || "",
      message: excepcion.message || "",
      is_recurring: excepcion.is_recurring === true || excepcion.is_recurring === 'TRUE' || excepcion.is_recurring === 'true',
    })
    setIsExcepcionDialogOpen(true)
  }
  
  const handleCentroChangeExcepcion = (value: string) => {
    setExcepcionForm(prev => ({
      ...prev,
      distribution_center_id: value,
      dock_ids: [],
    }))
  }
  
  const handlePuertaToggleExcepcion = (puertaId: string) => {
    setExcepcionForm(prev => ({
      ...prev,
      dock_ids: prev.dock_ids.includes(puertaId)
        ? prev.dock_ids.filter(id => id !== puertaId)
        : [...prev.dock_ids, puertaId]
    }))
  }
  
  const handleSelectAllPuertasExcepcion = () => {
    setExcepcionForm(prev => ({
      ...prev,
      dock_ids: filteredPuertasExcepcion.map(p => p.id)
    }))
  }
  
  const handleSubmitExcepcion = async () => {
    if (!excepcionForm.name || !excepcionForm.distribution_center_id || !excepcionForm.date) {
      toast.error("Error", "Complete todos los campos requeridos")
      return
    }
    
    setIsSubmitting(true)
    try {
      const dateStr = format(excepcionForm.date, "yyyy-MM-dd")
      const dataToSave = {
        name: excepcionForm.name,
        horario_id: excepcionForm.horario_id,
        distribution_center_id: excepcionForm.distribution_center_id,
        dock_ids: excepcionForm.dock_ids.join(','),
        date: dateStr,
        exception_type: excepcionForm.exception_type,
        start_time: excepcionForm.exception_type === 'horario_especial' ? excepcionForm.start_time : '',
        end_time: excepcionForm.exception_type === 'horario_especial' ? excepcionForm.end_time : '',
        message: excepcionForm.message,
        is_recurring: excepcionForm.is_recurring,
        // Campos para Google Sheets (usando la hoja dias_festivos)
        "Nombre": excepcionForm.name,
        "ID Centro de Distribución": excepcionForm.distribution_center_id,
        "Puertas": excepcionForm.dock_ids.join(','),
        "Fecha": dateStr,
        "Tipo": excepcionForm.exception_type,
        "Hora Inicio": excepcionForm.exception_type === 'horario_especial' ? excepcionForm.start_time : '',
        "Hora Fin": excepcionForm.exception_type === 'horario_especial' ? excepcionForm.end_time : '',
        "Mensaje": excepcionForm.message,
        "Recurrente": excepcionForm.is_recurring ? "Sí" : "No",
        "Es Día Laboral": excepcionForm.exception_type === 'horario_especial' ? "Sí" : "No",
        "Descripción": excepcionForm.message,
      }
      
      if (editingExcepcion) {
        await db.update("dias_festivos", editingExcepcion.id, dataToSave)
        setExcepciones(prev => prev.map(e => 
          e.id === editingExcepcion.id 
            ? { ...e, ...dataToSave, dock_ids: excepcionForm.dock_ids.join(','), date: dateStr } 
            : e
        ))
        toast.success("Excepción actualizada", "La excepción se ha actualizado correctamente")
      } else {
        const created = await db.create("dias_festivos", dataToSave) as Excepcion | { id: string }
        console.log("💾 Respuesta de creación excepción:", created)
        
        // Usar el ID devuelto por el servidor o generar uno temporal
        const newId = (created as { id: string })?.id || `temp-${Date.now()}`
        
        // Crear la nueva excepción con los datos del formulario
        const newExcepcion: Excepcion = {
          id: newId,
          name: excepcionForm.name,
          horario_id: excepcionForm.horario_id,
          distribution_center_id: excepcionForm.distribution_center_id,
          dock_ids: excepcionForm.dock_ids.join(','),
          date: dateStr,
          exception_type: excepcionForm.exception_type,
          start_time: excepcionForm.exception_type === 'horario_especial' ? excepcionForm.start_time : '',
          end_time: excepcionForm.exception_type === 'horario_especial' ? excepcionForm.end_time : '',
          message: excepcionForm.message,
          is_recurring: excepcionForm.is_recurring,
        }
        
        // Agregar solo si no existe ya (evitar duplicados)
        setExcepciones(prev => {
          const exists = prev.some(e => e.id === newId)
          if (exists) {
            return prev
          }
          return [...prev, newExcepcion]
        })
        toast.success("Excepción creada", "La excepción se ha creado correctamente")
      }
      
      setIsExcepcionDialogOpen(false)
    } catch (error) {
      console.error("Error guardando excepción:", error)
      toast.error("Error", "No se pudo guardar la excepción")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // ==================== ELIMINAR ====================
  
  const handleDelete = async () => {
    if (!deleteConfirmId) return
    
    try {
      if (deleteType === "horario") {
        await db.delete("horarios", deleteConfirmId)
        setHorarios(prev => prev.filter(h => h.id !== deleteConfirmId))
        toast.success("Horario eliminado", "El horario se ha eliminado correctamente")
      } else {
        await db.delete("dias_festivos", deleteConfirmId)
        setExcepciones(prev => prev.filter(e => e.id !== deleteConfirmId))
        toast.success("Excepción eliminada", "La excepción se ha eliminado correctamente")
      }
      setDeleteConfirmId(null)
    } catch (error) {
      console.error("Error eliminando:", error)
      toast.error("Error", "No se pudo eliminar el registro")
    }
  }
  
  const handleIntervalChange = (checked: boolean) => {
    setTimeInterval(checked ? 30 : 60)
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Configuración de Intervalo de Horarios */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Configuración de Visualización
          </CardTitle>
          <CardDescription>
            Configura cómo se muestran los horarios en el calendario y el wizard de citas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="interval-switch" className="text-base font-medium cursor-pointer">
                  Mostrar horarios cada media hora
                </Label>
                <p className="text-sm text-muted-foreground">
                  {timeInterval === 30 
                    ? "Los horarios se muestran cada 30 minutos (6:00, 6:30, 7:00...)" 
                    : "Los horarios se muestran cada hora (6:00, 7:00, 8:00...)"}
                </p>
              </div>
            </div>
            <Switch
              id="interval-switch"
              checked={timeInterval === 30}
              onCheckedChange={handleIntervalChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Horarios y Excepciones */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="horarios" className="gap-2">
            <Clock className="h-4 w-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="excepciones" className="gap-2">
            <CalendarOff className="h-4 w-4" />
            Excepciones
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Horarios */}
        <TabsContent value="horarios" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horarios de Atención
                  </CardTitle>
                  <CardDescription>
                    Gestiona los horarios por centro de distribución y puertas
                  </CardDescription>
                </div>
                <Button onClick={handleCreateHorario} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Horario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <DataTable
                  data={horarios}
                  columns={columnsHorarios}
                  searchFields={["name"]}
                  onEdit={(item) => handleEditHorario(item)}
                  onDelete={(item) => {
                    setDeleteType("horario")
                    setDeleteConfirmId(item.id)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab Excepciones */}
        <TabsContent value="excepciones" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarOff className="h-5 w-5" />
                    Excepciones de Calendario
                  </CardTitle>
                  <CardDescription>
                    Días festivos, cierres especiales y horarios modificados
                  </CardDescription>
                </div>
                <Button onClick={handleCreateExcepcion} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Excepción
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <DataTable
                  data={excepciones}
                  columns={columnsExcepciones}
                  searchFields={["name", "date"]}
                  onEdit={(item) => handleEditExcepcion(item)}
                  onDelete={(item) => {
                    setDeleteType("excepcion")
                    setDeleteConfirmId(item.id)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Horario */}
      <Dialog open={isHorarioDialogOpen} onOpenChange={setIsHorarioDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHorario ? "Editar Horario" : "Nuevo Horario"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingHorario ? "Editar horario" : "Nuevo horario"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Horario *</Label>
              <Input
                id="name"
                value={horarioForm.name}
                onChange={(e) => setHorarioForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Horario Regular, Horario Matutino..."
              />
            </div>
            
            {/* Centro de Distribución */}
            <div className="grid gap-2">
              <Label>Centro de Distribución *</Label>
              <Select
                value={horarioForm.distribution_center_id}
                onValueChange={handleCentroChangeHorario}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un centro..." />
                </SelectTrigger>
                <SelectContent>
                  {centros.map((centro) => (
                    <SelectItem key={centro.id} value={centro.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {centro.name}
                        {centro.city && <span className="text-muted-foreground">- {centro.city}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Puertas */}
            {horarioForm.distribution_center_id && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Puertas *</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAllPuertasHorario}>
                      Todas
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setHorarioForm(prev => ({ ...prev, dock_ids: [] }))}>
                      Limpiar
                    </Button>
                  </div>
                </div>
                
                {filteredPuertasHorario.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                    No hay puertas configuradas para este centro
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg">
                    {filteredPuertasHorario.map((puerta) => (
                      <div
                        key={puerta.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          horarioForm.dock_ids.includes(puerta.id)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => handlePuertaToggleHorario(puerta.id)}
                      >
                        <Checkbox checked={horarioForm.dock_ids.includes(puerta.id)} />
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{puerta.name}</span>
                          {puerta.type && <Badge variant="secondary" className="text-xs">{puerta.type}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Días de la semana */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Días que aplica *</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleSelectWeekdays}>
                    L-V
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleSelectWeekend}>
                    Fin de Semana
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleSelectAllDays}>
                    Todos
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={horarioForm.days.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayToggle(day.value)}
                    className="min-w-[100px]"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Horarios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Hora Inicio *</Label>
                <Select
                  value={horarioForm.start_time}
                  onValueChange={(value) => setHorarioForm(prev => ({ ...prev, start_time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Hora Fin *</Label>
                <Select
                  value={horarioForm.end_time}
                  onValueChange={(value) => setHorarioForm(prev => ({ ...prev, end_time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            {/* Estado activo/inactivo */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                <Switch
                  id="is_active"
                  checked={horarioForm.is_active}
                  onCheckedChange={(checked) => setHorarioForm(prev => ({ ...prev, is_active: checked }))}
                />
                <div className="flex-1">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Horario Activo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {horarioForm.is_active 
                      ? "Las puertas están disponibles para citas en este horario"
                      : "Las puertas aparecerán como no disponibles"}
                  </p>
                </div>
              </div>
              
              {!horarioForm.is_active && (
                <div className="grid gap-2">
                  <Label>Mensaje cuando está inactivo</Label>
                  <Input
                    value={horarioForm.inactive_message}
                    onChange={(e) => setHorarioForm(prev => ({ ...prev, inactive_message: e.target.value }))}
                    placeholder="Ej: Cerrado por mantenimiento, Fuera de servicio..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Este mensaje se mostrará en el calendario cuando el horario esté deshabilitado
                  </p>
                </div>
              )}
            </div>
            
            {/* Notas */}
            <div className="grid gap-2">
              <Label>Notas</Label>
              <Textarea
                value={horarioForm.notes}
                onChange={(e) => setHorarioForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales sobre el horario..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHorarioDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitHorario} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : editingHorario ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Excepción */}
      <Dialog open={isExcepcionDialogOpen} onOpenChange={setIsExcepcionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExcepcion ? "Editar Excepción" : "Nueva Excepción"}
            </DialogTitle>
            <DialogDescription>
              Días festivos, cierres especiales o modificaciones de horario
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="exc_name">Nombre de la Excepción *</Label>
              <Input
                id="exc_name"
                value={excepcionForm.name}
                onChange={(e) => setExcepcionForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Navidad, Año Nuevo, Mantenimiento..."
              />
            </div>
            
            {/* Centro de Distribución */}
            <div className="grid gap-2">
              <Label>Centro de Distribución *</Label>
              <Select
                value={excepcionForm.distribution_center_id}
                onValueChange={handleCentroChangeExcepcion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un centro..." />
                </SelectTrigger>
                <SelectContent>
                  {centros.map((centro) => (
                    <SelectItem key={centro.id} value={centro.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {centro.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Puertas afectadas */}
            {excepcionForm.distribution_center_id && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Puertas afectadas (opcional)</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAllPuertasExcepcion}>
                      Todas
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setExcepcionForm(prev => ({ ...prev, dock_ids: [] }))}>
                      Limpiar
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deja vacío para aplicar a todas las puertas del centro
                </p>
                
                <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg max-h-[150px] overflow-y-auto">
                  {filteredPuertasExcepcion.map((puerta) => (
                    <div
                      key={puerta.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                        excepcionForm.dock_ids.includes(puerta.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handlePuertaToggleExcepcion(puerta.id)}
                    >
                      <Checkbox checked={excepcionForm.dock_ids.includes(puerta.id)} />
                      <span className="text-sm">{puerta.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fecha */}
            <div className="grid gap-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={excepcionForm.date ? format(excepcionForm.date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const dateValue = e.target.value ? parseISO(e.target.value) : undefined
                  setExcepcionForm(prev => ({ ...prev, date: dateValue }))
                }}
                className="w-full"
              />
            </div>
            
            {/* Tipo de excepción */}
            <div className="grid gap-2">
              <Label>Tipo de Excepción *</Label>
              <Select
                value={excepcionForm.exception_type}
                onValueChange={(value) => setExcepcionForm(prev => ({ ...prev, exception_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXCEPTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Horario especial */}
            {excepcionForm.exception_type === 'horario_especial' && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid gap-2">
                  <Label>Hora Inicio</Label>
                  <Select
                    value={excepcionForm.start_time}
                    onValueChange={(value) => setExcepcionForm(prev => ({ ...prev, start_time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Hora Fin</Label>
                  <Select
                    value={excepcionForm.end_time}
                    onValueChange={(value) => setExcepcionForm(prev => ({ ...prev, end_time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Mensaje personalizado */}
            <div className="grid gap-2">
              <Label>Mensaje personalizado</Label>
              <Input
                value={excepcionForm.message}
                onChange={(e) => setExcepcionForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Ej: Cerrado por festividad, Horario reducido..."
              />
              <p className="text-xs text-muted-foreground">
                Este mensaje se mostrará en el calendario de citas
              </p>
            </div>
            
            {/* Recurrente */}
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <Switch
                id="is_recurring"
                checked={excepcionForm.is_recurring}
                onCheckedChange={(checked) => setExcepcionForm(prev => ({ ...prev, is_recurring: checked }))}
              />
              <div>
                <Label htmlFor="is_recurring" className="cursor-pointer">
                  Se repite cada año
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activa esta opción para días festivos anuales
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExcepcionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitExcepcion} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : editingExcepcion ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar {deleteType === "horario" ? "este horario" : "esta excepción"}? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
