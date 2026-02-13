package ec.edu.espe.pedido_service.service;

import ec.edu.espe.pedido_service.client.FleetClient;
import ec.edu.espe.pedido_service.event.PedidoEvent;
import ec.edu.espe.pedido_service.model.Pedido;
import ec.edu.espe.pedido_service.repository.PedidoRepository;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final FleetClient fleetClient; // Cliente para hablar con Fleet
    private final RabbitTemplate rabbitTemplate;
    
    @Value("${rabbitmq.exchanges.pedidos}")
    private String pedidosExchange;
    
    @Value("${rabbitmq.routing-keys.creado}")
    private String pedidoCreadoKey;
    
    @Value("${rabbitmq.routing-keys.actualizado}")
    private String pedidoActualizadoKey;

    public PedidoService(PedidoRepository pedidoRepository, FleetClient fleetClient, 
                        RabbitTemplate rabbitTemplate) {
        this.pedidoRepository = pedidoRepository;
        this.fleetClient = fleetClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    // ---------------------------------------------------------------
    // Transacción ACID Local: O se guarda todo bien, o no se guarda nada.
    // ---------------------------------------------------------------
    @Transactional(rollbackFor = Exception.class) 
    public Pedido crearPedido(Pedido pedido) {
        
        // 1. Validar reglas de negocio
        pedido.setEstado("RECIBIDO");
        
        // 2. Si viene con repartidor pre-asignado, validamos que exista en el OTRO microservicio
        if (pedido.getRepartidorId() != null) {
            try {
                // Llamada síncrona HTTP a FleetService
                fleetClient.obtenerVehiculo(pedido.getRepartidorId());
            } catch (FeignException.NotFound e) {
                throw new RuntimeException("El repartidor con ID " + pedido.getRepartidorId() + " no existe.");
            } catch (Exception e) {
                throw new RuntimeException("Error al conectar con el servicio de flota.");
            }
        }

        // 3. Guardado Atómico
        Pedido saved = pedidoRepository.save(pedido);
        
        // 4. Publicar evento en RabbitMQ (Fase 2)
        publicarEventoPedidoCreado(saved);
        
        return saved;
    }
    
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }
    
    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));
    }
    
    @Transactional
    public Pedido actualizarParcial(Long id, java.util.Map<String, Object> updates) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        if (pedido.getCancelado() != null && pedido.getCancelado()) {
            throw new RuntimeException("No se puede actualizar un pedido cancelado");
        }
        
        String estadoAnterior = pedido.getEstado();
        
        updates.forEach((key, value) -> {
            if (value == null) return;
            
            switch (key) {
                case "direccionEntrega" -> {
                    if (value instanceof String) {
                        pedido.setDireccionEntrega((String) value);
                    }
                }
                case "estado" -> {
                    if (value instanceof String) {
                        pedido.setEstado((String) value);
                    }
                }
                case "repartidorId" -> {
                    if (value instanceof Number) {
                        pedido.setRepartidorId(((Number) value).longValue());
                    }
                }
                case "tarifa" -> {
                    if (value instanceof Number) {
                        pedido.setTarifa(new java.math.BigDecimal(value.toString()));
                    }
                }
                default -> {
                    // Ignorar campos desconocidos
                }
            }
        });
        
        Pedido saved = pedidoRepository.save(pedido);
        
        // Publicar evento si cambió el estado
        if (!estadoAnterior.equals(saved.getEstado())) {
            publicarEventoPedidoActualizado(saved);
        }
        
        return saved;
    }
    
    @Transactional
    public void cancelarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        pedido.setCancelado(true);
        pedido.setEstado("CANCELADO");
        Pedido saved = pedidoRepository.save(pedido);
        
        // Publicar evento de cancelación
        publicarEventoPedidoActualizado(saved);
    }
    
    /**
     * Publica evento cuando se crea un pedido
     */
    private void publicarEventoPedidoCreado(Pedido pedido) {
        try {
            PedidoEvent event = new PedidoEvent(
                UUID.randomUUID().toString(),
                pedido.getId(),
                pedido.getClienteId(),
                pedido.getEstado(),
                pedido.getDireccionEntrega(),
                pedido.getTarifa() != null ? pedido.getTarifa().doubleValue() : 0.0,
                LocalDateTime.now().toString()
            );
            
            rabbitTemplate.convertAndSend(pedidosExchange, pedidoCreadoKey, event);
            log.info("✅ Evento publicado: pedido.creado - Pedido ID: {}", pedido.getId());
            
        } catch (Exception e) {
            log.error("❌ Error al publicar evento pedido.creado", e);
            // No lanzamos excepción para no afectar la transacción principal
        }
    }
    
    /**
     * Publica evento cuando se actualiza el estado de un pedido
     */
    private void publicarEventoPedidoActualizado(Pedido pedido) {
        try {
            PedidoEvent event = new PedidoEvent(
                UUID.randomUUID().toString(),
                pedido.getId(),
                pedido.getClienteId(),
                pedido.getEstado(),
                pedido.getDireccionEntrega(),
                pedido.getTarifa() != null ? pedido.getTarifa().doubleValue() : 0.0,
                LocalDateTime.now().toString()
            );
            
            rabbitTemplate.convertAndSend(pedidosExchange, pedidoActualizadoKey, event);
            log.info("✅ Evento publicado: pedido.estado.actualizado - Pedido ID: {}, Nuevo Estado: {}", 
                     pedido.getId(), pedido.getEstado());
            
        } catch (Exception e) {
            log.error("❌ Error al publicar evento pedido.estado.actualizado", e);
        }
    }
}
