package ec.edu.espe.fleet_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Entity
@Table(name = "vehiculos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_vehiculo", discriminatorType = DiscriminatorType.STRING)
public abstract class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @NotBlank(message = "La placa es obligatoria")
    @Pattern(regexp = "^[A-Z]{3}-[0-9]{3,4}$", message = "La placa debe tener el formato: 3 letras, guion, 3 o 4 números (ej: ABC-123)")
    @Column(nullable = false, unique = true)
    protected String placa;

    @NotBlank(message = "El modelo es obligatorio")
    @Column(nullable = false)
    protected String modelo;

    @Column(nullable = false)
    protected String estado; // DISPONIBLE, EN_SERVICIO, MANTENIMIENTO

    @Transient
    protected String tipo; // MOTO, FURGONETA
    
    @Column(name = "capacidad_carga")
    protected Double capacidadCarga;

    @PostLoad
    @PostPersist
    public void cargarTipo() {
        // Obtener el valor del discriminador desde la base de datos
        this.tipo = this.getClass().getAnnotation(DiscriminatorValue.class).value();
    }

    public abstract Double calcularCapacidadCarga();
}
