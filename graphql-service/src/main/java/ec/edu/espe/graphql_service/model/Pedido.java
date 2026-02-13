package ec.edu.espe.graphql_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long clienteId;
    private String direccionEntrega;
    private Double peso;
    private String estado;
    private BigDecimal tarifa;
    private Long repartidorId;
    private Boolean cancelado = false;
}
