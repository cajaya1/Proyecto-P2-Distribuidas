package ec.edu.espe.fleet_service.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Camión para entregas nacionales de gran volumen.
 * Alta capacidad de carga para distancias largas.
 */
@Entity
@DiscriminatorValue("CAMION")
public class Camion extends Vehiculo {
    
    @Override
    public Double calcularCapacidadCarga() {
        return 5000.0; // 5000 kg - capacidad típica de un camión mediano
    }
}
