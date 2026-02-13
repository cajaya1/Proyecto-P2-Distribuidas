package ec.edu.espe.auth_service.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // EN PRODUCCIÓN: Esto debe ir en variables de entorno. 
    // Debe ser una cadena larga (mínimo 256 bits) en Hex o Base64.
    public static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";
    
    private static final long TOKEN_VALIDITY = 1000 * 60 * 30; // 30 minutos
    private static final long REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24 * 7; // 7 días

    public String generateToken(String userName, String role) {
        return generateToken(userName, role, null, null);
    }
    
    public String generateToken(String userName, String role, String scope, String zoneId, String fleetType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        if (scope != null) claims.put("scope", scope);
        if (zoneId != null) claims.put("zone_id", zoneId);
        if (fleetType != null) claims.put("fleet_type", fleetType);
        return createToken(claims, userName, TOKEN_VALIDITY);
    }
    
    public String generateToken(String userName, String role, String zoneId, String fleetType) {
        return generateToken(userName, role, "read,write", zoneId, fleetType);
    }
    
    public String generateRefreshToken(String userName) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return createToken(claims, userName, REFRESH_TOKEN_VALIDITY);
    }

    private String createToken(Map<String, Object> claims, String userName, long validity) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userName)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + validity))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
    
    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isRefreshToken(String token) {
        try {
            String type = extractAllClaims(token).get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
