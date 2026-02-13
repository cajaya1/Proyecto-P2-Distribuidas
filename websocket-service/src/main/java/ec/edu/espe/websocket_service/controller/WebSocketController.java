package ec.edu.espe.websocket_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Endpoint REST para verificar el servicio
     */
    @GetMapping("/status")
    @ResponseBody
    public Map<String, String> status() {
        Map<String, String> status = new HashMap<>();
        status.put("service", "websocket-service");
        status.put("status", "running");
        status.put("endpoint", "/ws");
        status.put("port", "8089");
        return status;
    }
    
    /**
     * Recibe ping de clientes y responde con pong
     */
    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public Map<String, Object> handlePing(Map<String, Object> message) {
        log.info("Ping recibido: {}", message);
        return Map.of(
            "type", "pong",
            "timestamp", System.currentTimeMillis(),
            "message", "Connection alive"
        );
    }
}
