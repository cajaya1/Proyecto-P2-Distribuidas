package ec.edu.espe.tracking_service.repository;

import ec.edu.espe.tracking_service.model.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {
    
    // Obtener la última ubicación de un repartidor
    Optional<Ubicacion> findFirstByRepartidorIdOrderByTimestampDesc(Long repartidorId);
    
    // Obtener histórico de ubicaciones de un repartidor
    List<Ubicacion> findByRepartidorIdOrderByTimestampDesc(Long repartidorId);
    
    // Obtener ubicaciones de un pedido específico
    List<Ubicacion> findByPedidoIdOrderByTimestampDesc(Long pedidoId);
    
    // Obtener ubicaciones en un rango de tiempo
    @Query("SELECT u FROM Ubicacion u WHERE u.repartidorId = :repartidorId " +
           "AND u.timestamp BETWEEN :inicio AND :fin ORDER BY u.timestamp DESC")
    List<Ubicacion> findByRepartidorAndTimeRange(
        @Param("repartidorId") Long repartidorId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );
    
    // Obtener últimas ubicaciones de todos los repartidores activos
    @Query("SELECT u FROM Ubicacion u WHERE u.id IN " +
           "(SELECT MAX(u2.id) FROM Ubicacion u2 GROUP BY u2.repartidorId) " +
           "AND u.timestamp > :desde")
    List<Ubicacion> findLatestUbicacionesActivas(@Param("desde") LocalDateTime desde);
}
