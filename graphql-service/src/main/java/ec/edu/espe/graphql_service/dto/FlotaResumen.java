package ec.edu.espe.graphql_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlotaResumen {
    private Integer total;
    private Integer disponibles;
    private Integer enRuta;
    private Integer mantenimiento;
}
