package ec.edu.espe.api_gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Configuración de Rate Limiting para el API Gateway.
 * Define cómo identificar a cada cliente para aplicar límites de tasa.
 */
@Configuration
public class RateLimitingConfig {

    /**
     * KeyResolver que identifica clientes por:
     * 1. Header X-API-Key si existe
     * 2. IP del cliente como fallback
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            // Primero intentar obtener X-API-Key
            String apiKey = exchange.getRequest().getHeaders().getFirst("X-API-Key");
            if (apiKey != null && !apiKey.isEmpty()) {
                return Mono.just(apiKey);
            }
            
            // Fallback: usar IP del cliente
            String clientIp = exchange.getRequest().getRemoteAddress() != null 
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown";
            
            return Mono.just(clientIp);
        };
    }
}
