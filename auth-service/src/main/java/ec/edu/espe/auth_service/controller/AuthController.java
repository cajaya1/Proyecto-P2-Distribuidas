package ec.edu.espe.auth_service.controller;

import ec.edu.espe.auth_service.model.Usuario;
import ec.edu.espe.auth_service.repository.UsuarioRepository;
import ec.edu.espe.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService service;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public String addNewUser(@RequestBody Usuario user) {
        return service.saveUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> getToken(@RequestBody Usuario authRequest) {
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        if (authenticate.isAuthenticated()) {
            String accessToken = service.generateToken(authRequest.getUsername());
            String refreshToken = service.generateRefreshToken(authRequest.getUsername());
            Usuario user = service.findByUsername(authRequest.getUsername());
            
            Map<String, String> response = new HashMap<>();
            response.put("access_token", accessToken);
            response.put("refresh_token", refreshToken);
            response.put("token_type", "Bearer");
            response.put("role", user.getRol());
            response.put("username", user.getUsername());
            if (user.getNombre() != null) response.put("nombre", user.getNombre());
            if (user.getZoneId() != null) response.put("zone_id", user.getZoneId());
            if (user.getFleetType() != null) response.put("fleet_type", user.getFleetType());
            
            return ResponseEntity.ok(response);
        } else {
            throw new RuntimeException("Acceso inválido");
        }
    }
    
    @PostMapping("/token/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");
        if (refreshToken == null) {
            throw new RuntimeException("Refresh token requerido");
        }
        
        String newAccessToken = service.refreshToken(refreshToken);
        
        Map<String, String> response = new HashMap<>();
        response.put("access_token", newAccessToken);
        response.put("token_type", "Bearer");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }
    
    @PutMapping("/usuarios/{username}")
    public ResponseEntity<String> actualizarUsuario(@PathVariable String username, @RequestBody Map<String, String> updates) {
        Usuario user = service.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (updates.containsKey("nombre")) {
            user.setNombre(updates.get("nombre"));
        }
        if (updates.containsKey("zoneId")) {
            user.setZoneId(updates.get("zoneId"));
        }
        if (updates.containsKey("fleetType")) {
            user.setFleetType(updates.get("fleetType"));
        }
        usuarioRepository.save(user);
        return ResponseEntity.ok("Usuario actualizado");
    }
}
