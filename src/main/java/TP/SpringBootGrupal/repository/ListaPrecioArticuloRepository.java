package TP.SpringBootGrupal.repository;

import TP.SpringBootGrupal.entities.ListaPrecioArticulo;
import TP.SpringBootGrupal.entities.TipoMoneda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListaPrecioArticuloRepository extends JpaRepository<TipoMoneda, Long> {
    List<ListaPrecioArticulo> findByArticulo_Id(Long articuloId);
}
