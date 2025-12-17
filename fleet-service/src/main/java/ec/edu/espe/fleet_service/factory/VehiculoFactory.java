package ec.edu.espe.fleet_service.factory;

import ec.edu.espe.fleet_service.model.Furgoneta;
import ec.edu.espe.fleet_service.model.Motorizado;
import ec.edu.espe.fleet_service.model.Vehiculo;
import org.springframework.stereotype.Component;

@Component
public class VehiculoFactory {

    public Vehiculo crearVehiculo(String tipo) {
        if (tipo == null) return null;
        
        switch (tipo.toUpperCase()) {
            case "MOTO":
                return new Motorizado();
            case "FURGONETA":
                return new Furgoneta();
            default:
                throw new IllegalArgumentException("Tipo de vehículo no soportado: " + tipo);
        }
    }
}
