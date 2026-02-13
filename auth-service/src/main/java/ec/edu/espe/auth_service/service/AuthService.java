package ec.edu.espe.auth_service.service;

import ec.edu.espe.auth_service.model.Usuario;
import ec.edu.espe.auth_service.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    public String saveUser(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        repository.save(usuario);
        return "Usuario registrado";
    }

    public String generateToken(String username) {
        Usuario user = repository.findByUsername(username).orElseThrow();
        return jwtService.generateToken(username, user.getRol(), user.getZoneId(), user.getFleetType());
    }
    
    public String generateRefreshToken(String username) {
        return jwtService.generateRefreshToken(username);
    }
    
    public String refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Refresh token inválido o expirado");
        }
        String username = jwtService.extractUsername(refreshToken);
        return generateToken(username);
    }
    
    public Usuario findByUsername(String username) {
        return repository.findByUsername(username).orElseThrow(() -> 
            new RuntimeException("Usuario no encontrado: " + username));
    }
}
