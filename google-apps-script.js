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
  'tipos vehiculo': 'tipos vehiculo',  // Alias directo
  docks: 'puertas',
  puertas: 'puertas',  // Alias directo
  horarios: 'horarios',
  dias_festivos: 'dias festivos',
  'dias festivos': 'dias festivos',  // Alias directo
  
  // Citas
  appointments: 'citas',
  ordenes_compra: 'ordenes compra',
  anulaciones_disponibilidad: 'anulaciones disponibilidad puerta',
};

/**
 * Mapeo de nombres de campos inglés → español
 * La app envía nombres en inglés, Google Sheets tiene columnas en español
 */
const FIELD_MAPPINGS = {
  // Campos globales
  'id': 'ID',
  'code': 'Código',
  'name': 'Nombre',
  'description': 'Descripción',
  'is_active': 'Activo',
  'created_at': 'Fecha Creación',
  'updated_at': 'Fecha Actualización',
  
  // Proveedores
  'legal_name': 'Razón Social',
  'tax_id': 'NIT',
  'address': 'Dirección',
  'city': 'Ciudad',
  'state': 'Estado',
  'country': 'País',
  'postal_code': 'Código Postal',
  'contact_name': 'Persona de Contacto',
  'contact_email': 'Email',
  'contact_phone': 'Teléfono',
  'payment_terms_days': 'Plazo de Pago',
  'notes': 'Notas',
  'main_buyer_id': 'ID Comprador Principal',
  'main_buyer_name': 'Nombre Comprador Principal',
  
  // Centros de distribución
  'timezone': 'Zona Horaria',
  'phone': 'Teléfono',
  'email': 'Email',
  
  // Puertas/Docks
  'distribution_center_id': 'ID centro distribucion',
  'type': 'Tipo',
  'capacity': 'Capacidad',
  'status': 'Estado',
  
  // Horarios
  'dock_id': 'Puerta',
  'day': 'Día',
  'start_time': 'Hora Inicio',
  'end_time': 'Hora Fin',
  'is_available': 'Disponible',
  
  // Días festivos
  'date': 'Fecha',
  'is_annual': 'Es Anual',
  'is_working_day': 'Es Día Laboral',
  
  // Tipos de vehículo
  'max_weight': 'Peso (ton)',
  
  // Catálogos generales
  'symbol': 'Símbolo',
  'percentage': 'Porcentaje',
  'abbreviation': 'Abreviatura',
  'level': 'Nivel',
  'parent_id': 'ID Padre',
};

/**
 * Mapeos específicos por hoja (cuando el campo tiene nombre diferente en esa hoja)
 */
const SHEET_SPECIFIC_MAPPINGS = {
  'puertas': {
    'code': 'Número de Puerta',
    'notes': 'Descripción',
  },
  'horarios': {
    'name': 'Nombre',
    'dock_id': 'Puerta',
    'day': 'Día',
    'start_time': 'Hora Inicio',
    'end_time': 'Hora Fin',
    'is_available': 'Disponible',
    'notes': 'Descripción',
  },
  'dias festivos': {
    'notes': 'Notas',
  },
  'tipos vehiculo': {
    'code': 'Código',
    'name': 'Nombre',
    'description': 'Descripción',
    'max_weight': 'Peso (ton)',
    'is_active': 'Activo',
  },
};

/**
 * Convierte un objeto con claves en inglés a claves en español
 */
function mapFieldsToSpanish(data) {
  const mapped = {};
  for (const key in data) {
    // Buscar el nombre en español, si no existe usar el original
    const spanishKey = FIELD_MAPPINGS[key] || key;
    mapped[spanishKey] = data[key];
  }
  return mapped;
}

/**
 * Busca un valor en el payload usando múltiples variaciones del nombre
 * @param {Object} data - El payload con los datos
 * @param {string} header - El nombre de la columna en Google Sheets
 * @param {string} sheetName - El nombre de la hoja (opcional, para mapeos específicos)
 */
