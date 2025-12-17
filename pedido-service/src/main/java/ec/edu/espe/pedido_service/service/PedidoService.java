package ec.edu.espe.pedido_service.service;

import ec.edu.espe.pedido_service.client.FleetClient;
import ec.edu.espe.pedido_service.model.Pedido;
import ec.edu.espe.pedido_service.repository.PedidoRepository;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final FleetClient fleetClient; // Cliente para hablar con Fleet

    public PedidoService(PedidoRepository pedidoRepository, FleetClient fleetClient) {
        this.pedidoRepository = pedidoRepository;
        this.fleetClient = fleetClient;
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
        return pedidoRepository.save(pedido);
    }
    
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }
    
    @Transactional
    public Pedido actualizarParcial(Long id, java.util.Map<String, Object> updates) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        if (pedido.getCancelado() != null && pedido.getCancelado()) {
            throw new RuntimeException("No se puede actualizar un pedido cancelado");
        }
        
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
        
        return pedidoRepository.save(pedido);
    }
    
    @Transactional
    public void cancelarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        
        pedido.setCancelado(true);
        pedido.setEstado("CANCELADO");
        pedidoRepository.save(pedido);
    }
}
