package ec.edu.espe.fleet_service;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
		info = @Info(
				title = "API de Gestión de Flota",
				version = "1.0",
				description = "Microservicio para gestionar vehículos y repartidores"
		)
)
public class FleetServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FleetServiceApplication.class, args);
	}

}
