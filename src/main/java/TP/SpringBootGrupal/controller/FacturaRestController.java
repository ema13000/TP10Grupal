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


}