/**
 * ===============================================
 * GOOGLE APPS SCRIPT - CEDI API
 * ===============================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones → Apps Script
 * 3. Borra el código existente y pega TODO este archivo
 * 4. Guarda el proyecto (Ctrl+S) con el nombre "CEDI API"
 * 5. Click en "Implementar" → "Nueva implementación"
 * 6. Selecciona tipo: "Aplicación web"
 * 7. Configuración:
 *    - Descripción: "CEDI API v1"
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier persona"
 * 8. Click en "Implementar"
 * 9. Copia la URL de la aplicación web
 * 10. Pega la URL en src/config/database.config.ts → googleSheets.webAppUrl
 * 
 * ===============================================
 */

// Configuración de nombres de hojas (debe coincidir EXACTAMENTE con tu spreadsheet)
const SHEET_NAMES = {
  // Usuarios y Seguridad
  users: 'usuarios',
  audit_logs: 'audit_logs',
  
  // Catálogos
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
};

/**
 * Maneja peticiones GET (para pruebas)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'CEDI API funcionando correctamente',
      timestamp: new Date().toISOString(),
      availableSheets: Object.keys(SHEET_NAMES)
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Maneja peticiones POST (operaciones CRUD)
 */
function doPost(e) {
  try {
    // Manejar tanto JSON directo como FormData
    let data;
    
    if (e.parameter && e.parameter.data) {
      // Viene como FormData
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      // Viene como JSON directo
      data = JSON.parse(e.postData.contents);
    } else {
      return jsonResponse({ 
        success: false, 
        error: 'No se recibieron datos' 
      });
    }
    
    const { action, entity, payload, id } = data;
    
    // Validar datos
    if (!action || !entity) {
      return jsonResponse({ 
        success: false, 
        error: 'Faltan parámetros: action y entity son requeridos' 
      });
    }
    
    // Obtener nombre de la hoja
    // Acepta tanto el nombre de la entidad (ej: "appointments") como el nombre directo de la hoja (ej: "citas")
    let sheetName = SHEET_NAMES[entity];
    if (!sheetName) {
      // Intentar usar el entity directamente como nombre de hoja
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const directSheet = ss.getSheetByName(entity);
      if (directSheet) {
        sheetName = entity;
      } else {
        return jsonResponse({ 
          success: false, 
          error: `Entidad no válida: ${entity}. Hojas disponibles: ${ss.getSheets().map(s => s.getName()).join(', ')}` 
        });
      }
    }
    
    // Ejecutar acción
    let result;
    switch (action) {
      case 'create':
        result = createRow(sheetName, payload);
        break;
      case 'update':
        result = updateRow(sheetName, id, payload);
        break;
      case 'delete':
        result = deleteRow(sheetName, id);
        break;
      case 'getAll':
        result = getAllRows(sheetName);
        break;
      default:
        return jsonResponse({ 
          success: false, 
          error: `Acción no válida: ${action}` 
        });
    }
    
    return jsonResponse(result);
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: error.toString() 
    });
  }
}

/**
 * Crea una nueva fila en la hoja
 */
function createRow(sheetName, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return { success: false, error: `Hoja no encontrada: ${sheetName}` };
  }
  
  // Obtener headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Generar ID único
  const generatedId = generateId();
  
  // Agregar timestamps
  const now = new Date().toISOString();
  
  // Crear fila con valores en el orden correcto
  const rowValues = headers.map(header => {
    const headerLower = String(header).toLowerCase();
    
    // Manejar columna ID (puede ser "ID", "id", "Id")
    if (headerLower === 'id') {
      return data.id || data.ID || data.Id || generatedId;
    }
    
    // Manejar timestamps
    if (headerLower === 'created_at' || headerLower === 'createdat') {
      return data.created_at || data.createdAt || now;
    }
    if (headerLower === 'updated_at' || headerLower === 'updatedat') {
      return now;
    }
    
    // Buscar el valor en el payload (case-insensitive y con variaciones)
    let value = data[header];
    
    // Si no se encuentra, intentar buscar con diferentes variaciones del nombre
    if (value === undefined) {
      // Buscar coincidencia exacta primero
      for (const key in data) {
        if (key.toLowerCase() === headerLower) {
          value = data[key];
          break;
        }
      }
    }
    
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return value;
  });
  
  // Agregar fila al final
  sheet.appendRow(rowValues);
  
  // Preparar datos de respuesta con el ID generado
  const responseData = { ...data };
  responseData.id = generatedId;
  responseData.created_at = now;
  responseData.updated_at = now;
  
  return { 
    success: true, 
    message: 'Registro creado',
    id: generatedId,
    data: responseData
  };
}

/**
 * Actualiza una fila existente
 */
function updateRow(sheetName, id, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return { success: false, error: `Hoja no encontrada: ${sheetName}` };
  }
  
  // Obtener headers y datos
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  
  // Encontrar columna de ID (buscar 'id', 'ID', 'Id', etc.)
  let idColIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase() === 'id') {
      idColIndex = i;
      break;
    }
  }
  if (idColIndex === -1) {
    return { success: false, error: 'Columna "ID" no encontrada en la hoja' };
  }
  
  // Buscar fila por ID
  let rowIndex = -1;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idColIndex]) === String(id)) {
      rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, error: `Registro no encontrado con id: ${id}` };
  }
  
  // Actualizar timestamp
  data.updated_at = new Date().toISOString();
  
  // Actualizar valores
  headers.forEach((header, colIndex) => {
    if (data.hasOwnProperty(header) && header !== 'id' && header !== 'created_at') {
      let value = data[header];
      if (typeof value === 'boolean') value = value ? 'TRUE' : 'FALSE';
      if (value === undefined || value === null) value = '';
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
    }
  });
  
  return { 
    success: true, 
    message: 'Registro actualizado',
    id: id
  };
}

/**
 * Elimina una fila
 */
function deleteRow(sheetName, id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return { success: false, error: `Hoja no encontrada: ${sheetName}` };
  }
  
  // Obtener headers y datos
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  
  // Encontrar columna de ID (buscar 'id', 'ID', 'Id', etc.)
  let idColIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase() === 'id') {
      idColIndex = i;
      break;
    }
  }
  if (idColIndex === -1) {
    return { success: false, error: 'Columna "ID" no encontrada en la hoja' };
  }
  
  // Buscar fila por ID
  let rowIndex = -1;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idColIndex]) === String(id)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, error: `Registro no encontrado con id: ${id}` };
  }
  
  // Eliminar fila
  sheet.deleteRow(rowIndex);
  
  return { 
    success: true, 
    message: 'Registro eliminado',
    id: id
  };
}

/**
 * Obtiene todos los registros de una hoja
 */
function getAllRows(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    return { success: false, error: `Hoja no encontrada: ${sheetName}` };
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return { success: true, data: [], count: 0 };
  }
  
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Convertir TRUE/FALSE a booleanos
      if (value === 'TRUE' || value === true) value = true;
      else if (value === 'FALSE' || value === false) value = false;
      obj[header] = value;
    });
    return obj;
  });
  
  return { 
    success: true, 
    data: rows,
    count: rows.length
  };
}

/**
 * Genera un ID único
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Crea respuesta JSON con CORS headers
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba - puedes ejecutarla desde el editor de Apps Script
 */
function testAPI() {
  // Prueba de lectura
  const result = getAllRows('productos');
  Logger.log(JSON.stringify(result, null, 2));
}

