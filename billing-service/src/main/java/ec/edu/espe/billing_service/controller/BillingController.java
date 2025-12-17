package ec.edu.espe.billing_service.controller;

import ec.edu.espe.billing_service.dto.FacturaRequest;
import ec.edu.espe.billing_service.model.Factura;
import ec.edu.espe.billing_service.repository.FacturaRepository;
import ec.edu.espe.billing_service.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;
    private final FacturaRepository facturaRepository;

    public BillingController(BillingService billingService, FacturaRepository facturaRepository) {
        this.billingService = billingService;
        this.facturaRepository = facturaRepository;
    }

    // Endpoint para generar una factura manualmente (o llamada por otro servicio)
    @PostMapping("/facturas")
    public ResponseEntity<Factura> crearFactura(@RequestBody FacturaRequest request) {
        return ResponseEntity.ok(billingService.generarFactura(request.getPedidoId(), request.getClienteId(), request.getSubtotal()));
    }

    @GetMapping("/facturas")
    public List<Factura> listarFacturas() {
        return facturaRepository.findAll();
    }
}
