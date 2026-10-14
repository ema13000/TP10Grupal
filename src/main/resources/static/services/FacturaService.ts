import {
    FacturaFiltrosDTO,
    FacturaReporteDTO,
    FacturaRequestDTO
} from '../models/factura.dto.js';

export class FacturaService {
    private readonly baseUrl: string = 'http://localhost:8080/api/facturas';

    async obtenerFacturas(filtros?: FacturaFiltrosDTO): Promise<FacturaReporteDTO[]> {
        const params = new URLSearchParams();
        if (filtros?.cliente) params.append('cliente', filtros.cliente);
        if (filtros?.estado) params.append('estado', filtros.estado);
        if (filtros?.numeroComprobante) params.append('numeroComprobante', filtros.numeroComprobante);
        if (filtros?.condicionIva) params.append('condicionIva', filtros.condicionIva);
        if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
        if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);

        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${this.baseUrl}${query}`);

        if (!response.ok) {
            throw new Error(`Error al obtener facturas: ${response.status}`);
        }
        return await response.json();
    }

    async crearFactura(factura: FacturaRequestDTO): Promise<FacturaReporteDTO> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(factura)
        });

        if (!response.ok) {
            throw new Error(`Error al crear la factura: ${response.status}`);
        }
        return await response.json();
    }

    async actualizarEstado(id: number, estado: string, observaciones?: string): Promise<FacturaReporteDTO> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado, observaciones })
        });

        if (!response.ok) {
            throw new Error(`Error al actualizar estado: ${response.status}`);
        }
        return await response.json();
    }

    async eliminarFactura(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar la factura: ${response.status}`);
        }
    }
}