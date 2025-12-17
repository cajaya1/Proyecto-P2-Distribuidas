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
        // Buscamos el rol del usuario para meterlo en el token
        Usuario user = repository.findByUsername(username).orElseThrow();
        return jwtService.generateToken(username, user.getRol());
    }
}
