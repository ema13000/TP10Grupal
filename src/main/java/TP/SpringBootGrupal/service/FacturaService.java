package TP.SpringBootGrupal.service;

import TP.SpringBootGrupal.dtos.Factura.FacturaReporteDTO;
import TP.SpringBootGrupal.dtos.Factura.FacturaRequestDTO;

import java.util.List;

public interface FacturaService {

    public FacturaReporteDTO save(
            FacturaRequestDTO dto,
            Long numero,
            Long usuarioId,
            double porcentajeIva
    );

    public List<FacturaReporteDTO> findAll();

    public FacturaReporteDTO findById(Long id);

    public FacturaReporteDTO update(
            FacturaRequestDTO dto,
            Long id,
            Long usuarioId,
            double porcentajeIva
    );

    public void delete(Long id, Long usuarioId);

    public List<FacturaReporteDTO> findByListaPrecioArticulo(
            Long idListaPrecioArticulo
    );

    List<FacturaReporteDTO> findAllParaListado();

    FacturaReporteDTO anular(
            Long id,
            Long usuarioId,
            String observaciones
    );
}