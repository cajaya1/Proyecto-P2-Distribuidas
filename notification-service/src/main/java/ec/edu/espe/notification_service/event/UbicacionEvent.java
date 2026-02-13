package ec.edu.espe.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionEvent {
    private String eventId;
    private Long repartidorId;
    private Double latitud;
    private Double longitud;
    private String timestamp;
    private String estado;
    private Long pedidoId;
    private Double velocidad;
}
