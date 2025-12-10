# CEDI Pharma - Sistema de Gestión de Centros de Distribución

Sistema de Gestión de Centros de Distribución (CEDI) para la industria farmacéutica. Una SPA multi-tenant con RBAC completo.

![CEDI Pharma](https://img.shields.io/badge/CEDI-Pharma-8b5cf6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?style=flat-square)

## 🚀 Características

### Módulos del Sistema

- **📦 Catálogo de Productos**: Registro completo con datos logísticos, temperatura, y precios
- **📅 Gestión de Citas**: Programación de recepciones con andenes y slots de tiempo
- **🚚 Proveedores**: Gestión de proveedores y compradores asignados
- **⚙️ Configuración**: Andenes, tipos de vehículo, horarios, días festivos
- **📊 Reportería**: Exportación de datos en CSV/PDF
- **🔍 Auditoría**: Registro completo de cambios en el sistema

### Características Técnicas

- ✅ **Multi-tenant**: Soporte para múltiples centros de distribución (RDC)
- ✅ **RBAC**: Control de acceso basado en roles
- ✅ **CRUD Genérico**: Componentes reutilizables para operaciones CRUD
- ✅ **Exportación**: CSV y PDF
- ✅ **Auditoría**: Log completo de cambios
- ✅ **Responsive**: Diseño adaptable a móviles y tablets
- ✅ **Animaciones**: Transiciones fluidas con Framer Motion

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd cedi-pharma

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:3000`

## ⚡ Desarrollo Local con Supabase

### Prerrequisitos
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado (`npm install -g supabase`)
- Docker corriendo

### Iniciar Localmente
```bash
npx supabase start
```
Esto levantará los servicios de Supabase en Docker y mostrará las URLs y claves locales.

### Enlazar Proyecto Remoto
Para sincronizar con el proyecto en la nube:
```bash
npx supabase login
npx supabase link --project-ref <project-id>
```

### Gestión de Migraciones
```bash
# Crear nueva migración vacía
npx supabase migration new nombre_del_cambio

# Auto-generar migración basada en cambios de BD locales (Diff)
npx supabase db diff --use-migra -f nombre_migracion

# Aplicar solo las migraciones nuevas (sin borrar datos)
npx supabase migration up

# Aplicar migraciones pendientes localmente (Reset completo)
npx supabase db reset  # Cuidado: borra datos locales y resetea la BD

### ¿Cómo sabe Supabase qué ejecutar?
Supabase mantiene una tabla especial llamada `supabase_migrations.schema_migrations` donde registra qué scripts ya se ejecutaron. Al correr `migration up`, compara esa tabla con los archivos en tu carpeta `supabase/migrations` y solo ejecuta los que faltan.

# Aplicar migraciones al proyecto remoto
npx supabase db push

### Revertir Migraciones (Rollback)
Si necesitas deshacer migraciones recientes:

```bash
# Revertir la última migración aplicada en local (baja 1 versión)

# Revertir la última migración aplicada en local (baja 1 versión)
npx supabase migration down

# Revertir las últimas N migraciones
npx supabase migration down --last 2

# [PELIGRO] Revertir en proyecto REMOTO (Producción/Staging)
# Esto revertirá la migración en la base de datos vinculada.
# Úsalo con extrema precaución ya que puede borrar datos.
npx supabase migration down --linked
```
```

### Gestión de Semillas (Seeds)
Supabase carga automáticamente el archivo `supabase/seeds.sql` cuando reinicias la base de datos localmente.

```bash
# Resetear base de datos local y aplicar seeds (Borra datos existentes)
npx supabase db reset
```

Para aplicar seeds específicos (como `products.sql`) o en un proyecto remoto:
1.  **Opción A (SQL Editor)**: Copia el contenido del archivo `.sql` y ejecútalo en el Editor SQL de Supabase.
2.  **Opción B (Concat y Pipe)**:
    ```bash
    # Local
    cat supabase/seeds/products.sql | npx supabase db execute --local

    # Remoto (requiere db url)
    cat supabase/seeds/products.sql | npx supabase db execute --project-ref <page-id>
    ```

### Generación de Tipos TypeScript

#### Remoto (Producción/Staging)
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
```

#### Local (Desarrollo)
Si estás trabajando localmente y aún no has subido cambios:
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Funciones (Edge Functions)
```bash
# Ejecutar función localmente
npx supabase functions serve nombre-funcion

# Desplegar función
npx supabase functions deploy nombre-funcion
```

### Generación de Tipos
Recuerda actualizar los tipos cuando cambies la base de datos:
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
```

## 🔐 Credenciales de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | admin@cedi.com | cedi2024 |
| Admin Catálogo | catalogo@cedi.com | cedi2024 |
| Admin Citas | citas@cedi.com | cedi2024 |
| Proveedor | proveedor@cedi.com | cedi2024 |
| Seguridad | seguridad@cedi.com | cedi2024 |

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── crud/           # Componentes CRUD genéricos
│   │   ├── CRUDPage.tsx
│   │   ├── DataTable.tsx
│   │   └── GenericForm.tsx
│   ├── layout/         # Layout principal
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/             # Componentes UI base
├── pages/
│   ├── catalog/        # Módulo de Catálogo
│   ├── suppliers/      # Módulo de Proveedores
│   ├── scheduling/     # Módulo de Citas
│   └── config/         # Módulo de Configuración
├── services/
│   ├── database.service.ts  # Servicio de base de datos
│   └── seed.service.ts      # Datos de demostración
├── store/
│   ├── auth.store.ts   # Estado de autenticación
│   └── ui.store.ts     # Estado de UI
├── types/              # Tipos TypeScript
└── lib/                # Utilidades
```

## 🎨 Componentes CRUD Genéricos

El sistema incluye componentes reutilizables para operaciones CRUD:

### CRUDPage

```tsx
import { CRUDPage } from '@/components/crud/CRUDPage'

<CRUDPage
  config={crudConfig}
  entityName="products"
  columns={tableColumns}
  formFields={formFields}
  formSchema={zodSchema}
  searchFields={['name', 'sku']}
/>
```

### DataTable

Tabla configurable con:
- Búsqueda global
- Ordenamiento por columnas
- Selección múltiple
- Paginación
- Acciones por fila (Ver, Editar, Eliminar)

### GenericForm

Formulario dinámico que soporta:
- Campos de texto, número, email
- Selects y switches
- Campos de fecha y hora
- Validación con Zod

## 🗄️ Base de Datos

El sistema usa localStorage como almacenamiento demo, pero está diseñado para conectarse fácilmente a:

- **Google Sheets API**: Ideal para administración fácil desde WeWeb
- **MySQL**: Para producción con mayor volumen
- **Supabase/Firebase**: Para aplicaciones en tiempo real

### Configurar Adaptador

```typescript
import { db } from '@/services/database.service'

db.configure({
  adapter: 'google-sheets',
  sheetsApiKey: 'YOUR_API_KEY',
  spreadsheetId: 'YOUR_SPREADSHEET_ID'
})
```

## 🔒 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| superadmin | Acceso total |
| admin | CRUD en su RDC |
| scheduling-admin | Gestión de citas |
| catalog-admin | Gestión de productos |
| supplier-admin | Sus citas y usuarios |
| supplier-user | Solo sus citas |
| security | Lectura de llegadas |

## 🎯 Flujo de Citas

```
SCHEDULED → PENDING_TRANSPORT_DATA → COMPLETE → RECEIVING_STARTED → RECEIVING_FINISHED
    │                   │
    ▼                   ▼
CANCELLED         DID_NOT_SHOW
```

## 📤 Exportación de Datos

```typescript
import { exportToCSV } from '@/lib/utils'

exportToCSV(data, 'productos_export', [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Nombre' },
  { key: 'price', label: 'Precio' }
])
```

## 🎨 Paleta de Colores

| Módulo | Color Primario |
|--------|----------------|
| Dashboard | Blue |
| Catálogo | Emerald |
| Citas | Purple |
| Proveedores | Green |
| Seguridad | Red |
| Reportería | Cyan |

## 🛡️ Integración con WeWeb

Este sistema está diseñado para integrarse fácilmente con WeWeb:

1. **Autenticación**: Sistema simple de usuario/contraseña
2. **Base de datos**: Compatible con Google Sheets o Supabase
3. **API REST**: Endpoints predecibles para CRUD
4. **Eventos**: Sistema de notificaciones para webhooks

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Verificar linting
```

## 🔄 Próximas Características

- [ ] Integración con Google Sheets API
- [ ] Notificaciones por email (SendGrid)
- [ ] Módulo de reportería avanzada
- [ ] Exportación a PDF
- [ ] Modo offline con Service Workers
- [ ] Dashboard con gráficas en tiempo real

## 📄 Licencia

MIT © 2024 CEDI Pharma

---

Desarrollado con ❤️ para la industria farmacéutica


