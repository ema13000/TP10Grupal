package TP.SpringBootGrupal.controller;

import TP.SpringBootGrupal.dtos.OpcionDTO;
import TP.SpringBootGrupal.service.CatalogoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
@CrossOrigin(origins = "*")
public class CatalogoRestController {

    private final CatalogoService service;

    public CatalogoRestController(CatalogoService service) {
        this.service = service;
    }

    @GetMapping("/puntos-venta")
    public List<OpcionDTO> obtenerPuntosVenta() {
        return service.obtenerPuntosVenta();
    }

    @GetMapping("/tipos-moneda")
    public List<OpcionDTO> obtenerTiposMoneda() {
        return service.obtenerTiposMoneda();
    }

    @GetMapping("/condiciones-iva")
    public List<OpcionDTO> obtenerCondicionesIva() {
        return service.obtenerCondicionesIva();
    }
}
