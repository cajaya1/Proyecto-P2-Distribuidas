package ec.edu.espe.fleet_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VehiculoRequest {
    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;
    
    @NotBlank(message = "La placa es obligatoria")
    @Pattern(regexp = "^[A-Z]{3}-[0-9]{3,4}$", message = "La placa debe tener el formato: 3 letras mayúsculas, guion, 3 o 4 números (ej: ABC-123)")
    private String placa;
    
    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;
    
    private Double capacidadCarga;
    private String estado;
}
