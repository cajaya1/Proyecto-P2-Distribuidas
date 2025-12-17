package ec.edu.espe.fleet_service.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("MOTO") // Valor que se guardará en la columna 'tipo_vehiculo'
public class Motorizado extends Vehiculo {
    @Override
    public Double calcularCapacidadCarga() {
        return 20.0; // 20 kg
    }
}
