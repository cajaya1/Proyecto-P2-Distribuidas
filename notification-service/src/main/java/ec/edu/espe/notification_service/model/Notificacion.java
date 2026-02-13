package ec.edu.espe.notification_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String tipo; // EMAIL, SMS, PUSH
    
    @Column(nullable = false, length = 200)
    private String destinatario; // email, número de teléfono, userId
    
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;
    
    @Column(nullable = false, length = 50)
    private String estado; // PENDIENTE, ENVIADO, ERROR
    
    @Column(length = 100)
    private String eventoOrigen; // pedido.creado, ubicacion.actualizada, etc.
    
    private String eventId; // Para idempotencia
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    private LocalDateTime fechaEnvio;
    
    @Column(length = 500)
    private String errorDetalle;
    
    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }
}
