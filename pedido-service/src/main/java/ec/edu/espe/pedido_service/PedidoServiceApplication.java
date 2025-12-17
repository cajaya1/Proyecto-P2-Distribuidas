package ec.edu.espe.pedido_service;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@OpenAPIDefinition(
		info = @Info(
				title = "API de Gestión de Pedidos",
				version = "1.0",
				description = "Microservicio para gestionar pedidos de entrega y asignación de repartidores"
		)
)
public class PedidoServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PedidoServiceApplication.class, args);
	}

}
