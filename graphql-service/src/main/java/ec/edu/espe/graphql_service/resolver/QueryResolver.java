package ec.edu.espe.graphql_service.resolver;

import ec.edu.espe.graphql_service.dto.*;
import ec.edu.espe.graphql_service.model.*;
import ec.edu.espe.graphql_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class QueryResolver {
    
    private final PedidoRepository pedidoRepository;
    private final VehiculoRepository vehiculoRepository;
    
    // ===== PEDIDOS =====
    
    @QueryMapping
    public Pedido pedido(@Argument Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + id));
    }
    
    @QueryMapping
    public List<Pedido> pedidos(@Argument PedidoFiltro filtro) {
        if (filtro == null) {
            return pedidoRepository.findAll();
        }
        
        List<Pedido> resultado = pedidoRepository.findAll();
        
        if (filtro.getEstado() != null) {
            resultado = resultado.stream()
                    .filter(p -> filtro.getEstado().equals(p.getEstado()))
                    .collect(Collectors.toList());
        }
        
        if (filtro.getClienteId() != null) {
            resultado = resultado.stream()
                    .filter(p -> filtro.getClienteId().equals(p.getClienteId()))
                    .collect(Collectors.toList());
        }
        
        if (filtro.getRepartidorId() != null) {
            resultado = resultado.stream()
                    .filter(p -> filtro.getRepartidorId().equals(p.getRepartidorId()))
                    .collect(Collectors.toList());
        }
        
        return resultado;
    }
    
    @QueryMapping
    public List<Pedido> pedidosPorEstado(@Argument String estado) {
        return pedidoRepository.findByEstado(estado);
    }
    
    // ===== VEHÍCULOS =====
    
    @QueryMapping
    public Vehiculo vehiculo(@Argument Long id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado: " + id));
    }
    
    @QueryMapping
    public List<Vehiculo> vehiculos() {
        return vehiculoRepository.findAll();
    }
    
    @QueryMapping
    public List<Vehiculo> vehiculosDisponibles() {
        return vehiculoRepository.findByEstado("DISPONIBLE");
    }
    
    // ===== KPIs Y MÉTRICAS =====
    
    @QueryMapping
    public KPIDiario kpiDiario(@Argument String fecha) {
        String fechaStr = fecha != null ? fecha : LocalDate.now().toString();
        List<Pedido> pedidos = pedidoRepository.findAll();
        
        int total = pedidos.size();
        int entregados = (int) pedidos.stream().filter(p -> "ENTREGADO".equals(p.getEstado())).count();
        int pendientes = (int) pedidos.stream().filter(p -> "PENDIENTE".equals(p.getEstado()) || "RECIBIDO".equals(p.getEstado())).count();
        int cancelados = (int) pedidos.stream().filter(p -> Boolean.TRUE.equals(p.getCancelado())).count();
        
        double tarifaPromedio = pedidos.stream()
                .filter(p -> p.getTarifa() != null)
                .mapToDouble(p -> p.getTarifa().doubleValue())
                .average()
                .orElse(0.0);
        
        int vehiculosActivos = (int) vehiculoRepository.findAll().stream()
                .filter(v -> !"MANTENIMIENTO".equals(v.getEstado()))
                .count();
        
        return new KPIDiario(fechaStr, total, entregados, pendientes, cancelados, tarifaPromedio, vehiculosActivos);
    }
    
    @QueryMapping
    public FlotaResumen flotaActiva() {
        List<Vehiculo> vehiculos = vehiculoRepository.findAll();
        
        int total = vehiculos.size();
        int disponibles = (int) vehiculos.stream().filter(v -> "DISPONIBLE".equals(v.getEstado())).count();
        int enRuta = (int) vehiculos.stream().filter(v -> "EN_SERVICIO".equals(v.getEstado())).count();
        int mantenimiento = (int) vehiculos.stream().filter(v -> "MANTENIMIENTO".equals(v.getEstado())).count();
        
        return new FlotaResumen(total, disponibles, enRuta, mantenimiento);
    }
}
