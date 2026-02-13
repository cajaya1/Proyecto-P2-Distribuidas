package ec.edu.espe.websocket_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.crypto.SecretKey;
import java.util.Map;

/**
 * Interceptor para validar JWT en el handshake de WebSocket.
 * El token puede venir como parámetro de query (?token=xxx) o en el header Authorization.
 */
@Component
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    // Debe coincidir con la clave del auth-service
    private static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        String token = extractToken(request);
        
        if (token == null || token.isEmpty()) {
            log.warn("WebSocket handshake rechazado: Token no proporcionado");
            return false;
        }
        
        try {
            Claims claims = validateToken(token);
            
            // Guardar información del usuario en los atributos de la sesión WebSocket
            attributes.put("username", claims.getSubject());
            attributes.put("role", claims.get("role", String.class));
            
            String zoneId = claims.get("zone_id", String.class);
            if (zoneId != null) {
                attributes.put("zone_id", zoneId);
            }
            
            log.info("WebSocket handshake exitoso para usuario: {}", claims.getSubject());
            return true;
            
        } catch (Exception e) {
            log.warn("WebSocket handshake rechazado: Token inválido - {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No se requiere acción post-handshake
    }
    
    private String extractToken(ServerHttpRequest request) {
        // 1. Intentar obtener de query parameter
        String query = request.getURI().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && "token".equals(pair[0])) {
                    return pair[1];
                }
            }
        }
        
        // 2. Intentar obtener del header Authorization
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // 3. Para SockJS, intentar obtener de la sesión HTTP
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String tokenParam = servletRequest.getServletRequest().getParameter("token");
            if (tokenParam != null) {
                return tokenParam;
            }
        }
        
        return null;
    }
    
    private Claims validateToken(String token) {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
