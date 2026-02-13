package ec.edu.espe.tracking_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionEvent {
    private String eventId; // UUID para idempotencia
    private Long repartidorId;
    private Double latitud;
    private Double longitud;
    private LocalDateTime timestamp;
    private String estado;
    private Long pedidoId;
    private Double velocidad;
    private String direccion;
}
