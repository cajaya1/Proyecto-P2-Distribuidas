package ec.edu.espe.notification_service.listener;

import ec.edu.espe.notification_service.event.PedidoEvent;
import ec.edu.espe.notification_service.event.UbicacionEvent;
import ec.edu.espe.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventListener {
    
    private final NotificationService notificationService;
    
    /**
     * Escucha eventos de pedidos creados
     */
    @RabbitListener(queues = "${rabbitmq.queues.pedido-creado}")
    public void handlePedidoCreado(PedidoEvent event) {
        log.info("📨 Evento recibido: pedido.creado - Pedido ID: {}", event.getPedidoId());
        
        try {
            String mensaje = String.format(
                "Su pedido #%d ha sido creado exitosamente. " +
                "Dirección de entrega: %s. Tarifa: $%.2f",
                event.getPedidoId(),
                event.getDireccionEntrega(),
                event.getTarifa()
            );
            
            // Crear notificación EMAIL
            notificationService.crearNotificacion(
                "EMAIL",
                "cliente" + event.getClienteId() + "@logiflow.com", // Mock email
                "Pedido Creado - LogiFlow",
                mensaje,
                "pedido.creado",
                event.getEventId()
            );
            
            // Crear notificación PUSH
            notificationService.crearNotificacion(
                "PUSH",
                "user_" + event.getClienteId(), // User ID para push
                "Pedido Creado",
                mensaje,
                "pedido.creado",
                event.getEventId() + "_push"
            );
            
        } catch (Exception e) {
            log.error("Error procesando evento pedido.creado", e);
        }
    }
    
    /**
     * Escucha eventos de actualización de estado de pedidos
     */
    @RabbitListener(queues = "${rabbitmq.queues.pedido-actualizado}")
    public void handlePedidoActualizado(PedidoEvent event) {
        log.info("📨 Evento recibido: pedido.estado.actualizado - Pedido ID: {}, Nuevo Estado: {}", 
                 event.getPedidoId(), event.getEstado());
        
        try {
            String mensaje = String.format(
                "El estado de su pedido #%d ha cambiado a: %s",
                event.getPedidoId(),
                event.getEstado()
            );
            
            // Crear notificación PUSH (más rápida para actualizaciones)
            notificationService.crearNotificacion(
                "PUSH",
                "user_" + event.getClienteId(),
                "Estado del Pedido Actualizado",
                mensaje,
                "pedido.estado.actualizado",
                event.getEventId()
            );
            
            // Si el estado es "ENTREGADO", también enviar email
            if ("ENTREGADO".equals(event.getEstado())) {
                notificationService.crearNotificacion(
                    "EMAIL",
                    "cliente" + event.getClienteId() + "@logiflow.com",
                    "Pedido Entregado - LogiFlow",
                    "Su pedido #" + event.getPedidoId() + " ha sido entregado exitosamente.",
                    "pedido.entregado",
                    event.getEventId() + "_email"
                );
            }
            
        } catch (Exception e) {
            log.error("Error procesando evento pedido.estado.actualizado", e);
        }
    }
    
    /**
     * Escucha eventos de actualización de ubicación de repartidores
     */
    @RabbitListener(queues = "${rabbitmq.queues.ubicacion-actualizada}")
    public void handleUbicacionActualizada(UbicacionEvent event) {
        log.info("📨 Evento recibido: ubicacion.actualizada - Repartidor ID: {}, Pedido ID: {}", 
                 event.getRepartidorId(), event.getPedidoId());
        
        try {
            // Solo notificar si hay un pedido asociado y el estado es relevante
            if (event.getPedidoId() != null && event.getEstado() != null) {
                
                if ("ENTREGANDO".equals(event.getEstado())) {
                    String mensaje = String.format(
                        "¡Su repartidor está cerca! Ubicación actual: Lat %.6f, Lng %.6f",
                        event.getLatitud(),
                        event.getLongitud()
                    );
                    
                    // Notificación PUSH inmediata
                    notificationService.crearNotificacion(
                        "PUSH",
                        "pedido_" + event.getPedidoId(), // Canal específico del pedido
                        "Su repartidor está llegando",
                        mensaje,
                        "ubicacion.actualizada.cerca",
                        event.getEventId()
                    );
                }
            }
            
        } catch (Exception e) {
            log.error("Error procesando evento ubicacion.actualizada", e);
        }
    }
}
