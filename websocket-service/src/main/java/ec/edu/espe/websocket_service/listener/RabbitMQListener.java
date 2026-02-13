package ec.edu.espe.websocket_service.listener;

import ec.edu.espe.websocket_service.event.PedidoEvent;
import ec.edu.espe.websocket_service.event.UbicacionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQListener {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Escucha eventos de pedidos creados y los transmite vía WebSocket
     */
    @RabbitListener(queues = "${rabbitmq.queues.pedido-creado}")
    public void handlePedidoCreado(PedidoEvent event) {
        log.info("📨 WebSocket: Evento pedido.creado recibido - Pedido ID: {}", event.getPedidoId());
        
        // Broadcast a todos los clientes suscritos a /topic/pedidos
        messagingTemplate.convertAndSend("/topic/pedidos", event);
        
        // Envío específico al cliente del pedido
        messagingTemplate.convertAndSend("/topic/pedido/" + event.getPedidoId(), event);
        
        // Envío específico al cliente dueño
        messagingTemplate.convertAndSend("/topic/cliente/" + event.getClienteId(), event);
        
        log.info("✅ Evento transmitido a WebSocket clients");
    }
    
    /**
     * Escucha actualizaciones de estado de pedidos
     */
    @RabbitListener(queues = "${rabbitmq.queues.pedido-actualizado}")
    public void handlePedidoActualizado(PedidoEvent event) {
        log.info("📨 WebSocket: Estado actualizado - Pedido ID: {}, Estado: {}", 
                 event.getPedidoId(), event.getEstado());
        
        // Broadcast general
        messagingTemplate.convertAndSend("/topic/pedidos/actualizaciones", event);
        
        // Específico del pedido
        messagingTemplate.convertAndSend("/topic/pedido/" + event.getPedidoId(), event);
        
        // Específico del cliente
        messagingTemplate.convertAndSend("/topic/cliente/" + event.getClienteId(), event);
        
        log.info("✅ Actualización transmitida vía WebSocket");
    }
    
    /**
     * Escucha actualizaciones de ubicación de repartidores
     */
    @RabbitListener(queues = "${rabbitmq.queues.ubicacion}")
    public void handleUbicacionActualizada(UbicacionEvent event) {
        log.info("📨 WebSocket: Ubicación actualizada - Repartidor ID: {}", event.getRepartidorId());
        
        // Broadcast a mapa general
        messagingTemplate.convertAndSend("/topic/ubicaciones", event);
        
        // Específico del repartidor
        messagingTemplate.convertAndSend("/topic/repartidor/" + event.getRepartidorId(), event);
        
        // Si está asociado a un pedido, enviar al topic del pedido
        if (event.getPedidoId() != null) {
            messagingTemplate.convertAndSend("/topic/pedido/" + event.getPedidoId() + "/ubicacion", event);
        }
        
        log.info("✅ Ubicación transmitida vía WebSocket");
    }
}
