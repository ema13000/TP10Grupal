package TP.SpringBootGrupal.controller;

import TP.SpringBootGrupal.dtos.Factura.FacturaReporteDTO;
import TP.SpringBootGrupal.service.FacturaServiceImpl;
import com.lowagie.text.DocumentException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/facturas")
public class FacturaRestController {

    private final FacturaServiceImpl facturaServiceImpl;

    public FacturaRestController(FacturaServiceImpl facturaServiceImpl) {
        this.facturaServiceImpl = facturaServiceImpl;
    }

    @GetMapping
    public List<FacturaReporteDTO> listar(
            @RequestParam(name = "fechaDesde", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            Date fechaDesde,

            @RequestParam(name = "fechaHasta", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            Date fechaHasta,

            @RequestParam(name = "estado", required = false)
            String estado,

            @RequestParam(name = "montoMinimo", required = false)
            Double montoMinimo
    ) {
        return facturaServiceImpl.buscarFacturasFiltradas(
                fechaDesde, fechaHasta, estado, montoMinimo
        );
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> descargarPdf(
            @RequestParam(name = "fechaDesde", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            Date fechaDesde,

            @RequestParam(name = "fechaHasta", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            Date fechaHasta,

            @RequestParam(name = "estado", required = false)
            String estado,

            @RequestParam(name = "montoMinimo", required = false)
            Double montoMinimo
    ) throws DocumentException {

        List<FacturaReporteDTO> facturas =
                facturaServiceImpl.buscarFacturasFiltradas(
                        fechaDesde, fechaHasta, estado, montoMinimo
                );

        byte[] archivo = facturaServiceImpl.generarPdf(facturas);

        return descargar(
                archivo,
                "reporte-facturas.pdf",
                MediaType.APPLICATION_PDF
        );
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> descargarExcel(
            @RequestParam(name = "fechaDesde", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            Date fechaDesde,

            @RequestParam(name = "fechaHasta", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            Date fechaHasta,

            @RequestParam(name = "estado", required = false)
            String estado,

            @RequestParam(name = "montoMinimo", required = false)
            Double montoMinimo
    ) throws IOException {

        List<FacturaReporteDTO> facturas =
                facturaServiceImpl.buscarFacturasFiltradas(
                        fechaDesde, fechaHasta, estado, montoMinimo
                );

        byte[] archivo = facturaServiceImpl.generarExcel(facturas);

        return descargar(
                archivo,
                "reporte-facturas.txt",
                MediaType.parseMediaType("text/plain;charset=UTF-8")
        );
    }

    private ResponseEntity<byte[]> descargar(
            byte[] archivo,
            String nombre,
            MediaType tipo
    ) {
        return ResponseEntity.ok()
                .contentType(tipo)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(nombre)
                                .build()
                                .toString()
                )
                .contentLength(archivo.length)
                .body(archivo);
    }
}