package ec.edu.espe.billing_service.repository;

import ec.edu.espe.billing_service.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
}
