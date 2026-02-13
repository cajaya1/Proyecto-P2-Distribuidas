package ec.edu.espe.notification_service.repository;

import ec.edu.espe.notification_service.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    // Buscar por eventId para evitar duplicados (idempotencia)
    Optional<Notificacion> findByEventId(String eventId);
    
    // Buscar por destinatario
    List<Notificacion> findByDestinatarioOrderByFechaCreacionDesc(String destinatario);
    
    // Buscar por estado
    List<Notificacion> findByEstado(String estado);
    
    // Buscar notificaciones pendientes creadas antes de una fecha
    List<Notificacion> findByEstadoAndFechaCreacionBefore(String estado, LocalDateTime fecha);
    
    // Buscar por tipo y estado
    List<Notificacion> findByTipoAndEstado(String tipo, String estado);
}
