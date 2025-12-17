package ec.edu.espe.billing_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "facturas")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long pedidoId; // Referencia al pedido del otro microservicio

    @Column(nullable = false)
    private Long clienteId;

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(nullable = false)
    private BigDecimal impuestos; // Ej. 15% IVA

    @Column(nullable = false)
    private BigDecimal total;

    @Column(nullable = false)
    private String estado; // BORRADOR, PAGADA, ANULADA

    private LocalDateTime fechaEmision;

    @PrePersist
    public void prePersist() {
        this.fechaEmision = LocalDateTime.now();
    }
}
