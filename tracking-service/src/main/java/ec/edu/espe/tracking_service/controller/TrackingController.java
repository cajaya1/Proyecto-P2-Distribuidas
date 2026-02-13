package ec.edu.espe.tracking_service.controller;

import ec.edu.espe.tracking_service.dto.UbicacionRequest;
import ec.edu.espe.tracking_service.model.Ubicacion;
import ec.edu.espe.tracking_service.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking", description = "Endpoints para seguimiento GPS y geolocalización")
public class TrackingController {
    
    private final TrackingService trackingService;
    
    @PostMapping
    @Operation(summary = "Registrar ubicación GPS", 
               description = "Registra una nueva ubicación del repartidor y publica evento en RabbitMQ")
    public ResponseEntity<Ubicacion> registrarUbicacion(@Valid @RequestBody UbicacionRequest request) {
        Ubicacion ubicacion = trackingService.registrarUbicacion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ubicacion);
    }
    
    @GetMapping("/repartidor/{repartidorId}/ultima")
    @Operation(summary = "Obtener última ubicación", 
               description = "Devuelve la última ubicación registrada de un repartidor")
    public ResponseEntity<Ubicacion> obtenerUltimaUbicacion(@PathVariable Long repartidorId) {
        Ubicacion ubicacion = trackingService.obtenerUltimaUbicacion(repartidorId);
        return ResponseEntity.ok(ubicacion);
    }
    
    @GetMapping("/repartidor/{repartidorId}/historico")
    @Operation(summary = "Obtener histórico de ubicaciones", 
               description = "Devuelve todas las ubicaciones registradas de un repartidor")
    public ResponseEntity<List<Ubicacion>> obtenerHistorico(@PathVariable Long repartidorId) {
        List<Ubicacion> ubicaciones = trackingService.obtenerHistorico(repartidorId);
        return ResponseEntity.ok(ubicaciones);
    }
    
    @GetMapping("/pedido/{pedidoId}")
    @Operation(summary = "Obtener ubicaciones por pedido", 
               description = "Devuelve las ubicaciones del repartidor asociadas a un pedido específico")
    public ResponseEntity<List<Ubicacion>> obtenerPorPedido(@PathVariable Long pedidoId) {
        List<Ubicacion> ubicaciones = trackingService.obtenerUbicacionesPorPedido(pedidoId);
        return ResponseEntity.ok(ubicaciones);
    }
    
    @GetMapping("/activos")
    @Operation(summary = "Obtener repartidores activos", 
               description = "Devuelve las últimas ubicaciones de todos los repartidores activos (últimos 30 min)")
    public ResponseEntity<List<Ubicacion>> obtenerRepartidoresActivos() {
        List<Ubicacion> ubicaciones = trackingService.obtenerRepartidoresActivos();
        return ResponseEntity.ok(ubicaciones);
    }
    
    @GetMapping("/repartidor/{repartidorId}/rango")
    @Operation(summary = "Obtener ubicaciones por rango de tiempo", 
               description = "Devuelve ubicaciones de un repartidor en un período específico")
    public ResponseEntity<List<Ubicacion>> obtenerPorRango(
            @PathVariable Long repartidorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        List<Ubicacion> ubicaciones = trackingService.obtenerPorRangoTiempo(repartidorId, inicio, fin);
        return ResponseEntity.ok(ubicaciones);
    }
}
