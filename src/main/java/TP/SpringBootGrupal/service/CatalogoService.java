package TP.SpringBootGrupal.service;

import TP.SpringBootGrupal.dtos.OpcionDTO;
import TP.SpringBootGrupal.dtos.ClienteExplorerDTO;
import TP.SpringBootGrupal.dtos.PrecioArticuloExplorerDTO;
import TP.SpringBootGrupal.repository.ClienteRepository;
import TP.SpringBootGrupal.repository.ListaPrecioArticuloRepository;
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
    private final ClienteRepository clienteRepository;
    private final ListaPrecioArticuloRepository listaPrecioArticuloRepository;

    public CatalogoService(
            PuntoVentaRepository puntoVentaRepository,
            TipoMonedaRepository tipoMonedaRepository,
            CondicionIvaRepository condicionIvaRepository,
            ClienteRepository clienteRepository,
            ListaPrecioArticuloRepository listaPrecioArticuloRepository
    ) {
        this.puntoVentaRepository = puntoVentaRepository;
        this.tipoMonedaRepository = tipoMonedaRepository;
        this.condicionIvaRepository = condicionIvaRepository;
        this.clienteRepository = clienteRepository;
        this.listaPrecioArticuloRepository = listaPrecioArticuloRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteExplorerDTO> obtenerClientes() {
        return clienteRepository.findAll().stream()
                .filter(cliente -> cliente.getFechaBaja() == null)
                .map(cliente -> new ClienteExplorerDTO(
                        cliente.getId(), cliente.getCuitCuil(), cliente.getDenominacion()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrecioArticuloExplorerDTO> obtenerPreciosArticulos() {
        return listaPrecioArticuloRepository.findAll().stream()
                .filter(precio -> precio.getFechaBaja() == null
                        && precio.getArticulo().getFechaBaja() == null
                        && precio.getListaPrecio().getFechaBaja() == null)
                .map(precio -> new PrecioArticuloExplorerDTO(
                        precio.getId(), precio.getArticulo().getCodigo(),
                        precio.getArticulo().getDenominacion(),
                        precio.getListaPrecio().getDenominacion(), precio.getPrecioVenta()))
                .toList();
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
