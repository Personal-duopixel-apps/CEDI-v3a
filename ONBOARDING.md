# Guía de Onboarding - CEDI Pharma v3

¡Bienvenido al equipo! 👋 Esta guía está diseñada para ayudarte a entender rápidamente la arquitectura y el funcionamiento del sistema CEDI Pharma.

## 🏗️ Visión General del Proyecto

CEDI Pharma es una **Single Page Application (SPA)** construida con **React** y **Vite**, diseñada para la gestión de Centros de Distribución Farmacéutica.

El sistema es **Multi-tenant** y cuenta con un sistema robusto de **Control de Acceso Basado en Roles (RBAC)**.

### 🛠️ Tech Stack Principal

- **Core**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS, Shadcn UI (componentes base)
- **Estado**: Zustand (con persistencia en localStorage)
- **Enrutamiento**: React Router DOM v6
- **Formularios**: React Hook Form + Zod
- **Iconos**: Lucide React
- **Datos**: Capa de servicio abstracta (soporta LocalStorage, Google Sheets, API)

---

## 📂 Estructura del Proyecto

La estructura sigue un patrón modular y organizado:

```
src/
├── components/
│   ├── crud/           # 🌟 EL CORAZÓN DEL SISTEMA: Componentes genéricos (CRUDPage, DataTable)
│   ├── layout/         # Estructura visual (Sidebar, Header, MainLayout)
│   └── ui/             # Componentes base de Shadcn UI (Botones, Inputs, etc.)
├── config/             # Configuraciones globales (Database, Menús)
├── pages/              # Vistas de la aplicación organizadas por módulo
├── services/           # 🔌 Capa de Datos (DatabaseService, GoogleSheetsService)
├── store/              # 🧠 Gestión de Estado Global (Auth, UI)
├── types/              # Definiciones de TypeScript compartidas
└── lib/                # Utilidades y helpers
```

---

## 🧠 Arquitectura y Conceptos Clave

### 1. La Capa de Datos (`services/database.service.ts`)

A diferencia de una app tradicional que llama a una API REST directamente, este proyecto usa una **capa de abstracción de base de datos** (`DatabaseService`).

- **¿Por qué?**: Permite cambiar el backend sin tocar el frontend.
- **Adaptadores**:
    - **LocalStorage**: Para desarrollo rápido y demos (default).
    - **Google Sheets**: Para producción ligera (usado como CMS/BD).
    - **API**: Preparado para conectar con un backend real (Python/Node) en el futuro.

**Ejemplo de uso:**
```typescript
// En lugar de fetch('/api/products')...
const products = await db.getAll('products', { rdcId: 'rdc-1' });
```

### 2. Componentes CRUD Genéricos (`components/crud/`)

Para evitar repetir código en las decenas de catálogos (Productos, Laboratorios, etc.), hemos creado un "Motor CRUD".

- **`CRUDPage`**: Componente maestro. Le pasas la configuración y él genera la tabla, el buscador, el modal de creación/edición y maneja la lógica.
- **`GenericForm`**: Genera formularios dinámicos basados en un esquema de configuración.

**Cómo crear una nueva página de catálogo:**
Solo necesitas definir la configuración (columnas y campos) e invocar `<CRUDPage />`. ¡No necesitas escribir el HTML de la tabla ni del formulario!

### 3. Gestión de Estado (`store/`)

Usamos **Zustand** por su simplicidad.
- **`auth.store.ts`**: Maneja la sesión del usuario, roles y permisos.
- **`ui.store.ts`**: Maneja estado de la interfaz (sidebar colapsado, tema, etc.).

### 4. Autenticación y RBAC

La autenticación es simulada actualmente (hardcoded en `auth.store.ts` con usuarios demo), pero el sistema de permisos es real y funcional.
- **`hasPermission('catalog.read')`**: Verifica si el usuario puede ver el catálogo.
- **`hasRole('admin')`**: Verifica el rol.

---

## 🚀 Flujo de Trabajo Común

### Tarea: Agregar un nuevo campo a un catálogo existente

1.  Ve a `src/types/index.ts` (o el archivo de tipos correspondiente) y agrega el campo a la interfaz.
2.  Ve a la página correspondiente en `src/pages/catalog/`.
3.  Agrega el campo a la definición de `columns` (para que salga en la tabla).
4.  Agrega el campo a `formFields` (para que salga en el formulario).
5.  Actualiza el esquema de validación `zodSchema`.

¡Listo! `CRUDPage` se encarga del resto.

### Tarea: Crear un nuevo módulo

1.  Crea una carpeta en `src/pages/`.
2.  Define la página usando `CRUDPage` o crea una vista personalizada.
3.  Registra la ruta en `src/App.tsx`.
4.  Agrega el ítem al menú en `src/components/layout/Sidebar.tsx` (o donde se defina la navegación).

---

## ⚠️ Gotchas / A tener en cuenta

- **Persistencia**: Al usar `localStorage`, si borras el caché del navegador, pierdes los datos (a menos que estés conectado a Google Sheets).
- **Google Sheets**: La sincronización tiene un caché de 60 segundos para evitar límites de cuota de la API de Google.
- **Tipos**: TypeScript es estricto aquí. Asegúrate de definir bien tus interfaces en `types/`.

---

## 🏁 Próximos Pasos para ti

1.  Juega con la app: Logueate como `admin@cedi.com` (pass: `cedi2024`).
2.  Explora `src/config/database.config.ts` para ver cómo se configura el adaptador.
3.  Intenta agregar una columna simple a la tabla de Productos (`src/pages/catalog/ProductsPage.tsx`).

¡Éxito en el desarrollo! 🚀
