package ec.edu.espe.graphql_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoFiltro {
    private String estado;
    private Long clienteId;
    private Long repartidorId;
}
