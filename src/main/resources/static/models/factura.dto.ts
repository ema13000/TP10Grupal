export interface FacturaDetalleRequestDTO {
    articuloId: number;
    cantidad: number;
    porcentajeBonificacion: number | null;
}

export interface FacturaRequestDTO {
    clienteId: number | null;
    condicionIvaId: number;
    tipoMonedaId: number;
    puntoVentaId: number;
    detalles: FacturaDetalleRequestDTO[];
}

export interface FacturaReporteDTO {
    id: number;
    numeroFactura: number;
    fechaEmision: string;
    clienteDenominacion: string;
    condicionIva: string;
    puntoVentaDescripcion: string;
    importeTotal: number;
    cantidadItems: number;
    estado: string;
    observaciones: string | null;
}

export interface FacturaFiltrosDTO {
    cliente?: string;
    estado?: string;
    numeroFactura?: string;
    condicionIva?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface FacturaEdicionDTO extends FacturaRequestDTO {
    numeroFactura: number;
}

export interface OpcionDTO {
    id: number;
    descripcion: string;
}
