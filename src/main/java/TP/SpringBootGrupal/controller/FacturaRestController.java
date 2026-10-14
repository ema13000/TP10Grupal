package TP.SpringBootGrupal.controller;

import TP.SpringBootGrupal.dtos.Factura.FacturaEstadoRequestDTO;
import TP.SpringBootGrupal.dtos.Factura.FacturaReporteDTO;
import TP.SpringBootGrupal.dtos.Factura.FacturaRequestDTO;
import TP.SpringBootGrupal.service.FacturaServiceImpl;
import com.lowagie.text.DocumentException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping
    public ResponseEntity<List<FacturaReporteDTO>> findAll() {
        return ResponseEntity.ok(service.findAllParaListado());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<FacturaReporteDTO> actualizarEstado(
            @PathVariable("id") Long id,
            @RequestParam("usuarioId") Long usuarioId,
            @RequestBody FacturaEstadoRequestDTO dto
    ) {
        if (!"ANULADA".equals(dto.estado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Esta operación solo permite anular facturas"
            );
        }

        return ResponseEntity.ok(
                service.anular(id, usuarioId, dto.observaciones())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaReporteDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<FacturaReporteDTO> save(
            @RequestBody FacturaRequestDTO dto,
            @RequestParam("numero") Long numero,
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam("porcentajeIva") double porcentajeIva
    ) {
        FacturaReporteDTO creada = service.save(dto, numero, usuarioId, porcentajeIva);

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
    public ResponseEntity<Void> delete(
            @PathVariable("id") Long id,
            @RequestParam("usuarioId") Long usuarioId
    ) {
        service.delete(id, usuarioId);

        return ResponseEntity.noContent().build();
    }
}