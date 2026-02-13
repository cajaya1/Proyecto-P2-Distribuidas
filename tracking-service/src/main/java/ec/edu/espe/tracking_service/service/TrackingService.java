package ec.edu.espe.tracking_service.service;

import ec.edu.espe.tracking_service.dto.UbicacionRequest;
import ec.edu.espe.tracking_service.event.UbicacionEvent;
import ec.edu.espe.tracking_service.model.Ubicacion;
import ec.edu.espe.tracking_service.repository.UbicacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {
    
    private final UbicacionRepository ubicacionRepository;
    private final RabbitTemplate rabbitTemplate;
    
    @Value("${rabbitmq.exchanges.tracking}")
    private String trackingExchange;
    
    @Value("${rabbitmq.routing-keys.ubicacion}")
    private String ubicacionRoutingKey;
    
    /**
     * Registra una nueva ubicación y publica evento en RabbitMQ
     */
    @Transactional
    public Ubicacion registrarUbicacion(UbicacionRequest request) {
        // Guardar en base de datos
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setRepartidorId(request.getRepartidorId());
        ubicacion.setLatitud(request.getLatitud());
        ubicacion.setLongitud(request.getLongitud());
        ubicacion.setEstado(request.getEstado() != null ? request.getEstado() : "EN_RUTA");
        ubicacion.setPedidoId(request.getPedidoId());
        ubicacion.setDireccion(request.getDireccion());
        ubicacion.setVelocidad(request.getVelocidad());
        ubicacion.setTimestamp(LocalDateTime.now());
        
        Ubicacion saved = ubicacionRepository.save(ubicacion);
        log.info("Ubicación registrada: Repartidor={}, Lat={}, Lng={}", 
                 saved.getRepartidorId(), saved.getLatitud(), saved.getLongitud());
        
        // Publicar evento en RabbitMQ
        publicarEvento(saved);
        
        return saved;
    }
    
    /**
     * Publica evento de ubicación actualizada en RabbitMQ
     */
    private void publicarEvento(Ubicacion ubicacion) {
        try {
            UbicacionEvent event = new UbicacionEvent(
                UUID.randomUUID().toString(), // eventId para idempotencia
                ubicacion.getRepartidorId(),
                ubicacion.getLatitud(),
                ubicacion.getLongitud(),
                ubicacion.getTimestamp(),
                ubicacion.getEstado(),
                ubicacion.getPedidoId(),
                ubicacion.getVelocidad(),
                ubicacion.getDireccion()
            );
            
            rabbitTemplate.convertAndSend(trackingExchange, ubicacionRoutingKey, event);
            log.info("Evento publicado en RabbitMQ: {}", event.getEventId());
            
        } catch (Exception e) {
            log.error("Error al publicar evento en RabbitMQ", e);
            // No lanzamos excepción para no afectar la transacción principal
        }
    }
    
    /**
     * Obtiene la última ubicación de un repartidor
     */
    public Ubicacion obtenerUltimaUbicacion(Long repartidorId) {
        return ubicacionRepository
                .findFirstByRepartidorIdOrderByTimestampDesc(repartidorId)
                .orElseThrow(() -> new RuntimeException("No se encontró ubicación para el repartidor " + repartidorId));
    }
    
    /**
     * Obtiene el histórico de ubicaciones de un repartidor
     */
    public List<Ubicacion> obtenerHistorico(Long repartidorId) {
        return ubicacionRepository.findByRepartidorIdOrderByTimestampDesc(repartidorId);
    }
    
    /**
     * Obtiene ubicaciones de un pedido específico
     */
    public List<Ubicacion> obtenerUbicacionesPorPedido(Long pedidoId) {
        return ubicacionRepository.findByPedidoIdOrderByTimestampDesc(pedidoId);
    }
    
    /**
     * Obtiene últimas ubicaciones de todos los repartidores activos
     * (últimos 30 minutos)
     */
    public List<Ubicacion> obtenerRepartidoresActivos() {
        LocalDateTime hace30Min = LocalDateTime.now().minusMinutes(30);
        return ubicacionRepository.findLatestUbicacionesActivas(hace30Min);
    }
    
    /**
     * Obtiene ubicaciones en un rango de tiempo
     */
    public List<Ubicacion> obtenerPorRangoTiempo(Long repartidorId, LocalDateTime inicio, LocalDateTime fin) {
        return ubicacionRepository.findByRepartidorAndTimeRange(repartidorId, inicio, fin);
    }
}
