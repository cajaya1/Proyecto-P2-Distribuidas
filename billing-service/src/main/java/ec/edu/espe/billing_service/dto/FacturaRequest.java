package ec.edu.espe.billing_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FacturaRequest {
    private Long pedidoId;
    private Long clienteId;
    private BigDecimal subtotal;
}
