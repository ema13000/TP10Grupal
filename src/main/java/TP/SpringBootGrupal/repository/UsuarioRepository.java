package TP.SpringBootGrupal.repository;

import TP.SpringBootGrupal.entities.TipoMoneda;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<TipoMoneda, Long> {
}
