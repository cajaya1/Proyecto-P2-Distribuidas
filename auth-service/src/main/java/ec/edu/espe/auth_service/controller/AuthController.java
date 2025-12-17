package ec.edu.espe.auth_service.controller;

import ec.edu.espe.auth_service.model.Usuario;
import ec.edu.espe.auth_service.repository.UsuarioRepository;
import ec.edu.espe.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
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
    public String getToken(@RequestBody Usuario authRequest) {
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        if (authenticate.isAuthenticated()) {
            return service.generateToken(authRequest.getUsername());
        } else {
            throw new RuntimeException("Acceso inválido");
        }
    }
    
    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }
}
