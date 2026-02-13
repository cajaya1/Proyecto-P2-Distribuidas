package ec.edu.espe.notification_service.service;

import ec.edu.espe.notification_service.model.Notificacion;
import ec.edu.espe.notification_service.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificacionRepository notificacionRepository;
    
    /**
     * Crea y envía una notificación (con idempotencia)
     */
    @Transactional
    public Notificacion crearNotificacion(String tipo, String destinatario, String titulo, 
                                         String mensaje, String eventoOrigen, String eventId) {
        // Verificar idempotencia
        if (eventId != null && notificacionRepository.findByEventId(eventId).isPresent()) {
            log.info("Evento ya procesado: {}", eventId);
            return notificacionRepository.findByEventId(eventId).get();
        }
        
        Notificacion notificacion = new Notificacion();
        notificacion.setTipo(tipo);
        notificacion.setDestinatario(destinatario);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setEventoOrigen(eventoOrigen);
        notificacion.setEventId(eventId);
        notificacion.setEstado("PENDIENTE");
        notificacion.setFechaCreacion(LocalDateTime.now());
        
        Notificacion saved = notificacionRepository.save(notificacion);
        log.info("Notificación creada: ID={}, Tipo={}, Destinatario={}", 
                 saved.getId(), saved.getTipo(), saved.getDestinatario());
        
        // Simular envío (en producción aquí iría la lógica real)
        enviarNotificacion(saved);
        
        return saved;
    }
    
    /**
     * Simula el envío de la notificación
     */
    private void enviarNotificacion(Notificacion notificacion) {
        try {
            // Simulación de envío según tipo
            switch (notificacion.getTipo()) {
                case "EMAIL":
                    log.info("📧 Enviando EMAIL a: {}", notificacion.getDestinatario());
                    log.info("   Asunto: {}", notificacion.getTitulo());
                    log.info("   Mensaje: {}", notificacion.getMensaje());
                    break;
                    
                case "SMS":
                    log.info("📱 Enviando SMS a: {}", notificacion.getDestinatario());
                    log.info("   Mensaje: {}", notificacion.getMensaje());
                    break;
                    
                case "PUSH":
                    log.info("🔔 Enviando PUSH a: {}", notificacion.getDestinatario());
                    log.info("   Título: {}", notificacion.getTitulo());
                    log.info("   Mensaje: {}", notificacion.getMensaje());
                    break;
            }
            
            // Marcar como enviado
            notificacion.setEstado("ENVIADO");
            notificacion.setFechaEnvio(LocalDateTime.now());
            notificacionRepository.save(notificacion);
            log.info("✅ Notificación enviada exitosamente: ID={}", notificacion.getId());
            
        } catch (Exception e) {
            log.error("❌ Error al enviar notificación: ID={}", notificacion.getId(), e);
            notificacion.setEstado("ERROR");
            notificacion.setErrorDetalle(e.getMessage());
            notificacionRepository.save(notificacion);
        }
    }
    
    /**
     * Obtiene todas las notificaciones de un destinatario
     */
    public List<Notificacion> obtenerPorDestinatario(String destinatario) {
        return notificacionRepository.findByDestinatarioOrderByFechaCreacionDesc(destinatario);
    }
    
    /**
     * Obtiene notificaciones por estado
     */
    public List<Notificacion> obtenerPorEstado(String estado) {
        return notificacionRepository.findByEstado(estado);
    }
    
    /**
     * Reintenta envío de notificaciones fallidas
     */
    @Transactional
    public void reintentarFallidas() {
        List<Notificacion> fallidas = notificacionRepository.findByEstado("ERROR");
        log.info("Reintentando {} notificaciones fallidas", fallidas.size());
        
        for (Notificacion notif : fallidas) {
            notif.setEstado("PENDIENTE");
            notif.setErrorDetalle(null);
            notificacionRepository.save(notif);
            enviarNotificacion(notif);
        }
    }
}
