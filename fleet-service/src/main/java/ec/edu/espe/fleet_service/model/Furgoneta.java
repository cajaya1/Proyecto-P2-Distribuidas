package ec.edu.espe.fleet_service.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("FURGONETA")
public class Furgoneta extends Vehiculo {
    @Override
    public Double calcularCapacidadCarga() {
        return 800.0; // 800 kg
    }
}
