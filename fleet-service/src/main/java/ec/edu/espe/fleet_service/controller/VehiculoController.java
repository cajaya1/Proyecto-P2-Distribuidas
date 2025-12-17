package ec.edu.espe.fleet_service.controller;

import ec.edu.espe.fleet_service.dto.VehiculoRequest;
import ec.edu.espe.fleet_service.factory.VehiculoFactory;
import ec.edu.espe.fleet_service.model.Vehiculo;
import ec.edu.espe.fleet_service.repository.VehiculoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fleet")
public class VehiculoController {

    private final VehiculoRepository vehiculoRepository;
    private final VehiculoFactory vehiculoFactory;

    public VehiculoController(VehiculoRepository vehiculoRepository, VehiculoFactory vehiculoFactory) {
        this.vehiculoRepository = vehiculoRepository;
        this.vehiculoFactory = vehiculoFactory;
    }

    @GetMapping("/vehiculos")
    public List<Vehiculo> listarVehiculos() {
        return vehiculoRepository.findAll();
    }

    @GetMapping("/vehiculos/{id}")
    public ResponseEntity<Vehiculo> obtenerPorId(@PathVariable Long id) {
        return vehiculoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/vehiculos")
    public ResponseEntity<Vehiculo> crearVehiculo(@jakarta.validation.Valid @RequestBody VehiculoRequest request) {
        try {
            // 1. Validar formato de placa
            if (!request.getPlaca().matches("^[A-Z]{3}-[0-9]{3,4}$")) {
                throw new RuntimeException("La placa debe tener el formato: 3 letras may\u00fasculas, guion, 3 o 4 n\u00fameros (ej: ABC-123)");
            }
            
            // 2. Usamos la Factory para crear la instancia correcta
            Vehiculo vehiculo = vehiculoFactory.crearVehiculo(request.getTipo());
            
            // 2. Seteamos datos comunes
            vehiculo.setPlaca(request.getPlaca());
            vehiculo.setModelo(request.getModelo());
            vehiculo.setEstado(request.getEstado() != null ? request.getEstado() : "DISPONIBLE");
            
            // 3. Setear tipo y capacidad solo si no son null
            if (request.getTipo() != null) {
                vehiculo.setTipo(request.getTipo());
            }
            
            // 4. Capacidad: usar la del request si existe, sino usar la calculada
            Double capacidad = request.getCapacidadCarga() != null ? 
                request.getCapacidadCarga() : vehiculo.calcularCapacidadCarga();
            vehiculo.setCapacidadCarga(capacidad);
            
            // 5. Guardamos
            Vehiculo saved = vehiculoRepository.save(vehiculo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear vehículo: " + e.getMessage(), e);
        }
    }
    
    @DeleteMapping("/vehiculos/{id}")
    public ResponseEntity<Void> eliminarVehiculo(@PathVariable Long id) {
        if (vehiculoRepository.existsById(id)) {
            vehiculoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/vehiculos")
    public ResponseEntity<Void> eliminarTodos() {
        vehiculoRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/vehiculos/{id}/estado")
    public ResponseEntity<Vehiculo> actualizarEstado(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || (!nuevoEstado.equals("DISPONIBLE") && !nuevoEstado.equals("EN_SERVICIO") && !nuevoEstado.equals("MANTENIMIENTO"))) {
            throw new RuntimeException("Estado inválido. Debe ser: DISPONIBLE, EN_SERVICIO o MANTENIMIENTO");
        }
        
        vehiculo.setEstado(nuevoEstado);
        return ResponseEntity.ok(vehiculoRepository.save(vehiculo));
    }
}
