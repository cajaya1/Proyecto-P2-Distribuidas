package ec.edu.espe.fleet_service.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Vehículo liviano para entregas intermunicipales (autos o camionetas).
 * Capacidad media de carga para distancias provinciales.
 */
@Entity
@DiscriminatorValue("VEHICULO_LIVIANO")
public class VehiculoLiviano extends Vehiculo {
    
    @Override
    public Double calcularCapacidadCarga() {
        return 500.0; // 500 kg - capacidad típica de un auto/camioneta
    }
}
