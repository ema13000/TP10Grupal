package TP.SpringBootGrupal.controller;

import TP.SpringBootGrupal.dtos.Factura.FacturaReporteDTO;
import TP.SpringBootGrupal.dtos.Factura.FacturaRequestDTO;
import TP.SpringBootGrupal.service.FacturaServiceImpl;
import com.lowagie.text.DocumentException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "*")
public class FacturaRestController {

    private final FacturaServiceImpl service;

    public FacturaRestController(FacturaServiceImpl facturaServiceImpl) {
        this.service = facturaServiceImpl;
    }

    @PostMapping
    public ResponseEntity<FacturaReporteDTO> save(@Valid @RequestBody FacturaRequestDTO dto) {
        FacturaReporteDTO creada = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacturaReporteDTO> update(
            @PathVariable("id") Long id,
            @RequestBody FacturaRequestDTO dto,
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam("porcentajeIva") double porcentajeIva
    ) {
        FacturaReporteDTO actualizada =
                service.update(dto, id, usuarioId, porcentajeIva);

        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}