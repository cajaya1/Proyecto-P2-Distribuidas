package ec.edu.espe.websocket_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEvent {
    private String eventId;
    private Long pedidoId;
    private Long clienteId;
    private String estado;
    private String direccionEntrega;
    private Double tarifa;
    private String timestamp;
}
