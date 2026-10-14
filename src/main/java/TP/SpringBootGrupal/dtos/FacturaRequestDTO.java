package TP.SpringBootGrupal.dtos;

import java.util.List;

public record FacturaRequestDTO(
        Long clienteId,
        Long condicionIvaId,
        Long tipoMonedaId,
        Long puntoVentaId,
        List<FacturaDetalleRequestDTO> detalles) {
}
