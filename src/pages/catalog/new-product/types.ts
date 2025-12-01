// Tipos para el wizard de creación de productos

export interface SolicitanteData {
  nombreRazonSocial: string
  nombreSolicitante: string
  nombreLaboratorio: string
  telefono: string
  fecha: string
  correoElectronico: string
  compradorId: string
}

export interface DatosGeneralesData {
  nombreProducto: string
  caracteristicas: string
  formaFarmaceuticaId: string
  cantidad: number
  pesoTamanoMedidaId: string
  empaqueId: string
  tallaCapacidad: string
  calibreGrosorDiametro: string
  ofertaPromoDescripcion: string
}

export interface PrincipioActivoItem {
  principioActivoId: string
  concentracion: string
  unidadMedidaId: string
  ml: string
}

export interface IngredientesActivosData {
  principiosActivos: PrincipioActivoItem[]
}

export interface InformacionAdicionalData {
  vencimientoRegistroSanitario: string
  numeroRegistroSanitario: string
  codigoBarras: string
  productoControlado: string
  productoRefrigerado: string
  productoUsoHospitalario: string
  requiereReceta: string
  usoCronico: string
  // Canales de comercialización
  farmaciasPropias: boolean
  farmaciasIndependientes: boolean
  institucionalHospitalario: boolean
  ruteo: boolean
  mayoreo: boolean
  autoservicio: boolean
  // Clasificación y tipo
  clasificacionId: string
  tipoImpuestoId: string
  nivel1Id: string
  nivel2Id: string
  nivel3Id: string
  nivel4Id: string
}

export interface BonificacionItem {
  base: string
  cantidad: string
  costo: number
}

export interface DatosCompraData {
  // Datos de compra
  precioCompraConIva: number
  precioCompraSinIva: number
  tipoMonedaId: string
  costoBofasa: number
  margenCostoBofasa: number
  // Precios de venta
  precioListaConIva: number
  margenPrecioLista: number
  precioPublicoConIva: number
  margenPrecioPublico: number
  precioMayoristaConIva: number
  margenPrecioMayorista: number
  precioHospitalarioConIva: number
  margenPrecioHospitalario: number
  // Descuentos y bonos
  descuentoPorcentaje: number
  descuentoProntoPagoPorcentaje: number
  diasProntoPago: number
  traeBono: string
  valorBono: string
  seCreaCodHijo: string
  // Bonificaciones
  bonificaciones: BonificacionItem[]
}

export interface DatosLogisticosData {
  // Dimensiones del artículo
  largoArticulo: number
  anchoArticulo: number
  altoArticulo: number
  volumenArticulo: number
  pesoArticulo: number
  // Dimensiones del fardo
  largoFardo: number
  anchoFardo: number
  altoFardo: number
  pesoFardo: number
  volumenFardo: number
  unidadesPorFardo: number
  codigoBarrasFardo: string
  // Datos de paletizado
  fardosPorCama: number
  camasPorPallet: number
  // Condiciones de almacenamiento
  temperaturaMinima: number
  temperaturaMaxima: number
  manejoPorLotes: string
}

export interface DocumentoItem {
  id: string
  nombre: string
  tipo: string
  archivo?: File
  url?: string
}

export interface RequerimientosDigitalesData {
  documentos: DocumentoItem[]
}

export interface ProductWizardData {
  // Step 1
  solicitante: SolicitanteData
  // Step 2
  datosGenerales: DatosGeneralesData
  // Step 3
  ingredientesActivos: IngredientesActivosData
  // Step 4
  informacionAdicional: InformacionAdicionalData
  // Step 5
  datosCompra: DatosCompraData
  // Step 6
  datosLogisticos: DatosLogisticosData
  // Step 7
  requerimientosDigitales: RequerimientosDigitalesData
  // Metadata
  nombreGenerado: string
  esBorrador: boolean
}

export const WIZARD_STEPS = [
  { id: 1, title: "Información del solicitante", shortTitle: "Solicitante" },
  { id: 2, title: "Datos generales", shortTitle: "Generales" },
  { id: 3, title: "Ingredientes activos", shortTitle: "Ingredientes" },
  { id: 4, title: "Información adicional", shortTitle: "Adicional" },
  { id: 5, title: "Datos de compra", shortTitle: "Compra" },
  { id: 6, title: "Datos logísticos", shortTitle: "Logísticos" },
  { id: 7, title: "Requerimientos digitales", shortTitle: "Documentos" },
] as const

export const initialProductData: ProductWizardData = {
  solicitante: {
    nombreRazonSocial: "",
    nombreSolicitante: "",
    nombreLaboratorio: "",
    telefono: "",
    fecha: new Date().toISOString().split("T")[0],
    correoElectronico: "",
    compradorId: "",
  },
  datosGenerales: {
    nombreProducto: "",
    caracteristicas: "",
    formaFarmaceuticaId: "",
    cantidad: 0,
    pesoTamanoMedidaId: "",
    empaqueId: "",
    tallaCapacidad: "",
    calibreGrosorDiametro: "",
    ofertaPromoDescripcion: "",
  },
  ingredientesActivos: {
    principiosActivos: [],
  },
  informacionAdicional: {
    vencimientoRegistroSanitario: "",
    numeroRegistroSanitario: "",
    codigoBarras: "",
    productoControlado: "",
    productoRefrigerado: "",
    productoUsoHospitalario: "",
    requiereReceta: "",
    usoCronico: "",
    farmaciasPropias: false,
    farmaciasIndependientes: false,
    institucionalHospitalario: false,
    ruteo: false,
    mayoreo: false,
    autoservicio: false,
    clasificacionId: "",
    tipoImpuestoId: "",
    nivel1Id: "",
    nivel2Id: "",
    nivel3Id: "",
    nivel4Id: "",
  },
  datosCompra: {
    precioCompraConIva: 0,
    precioCompraSinIva: 0,
    tipoMonedaId: "",
    costoBofasa: 0,
    margenCostoBofasa: 0,
    precioListaConIva: 0,
    margenPrecioLista: 0,
    precioPublicoConIva: 0,
    margenPrecioPublico: 0,
    precioMayoristaConIva: 0,
    margenPrecioMayorista: 0,
    precioHospitalarioConIva: 0,
    margenPrecioHospitalario: 0,
    descuentoPorcentaje: 0,
    descuentoProntoPagoPorcentaje: 0,
    diasProntoPago: 0,
    traeBono: "No",
    valorBono: "",
    seCreaCodHijo: "No",
    bonificaciones: [{ base: "Base", cantidad: "", costo: 0 }],
  },
  datosLogisticos: {
    largoArticulo: 1,
    anchoArticulo: 1,
    altoArticulo: 1,
    volumenArticulo: 0,
    pesoArticulo: 1,
    largoFardo: 1,
    anchoFardo: 1,
    altoFardo: 1,
    pesoFardo: 1,
    volumenFardo: 0,
    unidadesPorFardo: 1,
    codigoBarrasFardo: "",
    fardosPorCama: 1,
    camasPorPallet: 1,
    temperaturaMinima: 15,
    temperaturaMaxima: 25,
    manejoPorLotes: "Sí",
  },
  requerimientosDigitales: {
    documentos: [],
  },
  nombreGenerado: "",
  esBorrador: true,
}

