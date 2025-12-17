package ec.edu.espe.fleet_service.repository;

import ec.edu.espe.fleet_service.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    // Spring Data JPA maneja automáticamente la herencia y los tipos
}
