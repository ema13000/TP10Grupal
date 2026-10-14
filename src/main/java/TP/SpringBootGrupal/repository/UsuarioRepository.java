package TP.SpringBootGrupal.repository;

import TP.SpringBootGrupal.entities.TipoMoneda;
import TP.SpringBootGrupal.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
