package TP.SpringBootGrupal.service;

import TP.SpringBootGrupal.dtos.Factura.FacturaReporteDTO;
import TP.SpringBootGrupal.repository.FacturaVentaRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class FacturaServiceImpl implements FacturaService {

    private final FacturaVentaRepository facturaVentaRepository;

    @PersistenceContext
    private EntityManager em;

    private static final String[] CABECERAS = {
            "Factura", "Fecha", "Cliente", "Condición IVA",
            "Punto de venta", "Importe total", "Cantidad de ítems"
    };

    public FacturaServiceImpl(FacturaVentaRepository facturaVentaRepository) {
        this.facturaVentaRepository = facturaVentaRepository;
    }

    @Transactional(readOnly = true)
    public List<FacturaReporteDTO> buscarFacturasFiltradas(
            Date fechaDesde,
            Date fechaHasta,
            String estado,
            Double montoMinimo
    ) {
        StringBuilder jpql = new StringBuilder("""
                SELECT new TP.SpringBootGrupal.dtos.FacturaReporteDTO(
                    f.numero,
                    f.fechaEmision,
                    COALESCE(c.denominacion, 'Consumidor Final'),
                    ci.denominacion,
                    pv.descripcion,
                    f.importeTotal,
                    COUNT(d)
                )
                FROM FacturaVenta f
                LEFT JOIN f.cliente c
                JOIN f.condicionIva ci
                JOIN f.puntoVenta pv
                JOIN f.detalles d
                WHERE 1 = 1
                """);

        Map<String, Object> parametros = new HashMap<>();

        if (fechaDesde != null) {
            jpql.append(" AND f.fechaEmision >= :fechaDesde");
            parametros.put("fechaDesde", fechaDesde);
        }

        if (fechaHasta != null) {
            jpql.append(" AND f.fechaEmision <= :fechaHasta");
            parametros.put("fechaHasta", fechaHasta);
        }

        if (estado != null && !estado.isBlank()) {
            jpql.append(" AND f.estado = :estado");
            parametros.put("estado", estado.trim());
        }

        if (montoMinimo != null) {
            jpql.append(" AND f.importeTotal >= :montoMinimo");
            parametros.put("montoMinimo", montoMinimo);
        }

        jpql.append("""
                 GROUP BY f.id, f.numero, f.fechaEmision,
                    c.denominacion, ci.denominacion,
                    pv.descripcion, f.importeTotal
                 ORDER BY f.numero
                """);

        TypedQuery<FacturaReporteDTO> consulta =
                em.createQuery(jpql.toString(), FacturaReporteDTO.class);

        parametros.forEach(consulta::setParameter);

        return consulta.getResultList();
    }

    public byte[] generarPdf(List<FacturaReporteDTO> facturas)
            throws DocumentException {

        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        Document documento = new Document(PageSize.A4.rotate());

        PdfWriter.getInstance(documento, salida);
        documento.open();

        try {
            documento.add(new Paragraph("Reporte de facturas"));
            documento.add(new Paragraph(" "));

            PdfPTable tabla = new PdfPTable(CABECERAS.length);
            tabla.setWidthPercentage(100);

            for (String cabecera : CABECERAS) {
                tabla.addCell(cabecera);
            }

            tabla.setHeaderRows(1);

            SimpleDateFormat formatoFecha =
                    new SimpleDateFormat("yyyy-MM-dd");

            for (FacturaReporteDTO factura : facturas) {
                tabla.addCell(texto(factura.getNumeroFactura()));

                tabla.addCell(
                        factura.getFechaEmision() == null
                                ? ""
                                : formatoFecha.format(factura.getFechaEmision())
                );

                tabla.addCell(texto(factura.getClienteDenominacion()));
                tabla.addCell(texto(factura.getCondicionIva()));
                tabla.addCell(texto(factura.getPuntoVentaDescripcion()));

                tabla.addCell(String.format(
                        Locale.forLanguageTag("es-AR"),
                        "%.2f",
                        factura.getImporteTotal()
                ));

                tabla.addCell(
                        String.valueOf(factura.getCantidadItems())
                );
            }

            documento.add(tabla);

            if (facturas.isEmpty()) {
                documento.add(
                        new Paragraph("No se encontraron facturas.")
                );
            }
        } finally {
            documento.close();
        }

        return salida.toByteArray();
    }

    public byte[] generarExcel(List<FacturaReporteDTO> facturas) {
        StringBuilder contenido = new StringBuilder();

        // Primera fila: nombres de las columnas.
        contenido.append(String.join("\t", CABECERAS))
                .append("\r\n");

        SimpleDateFormat formatoFecha =
                new SimpleDateFormat("yyyy-MM-dd");

        // Una fila por factura.
        for (FacturaReporteDTO factura : facturas) {
            String fecha = factura.getFechaEmision() == null
                    ? ""
                    : formatoFecha.format(factura.getFechaEmision());

            contenido.append(textoCelda(factura.getNumeroFactura()))
                    .append("\t")
                    .append(fecha)
                    .append("\t")
                    .append(textoCelda(factura.getClienteDenominacion()))
                    .append("\t")
                    .append(textoCelda(factura.getCondicionIva()))
                    .append("\t")
                    .append(textoCelda(factura.getPuntoVentaDescripcion()))
                    .append("\t")
                    .append(String.format(
                            Locale.forLanguageTag("es-AR"),
                            "%.2f",
                            factura.getImporteTotal()
                    ))
                    .append("\t")
                    .append(factura.getCantidadItems())
                    .append("\r\n");
        }

        return contenido.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String textoCelda(Object valor) {
        return texto(valor)
                .replace('\t', ' ')
                .replace('\r', ' ')
                .replace('\n', ' ');
    }

    private static String texto(Object valor) {
        return valor == null ? "" : valor.toString();
    }
}