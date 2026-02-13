package ec.edu.espe.tracking_service.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionRequest {
    
    @NotNull(message = "El ID del repartidor es obligatorio")
    private Long repartidorId;
    
    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0", message = "Latitud debe estar entre -90 y 90")
    @DecimalMax(value = "90.0", message = "Latitud debe estar entre -90 y 90")
    private Double latitud;
    
    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0", message = "Longitud debe estar entre -180 y 180")
    @DecimalMax(value = "180.0", message = "Longitud debe estar entre -180 y 180")
    private Double longitud;
    
    private String estado; // EN_RUTA, DETENIDO, ENTREGANDO
    
    private Long pedidoId;
    
    private String direccion;
    
    @DecimalMin(value = "0.0", message = "La velocidad no puede ser negativa")
    private Double velocidad;
}
