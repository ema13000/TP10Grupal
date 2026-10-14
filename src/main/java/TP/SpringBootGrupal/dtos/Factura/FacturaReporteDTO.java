package TP.SpringBootGrupal.dtos.Factura;

import TP.SpringBootGrupal.entities.FacturaVenta;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FacturaReporteDTO {
    Long numeroFactura;
    Date fechaEmision;
    String clienteDenominacion;
    String condicionIva;
    String puntoVentaDescripcion;
    double importeTotal;
    long cantidadItems;

    public static FacturaReporteDTO toDTO(FacturaVenta factura) {
        String cliente = factura.getCliente() == null
                ? "Consumidor Final"
                : factura.getCliente().getDenominacion();

        return new FacturaReporteDTO(
                factura.getNumero(),
                factura.getFechaEmision(),
                cliente,
                factura.getCondicionIva().getDenominacion(),
                factura.getPuntoVenta().getDescripcion(),
                factura.getImporteTotal(),
                factura.getDetalles().size()
        );
    }
}

