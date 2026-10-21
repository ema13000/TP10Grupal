package TP.SpringBootGrupal.service;

import TP.SpringBootGrupal.dtos.OpcionDTO;
import TP.SpringBootGrupal.repository.CondicionIvaRepository;
import TP.SpringBootGrupal.repository.PuntoVentaRepository;
import TP.SpringBootGrupal.repository.TipoMonedaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogoService {

    private final PuntoVentaRepository puntoVentaRepository;
    private final TipoMonedaRepository tipoMonedaRepository;
    private final CondicionIvaRepository condicionIvaRepository;

    public CatalogoService(
            PuntoVentaRepository puntoVentaRepository,
            TipoMonedaRepository tipoMonedaRepository,
            CondicionIvaRepository condicionIvaRepository
    ) {
        this.puntoVentaRepository = puntoVentaRepository;
        this.tipoMonedaRepository = tipoMonedaRepository;
        this.condicionIvaRepository = condicionIvaRepository;
    }

    @Transactional(readOnly = true)
    public List<OpcionDTO> obtenerPuntosVenta() {
        return puntoVentaRepository.findAll().stream()
                .map(punto -> new OpcionDTO(
                        punto.getId(),
                        punto.getNumero() + " - " + punto.getDescripcion()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OpcionDTO> obtenerTiposMoneda() {
        return tipoMonedaRepository.findAll().stream()
                .map(moneda -> new OpcionDTO(
                        moneda.getId(),
                        moneda.getDenominacion() + " (" + moneda.getSimbolo() + ")"
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OpcionDTO> obtenerCondicionesIva() {
        return condicionIvaRepository.findAll().stream()
                .map(condicion -> new OpcionDTO(
                        condicion.getId(), condicion.getDenominacion()
                ))
                .toList();
    }
}
