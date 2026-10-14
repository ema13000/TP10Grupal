export interface FacturaDetalleRequestDTO {
    articuloId: number;
    cantidad: number;
    precioUnitario: number;
    porcentajeIva?: number;
}

export interface FacturaRequestDTO {
    numeroComprobante: string;
    fechaEmision?: string;
    clienteId: number;
    condicionIvaId: number;
    puntoVentaId: number;
    tipoMonedaId: number;
    estado?: string;
    observaciones?: string;
    detalles: FacturaDetalleRequestDTO[];
}

export interface FacturaReporteDTO {
    id: number;
    numeroComprobante: string;
    fechaEmision: string;
    clienteNombre: string;
    condicionIva: string;
    puntoVenta: string;
    moneda: string;
    importeNeto: number;
    importeIva: number;
    importeTotal: number;
    estado: string;
    observaciones?: string;
}

export interface FacturaFiltrosDTO {
    cliente?: string;
    estado?: string;
    numeroComprobante?: string;
    condicionIva?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}