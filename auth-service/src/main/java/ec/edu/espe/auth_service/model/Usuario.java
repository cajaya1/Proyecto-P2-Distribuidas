package ec.edu.espe.auth_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Se guardará encriptada

    private String rol; // ADMIN, CLIENTE, REPARTIDOR, SUPERVISOR
}
