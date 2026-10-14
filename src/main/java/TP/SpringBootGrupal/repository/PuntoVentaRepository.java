package TP.SpringBootGrupal.repository;

import TP.SpringBootGrupal.entities.Cliente;
import TP.SpringBootGrupal.entities.PuntoVenta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PuntoVentaRepository extends JpaRepository<PuntoVenta, Long> {
}
