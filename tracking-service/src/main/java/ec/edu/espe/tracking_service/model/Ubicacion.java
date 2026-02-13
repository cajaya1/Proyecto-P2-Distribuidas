package ec.edu.espe.tracking_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ubicaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ubicacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "El ID del repartidor es obligatorio")
    @Column(nullable = false)
    private Long repartidorId;
    
    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0", message = "Latitud debe estar entre -90 y 90")
    @DecimalMax(value = "90.0", message = "Latitud debe estar entre -90 y 90")
    @Column(nullable = false)
    private Double latitud;
    
    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0", message = "Longitud debe estar entre -180 y 180")
    @DecimalMax(value = "180.0", message = "Longitud debe estar entre -180 y 180")
    @Column(nullable = false)
    private Double longitud;
    
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(length = 50)
    private String estado; // EN_RUTA, DETENIDO, ENTREGANDO
    
    private Long pedidoId; // Si está asociado a un pedido específico
    
    @Column(length = 200)
    private String direccion; // Dirección aproximada (opcional)
    
    @DecimalMin(value = "0.0", message = "La velocidad no puede ser negativa")
    private Double velocidad; // km/h
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
