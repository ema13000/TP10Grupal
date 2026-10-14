package TP.SpringBootGrupal.dtos.FacturaDetalle;

public record FacturaDetalleRequestDTO (
    Long articuloId,
    Double cantidad,
    Double porcentajeBonificacion
){

}

