package ec.edu.espe.pedido_service.model;

import ec.edu.espe.pedido_service.validation.CedulaEcuatoriana;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La cédula del cliente es obligatoria")
    @CedulaEcuatoriana(message = "La cédula del cliente debe ser una cédula ecuatoriana válida")
    @Column(nullable = false)
    private Long clienteId;

    private Long repartidorId;

    @NotBlank(message = "La dirección de entrega es obligatoria")
    @Size(min = 10, max = 200, message = "La dirección debe tener entre 10 y 200 caracteres")
    @Column(nullable = false)
    private String direccionEntrega;

    @Column(nullable = false)
    private String estado = "PENDIENTE"; // PENDIENTE, ASIGNADO, EN_CAMINO, EN_ENTREGA, ENTREGADO, CANCELADO

    @NotNull(message = "La tarifa es obligatoria")
    @DecimalMin(value = "0.01", message = "La tarifa debe ser mayor a 0")
    @Column(nullable = false)
    private BigDecimal tarifa;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean cancelado = false;
}
