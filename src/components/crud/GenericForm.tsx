import * as React from "react"
import { useForm, type FieldValues, type DefaultValues, type Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ZodSchema } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormSkeleton } from "@/components/ui/skeleton"
import { db } from "@/services/database.service"
import type { FormField, BaseEntity } from "@/types"

interface GenericFormProps<T extends FieldValues> {
  fields: FormField[]
  schema: ZodSchema<T>
  defaultValues?: DefaultValues<T>
  onSubmit: (data: T) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

// Cache de opciones dinámicas (se limpia cada vez que se abre el formulario)
// Para evitar problemas con datos desactualizados
let optionsCache: Record<string, { value: string; label: string }[]> = {}

// Función para limpiar el cache manualmente si es necesario
export function clearOptionsCache() {
  optionsCache = {}
}

export function GenericForm<T extends FieldValues>({
  fields,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  loading = false,
  disabled = false,
  className,
}: GenericFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [dynamicOptions, setDynamicOptions] = React.useState<Record<string, { value: string; label: string }[]>>({})

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // Cargar opciones dinámicas de otras entidades
  React.useEffect(() => {
    const loadDynamicOptions = async () => {
      const fieldsWithEntity = fields.filter(f => f.optionsEntity)
      
      for (const field of fieldsWithEntity) {
        if (!field.optionsEntity) continue
        
        try {
          // Siempre cargar opciones frescas para asegurar datos actualizados
          const items = await db.getAll<BaseEntity>(field.optionsEntity)
          const options = items.map(item => {
            // Usar el nombre como value (coincide con lo que se guarda en Google Sheets)
            const name = String(item.name || item.Nombre || '')
            return {
              value: name,  // El valor guardado es el nombre, no el ID
              label: name
            }
          }).filter(opt => opt.value) // Filtrar opciones vacías
          
          console.log(`📋 Opciones cargadas para ${field.name}:`, options)
          
          // Guardar en cache
          optionsCache[field.optionsEntity] = options
          
          setDynamicOptions(prev => ({
            ...prev,
            [field.name]: options
          }))
        } catch (error) {
          console.error(`Error cargando opciones de ${field.optionsEntity}:`, error)
        }
      }
    }
    
    loadDynamicOptions()
  }, [fields])

  const handleSubmit = async (data: T) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <FormSkeleton fields={fields.length} />
  }
  
  // Combinar opciones estáticas y dinámicas
  const getFieldOptions = (field: FormField) => {
    // Si el campo depende de otro campo, usar getOptions con el valor del campo padre
    if (field.dependsOn && field.getOptions) {
      const dependsOnValue = form.watch(field.dependsOn as Path<T>) as string
      if (dependsOnValue) {
        return field.getOptions(dependsOnValue)
      }
      return []
    }
    
    if (field.optionsEntity && dynamicOptions[field.name]) {
      return dynamicOptions[field.name]
    }
    return field.options || []
  }

  // Componente para campos select con dependencia (para re-render cuando cambia el padre)
  const DependentSelect = ({ field }: { field: FormField }) => {
    const dependsOnValue = form.watch(field.dependsOn as Path<T>) as string
    const options = React.useMemo(() => {
      if (field.getOptions && dependsOnValue) {
        return field.getOptions(dependsOnValue)
      }
      return []
    }, [dependsOnValue, field])
    
    const currentValue = form.watch(field.name as Path<T>) as string
    const error = form.formState.errors[field.name as Path<T>]?.message as string | undefined
    const isDisabled = disabled || field.disabled || !dependsOnValue
    
    // Limpiar el valor si el padre cambia y el valor actual no está en las nuevas opciones
    React.useEffect(() => {
      if (currentValue && options.length > 0) {
        const valueExists = options.some(opt => opt.value === currentValue)
        if (!valueExists) {
          form.setValue(field.name as Path<T>, '' as T[keyof T])
        }
      }
    }, [dependsOnValue, options, currentValue])
    
    return (
      <div className={cn("space-y-2", field.className)}>
        <Label htmlFor={field.name} required={field.required}>
          {field.label}
        </Label>
        <Select
          value={currentValue || ''}
          onValueChange={(value) => form.setValue(field.name as Path<T>, value as T[keyof T])}
          disabled={isDisabled}
        >
          <SelectTrigger className={cn(error && "border-destructive")}>
            <SelectValue placeholder={!dependsOnValue ? "Primero seleccione el país..." : (field.placeholder || "Seleccionar...")} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  const renderField = (field: FormField) => {
    if (field.hidden) return null

    // Si es un campo dependiente, usar el componente especial
    if (field.dependsOn && field.getOptions) {
      return <DependentSelect key={field.name} field={field} />
    }

    const error = form.formState.errors[field.name as Path<T>]?.message as string | undefined
    const isDisabled = disabled || field.disabled

    return (
      <div key={field.name} className={cn("space-y-2", field.className)}>
        <Label htmlFor={field.name} required={field.required}>
          {field.label}
        </Label>

        {field.type === "text" || field.type === "email" || field.type === "password" ? (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            disabled={isDisabled}
            maxLength={field.maxLength}
            error={error}
            {...form.register(field.name as Path<T>)}
          />
        ) : field.type === "number" ? (
          <Input
            id={field.name}
            type="number"
            placeholder={field.placeholder}
            disabled={isDisabled}
            min={field.min}
            max={field.max}
            step={field.step}
            error={error}
            {...form.register(field.name as Path<T>, { valueAsNumber: true })}
          />
        ) : field.type === "textarea" ? (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            disabled={isDisabled}
            maxLength={field.maxLength}
            error={error}
            {...form.register(field.name as Path<T>)}
          />
        ) : field.type === "select" ? (
          <Select
            value={form.watch(field.name as Path<T>) as string}
            onValueChange={(value) => form.setValue(field.name as Path<T>, value as T[keyof T])}
            disabled={isDisabled}
          >
            <SelectTrigger className={cn(error && "border-destructive")}>
              <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
            </SelectTrigger>
            <SelectContent>
              {getFieldOptions(field).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "switch" ? (
          <div className="flex items-center gap-2">
            <Switch
              id={field.name}
              checked={form.watch(field.name as Path<T>) as boolean}
              onCheckedChange={(checked) => form.setValue(field.name as Path<T>, checked as T[keyof T])}
              disabled={isDisabled}
            />
            {field.description && (
              <span className="text-sm text-muted-foreground">{field.description}</span>
            )}
          </div>
        ) : field.type === "date" ? (
          <Input
            id={field.name}
            type="date"
            disabled={isDisabled}
            error={error}
            {...form.register(field.name as Path<T>)}
          />
        ) : field.type === "time" ? (
          <Input
            id={field.name}
            type="time"
            disabled={isDisabled}
            error={error}
            {...form.register(field.name as Path<T>)}
          />
        ) : field.type === "datetime" ? (
          <Input
            id={field.name}
            type="datetime-local"
            disabled={isDisabled}
            error={error}
            {...form.register(field.name as Path<T>)}
          />
        ) : null}

        {field.description && field.type !== "switch" && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(renderField)}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={disabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

