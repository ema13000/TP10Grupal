package TP.SpringBootGrupal.dtos.Factura;

import TP.SpringBootGrupal.dtos.FacturaDetalle.FacturaDetalleRequestDTO;
import TP.SpringBootGrupal.entities.FacturaVenta;

import java.util.List;

public record FacturaRequestDTO(
        Long clienteId,
        Long condicionIvaId,
        Long tipoMonedaId,
        Long puntoVentaId,
        List<FacturaDetalleRequestDTO> detalles
) {
}