function findValueInPayload(data, header, sheetName) {
  // Primero buscar coincidencia exacta
  if (data.hasOwnProperty(header)) {
    Logger.log('findValueInPayload: Encontrado exacto "' + header + '" = ' + data[header]);
    return { found: true, value: data[header] };
  }
  
  const headerLower = String(header).toLowerCase().trim();
  
  // Buscar en mapeos específicos de la hoja primero
  if (sheetName && SHEET_SPECIFIC_MAPPINGS[sheetName]) {
    const sheetMappings = SHEET_SPECIFIC_MAPPINGS[sheetName];
    for (const englishKey in sheetMappings) {
      const spanishColumn = sheetMappings[englishKey];
      if (spanishColumn.toLowerCase().trim() === headerLower) {
        if (data.hasOwnProperty(englishKey)) {
          Logger.log('findValueInPayload: Encontrado por mapeo específico "' + englishKey + '" → "' + header + '" = ' + data[englishKey]);
          return { found: true, value: data[englishKey] };
        }
      }
    }
  }
  
  // Buscar por el mapeo global inverso (español → inglés)
  for (const englishKey in FIELD_MAPPINGS) {
    const spanishColumn = FIELD_MAPPINGS[englishKey];
    if (spanishColumn.toLowerCase().trim() === headerLower) {
      if (data.hasOwnProperty(englishKey)) {
        Logger.log('findValueInPayload: Encontrado por mapeo global "' + englishKey + '" → "' + header + '" = ' + data[englishKey]);
        return { found: true, value: data[englishKey] };
      }
    }
  }
  
  // Buscar case-insensitive en las claves del payload
  for (const key in data) {
    if (key.toLowerCase().trim() === headerLower) {
      Logger.log('findValueInPayload: Encontrado case-insensitive "' + key + '" = ' + data[key]);
      return { found: true, value: data[key] };
    }
  }
  
  Logger.log('findValueInPayload: NO encontrado para header "' + header + '" en hoja "' + sheetName + '"');
  return { found: false, value: undefined };
}

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
      case 'sendEmail':
        result = sendEmail(payload);
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
    
    // Buscar el valor en el payload usando el helper (con nombre de hoja para mapeos específicos)
    const result = findValueInPayload(data, header, sheetName);
    
    if (!result.found || result.value === undefined || result.value === null) return '';
    if (typeof result.value === 'boolean') return result.value ? 'TRUE' : 'FALSE';
    return result.value;
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
  Logger.log('========== UPDATE ROW ==========');
  Logger.log('Hoja: ' + sheetName);
  Logger.log('ID a buscar: ' + id);
  Logger.log('Datos recibidos: ' + JSON.stringify(data));
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('ERROR: Hoja no encontrada: ' + sheetName);
    return { success: false, error: `Hoja no encontrada: ${sheetName}` };
  }
  
  // Obtener headers y datos
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const allData = sheet.getDataRange().getValues();
  
  Logger.log('Headers encontrados: ' + JSON.stringify(headers));
  Logger.log('Total filas: ' + allData.length);
  
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
  Logger.log('Buscando ID "' + id + '" en columna ' + idColIndex);
  for (let i = 1; i < allData.length; i++) {
    const cellValue = String(allData[i][idColIndex]);
    Logger.log('Fila ' + (i+1) + ': ID = "' + cellValue + '"');
    if (cellValue === String(id)) {
      rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
      Logger.log('¡Encontrado en fila ' + rowIndex + '!');
      break;
    }
  }
  
  if (rowIndex === -1) {
    Logger.log('ERROR: Registro no encontrado con id: ' + id);
    return { success: false, error: `Registro no encontrado con id: ${id}` };
  }
  
  // Actualizar timestamp
  data.updated_at = new Date().toISOString();
  
  // Log para debug
  Logger.log('=== UPDATE DEBUG ===');
  Logger.log('SheetName: ' + sheetName);
  Logger.log('Headers: ' + JSON.stringify(headers));
  Logger.log('Data recibida: ' + JSON.stringify(data));
  Logger.log('SHEET_SPECIFIC_MAPPINGS para esta hoja: ' + JSON.stringify(SHEET_SPECIFIC_MAPPINGS[sheetName]));
  
  // Actualizar valores
  let updatedFields = [];
  headers.forEach((header, colIndex) => {
    const headerLower = String(header).toLowerCase();
    
    // Saltar columnas de ID y created_at
    if (headerLower === 'id' || headerLower === 'created_at') {
      return;
    }
    
    // Buscar el valor en el payload usando múltiples variaciones (con nombre de hoja)
    const result = findValueInPayload(data, header, sheetName);
    
    if (result.found) {
      let value = result.value;
      if (typeof value === 'boolean') value = value ? 'TRUE' : 'FALSE';
      if (value === undefined || value === null) value = '';
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
      updatedFields.push(header);
    }
  });
  
  Logger.log('Campos actualizados: ' + JSON.stringify(updatedFields));
  Logger.log('========== FIN UPDATE ROW ==========');
  
  return { 
    success: true, 
    message: 'Registro actualizado',
    id: id,
    updatedFields: updatedFields,
    sheetName: sheetName,
    rowIndex: rowIndex
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
 * Envía un correo electrónico usando Gmail
 * Requiere autorización de Gmail la primera vez
 */
function sendEmail(payload) {
  try {
    const { to, subject, body, html } = payload;
    
    if (!to || !subject) {
      return { 
        success: false, 
        error: 'Faltan parámetros: to y subject son requeridos' 
      };
    }
    
    // Opciones del email
    const options = {};
    if (html) {
      options.htmlBody = html;
    }
    
    // Enviar el correo
    GmailApp.sendEmail(to, subject, body || '', options);
    
    return { 
      success: true, 
      message: 'Email enviado correctamente',
      to: to,
      subject: subject
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Función de prueba para envío de correo
 * Ejecuta esta función desde el editor para autorizar Gmail
 */
function testSendEmail() {
  const result = sendEmail({
    to: 'tu-email@ejemplo.com', // Cambia por tu email para probar
    subject: 'Prueba CEDI - Envío de correo',
    body: 'Este es un correo de prueba del sistema CEDI.',
    html: '<h1>Prueba CEDI</h1><p>Este es un correo de prueba del sistema CEDI.</p>'
  });
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Función de prueba - puedes ejecutarla desde el editor de Apps Script
 */
function testAPI() {
  // Prueba de lectura
  const result = getAllRows('productos');
  Logger.log(JSON.stringify(result, null, 2));
}

