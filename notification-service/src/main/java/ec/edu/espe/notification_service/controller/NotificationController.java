package ec.edu.espe.notification_service.controller;

import ec.edu.espe.notification_service.model.Notificacion;
import ec.edu.espe.notification_service.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints para gestión de notific aciones")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/destinatario/{destinatario}")
    @Operation(summary = "Obtener notificaciones por destinatario")
    public ResponseEntity<List<Notificacion>> obtenerPorDestinatario(@PathVariable String destinatario) {
        List<Notificacion> notificaciones = notificationService.obtenerPorDestinatario(destinatario);
        return ResponseEntity.ok(notificaciones);
    }
    
    @GetMapping("/estado/{estado}")
    @Operation(summary = "Obtener notificaciones por estado")
    public ResponseEntity<List<Notificacion>> obtenerPorEstado(@PathVariable String estado) {
        List<Notificacion> notificaciones = notificationService.obtenerPorEstado(estado);
        return ResponseEntity.ok(notificaciones);
    }
    
    @PostMapping("/reintentar-fallidas")
    @Operation(summary = "Reintentar envío de notificaciones fallidas")
    public ResponseEntity<String> reintentarFallidas() {
        notificationService.reintentarFallidas();
        return ResponseEntity.ok("Reintento de notificaciones fallidas iniciado");
    }
}
