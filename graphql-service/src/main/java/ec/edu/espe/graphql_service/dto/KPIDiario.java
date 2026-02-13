package ec.edu.espe.graphql_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KPIDiario {
    private String fecha;
    private Integer totalPedidos;
    private Integer pedidosEntregados;
    private Integer pedidosPendientes;
    private Integer pedidosCancelados;
    private Double tarifaPromedio;
    private Integer vehiculosActivos;
}
