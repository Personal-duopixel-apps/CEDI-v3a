/**
 * =====================================================
 * CONFIGURACIÓN DE BASE DE DATOS - CEDI PHARMA
 * =====================================================
 * 
 * Configura aquí tus credenciales de base de datos.
 * 
 * OPCIONES DE ADAPTADOR:
 * - 'local': Usa localStorage (para desarrollo/demo)
 * - 'google-sheets': Conecta con Google Sheets API
 * - 'mysql': Conecta con API REST a MySQL
 * - 'supabase': Conecta con Supabase
 */

export type DatabaseAdapter = 'local' | 'google-sheets' | 'mysql' | 'supabase'

export const databaseConfig = {
  // =====================================================
  // ADAPTADOR ACTIVO
  // =====================================================
  adapter: 'google-sheets' as DatabaseAdapter,

  // =====================================================
  // GOOGLE SHEETS
  // =====================================================
  googleSheets: {
    apiKey: 'AIzaSyD5TIf4NH5ZAaCD2QNJtv7kRKm8Cq5Zg4Y',
    spreadsheetId: '1E7UF4d9XLZf90dZ-2uNhJ1lxMDxD3qu4CZdsKdAsVVw',
    
    // Nombres de las hojas (pestañas) - DEBEN COINCIDIR EXACTAMENTE con el Google Sheet
    // Incluye alias en inglés para las páginas que usan nombres en inglés
    sheetNames: {
      // Usuarios y Seguridad
      users: 'usuarios',
      audit_logs: 'audit_logs',
      
      // Catálogos (nombres en español)
      products: 'productos',
      laboratories: 'laboratorios',
      categories: 'clasificaciones',
      drug_categories: 'clasificaciones',
      formas_farmaceuticas: 'formas farmaceuticas',
      unidades_medida: 'unidades de medida',
      tipos_empaque: 'tipos de empaque',
      impuestos: 'impuestos',
      monedas: 'monedas',
      niveles_producto: 'niveles de producto',
      principios_activos: 'principios activos',
      medidas_peso: 'medidas peso',
      
      // Catálogos (alias en inglés para las páginas)
      classifications: 'clasificaciones',
      pharmaceutical_forms: 'formas farmaceuticas',
      measurement_units: 'unidades de medida',
      package_types: 'tipos de empaque',
      taxes: 'impuestos',
      currencies: 'monedas',
      product_levels: 'niveles de producto',
      active_ingredients: 'principios activos',
      
      // Proveedores
      suppliers: 'proveedores',
      buyers: 'compradores',
      solicitantes: 'Solicitantes',
      
      // Productos - Datos adicionales
      datos_logisticos: 'datos logisticos',
      datos_compra: 'datos compra',
      producto_ingredientes: 'producto ingredientes activos',
      producto_bonificaciones: 'producto bonificaciones',
      producto_categorias: 'producto categorias',
      
      // Configuración
      centros_distribucion: 'centros distribucion',
      horarios_negocio: 'horarios negocio',
      vehicle_types: 'tipos vehiculo',
      docks: 'puertas',
      horarios: 'horarios',
      dias_festivos: 'dias festivos',
      
      // Citas
      appointments: 'citas',
      ordenes_compra: 'ordenes compra',
      anulaciones_disponibilidad: 'anulaciones disponibilidad puerta',
    },

    // URL del Google Apps Script para operaciones de escritura
    // Despliega el script en google-apps-script.js y pega la URL aquí
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyZlTJaBS54vD63FZZi4fxxg17x2qty6H8s-sL1WzSkejPOegBBoH0ZTGOYUqwYAPE/exec',
  },

  // =====================================================
  // MYSQL / API REST
  // =====================================================
  mysql: {
    apiUrl: 'http://localhost:4000/api',
    apiKey: 'TU_API_KEY_AQUI',
  },

  // =====================================================
  // SUPABASE
  // =====================================================
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'TU_ANON_KEY_AQUI',
  },

  // =====================================================
  // EMAIL / NOTIFICACIONES
  // =====================================================
  email: {
    sendgridApiKey: 'TU_SENDGRID_API_KEY',
    fromEmail: 'noreply@tucedi.com',
    fromName: 'CEDI Pharma',
  }
}

/**
 * IMPORTANTE - OPERACIONES CRUD:
 * 
 * La API Key de Google Sheets SOLO permite LECTURA.
 * Para escribir datos (Crear, Actualizar, Eliminar) necesitas:
 * 
 * 1. Desplegar el Google Apps Script (google-apps-script.js) en tu cuenta
 * 2. Copiar la URL del despliegue y pegarla en appsScriptUrl arriba
 * 3. El script actuará como intermediario para las operaciones de escritura
 * 
 * Ver: google-apps-script.js en la raíz del proyecto
 */
