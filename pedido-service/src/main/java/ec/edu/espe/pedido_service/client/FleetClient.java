package ec.edu.espe.pedido_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// "fleet-service" es el nombre que pusimos en el application.yml del otro proyecto
// url: "http://localhost:8082" es necesario porque aún no usamos Eureka (Service Discovery)
@FeignClient(name = "fleet-service", url = "http://localhost:8082")
public interface FleetClient {

    // Definimos la firma del método que queremos llamar en el otro microservicio
    // Este endpoint debe existir en FleetService
    @GetMapping("/api/fleet/vehiculos/{id}")
    Object obtenerVehiculo(@PathVariable("id") Long id);
}
