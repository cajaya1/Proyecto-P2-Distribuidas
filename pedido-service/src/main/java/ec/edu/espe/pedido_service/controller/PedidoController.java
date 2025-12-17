package ec.edu.espe.pedido_service.controller;

import ec.edu.espe.pedido_service.model.Pedido;
import ec.edu.espe.pedido_service.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<Pedido> crear(@Valid @RequestBody Pedido pedido) {
        return ResponseEntity.ok(pedidoService.crearPedido(pedido));
    }

    @GetMapping
    public List<Pedido> listar() {
        return pedidoService.listarPedidos();
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Pedido> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(pedidoService.actualizarParcial(id, updates));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        pedidoService.cancelarPedido(id);
        return ResponseEntity.noContent().build();
    }
}
