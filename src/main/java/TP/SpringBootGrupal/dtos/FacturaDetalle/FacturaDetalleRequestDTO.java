package TP.SpringBootGrupal.dtos.FacturaDetalle;

public record FacturaDetalleRequestDTO (
    Long listaPrecioArticuloId,
    Double cantidad,
    Double porcentajeBonificacion
){

}

