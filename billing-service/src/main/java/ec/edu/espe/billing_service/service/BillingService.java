package ec.edu.espe.billing_service.service;

import ec.edu.espe.billing_service.model.Factura;
import ec.edu.espe.billing_service.repository.FacturaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BillingService {

    private final FacturaRepository facturaRepository;
    private static final BigDecimal IVA = new BigDecimal("0.15");

    public BillingService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    public Factura generarFactura(Long pedidoId, Long clienteId, BigDecimal subtotal) {
        Factura factura = new Factura();
        factura.setPedidoId(pedidoId);
        factura.setClienteId(clienteId);
        factura.setSubtotal(subtotal);
        
        // Cálculo básico
        BigDecimal valorImpuesto = subtotal.multiply(IVA);
        factura.setImpuestos(valorImpuesto);
        factura.setTotal(subtotal.add(valorImpuesto));
        
        // Estado inicial requerido por el documento
        factura.setEstado("BORRADOR"); 

        return facturaRepository.save(factura);
    }
}
