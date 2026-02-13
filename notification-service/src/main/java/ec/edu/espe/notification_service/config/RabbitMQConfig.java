package ec.edu.espe.notification_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    @Value("${rabbitmq.queues.pedido-creado}")
    private String pedidoCreadoQueue;
    
    @Value("${rabbitmq.queues.pedido-actualizado}")
    private String pedidoActualizadoQueue;
    
    @Value("${rabbitmq.queues.ubicacion-actualizada}")
    private String ubicacionActualizadaQueue;
    
    @Value("${rabbitmq.exchanges.pedidos}")
    private String pedidosExchange;
    
    @Value("${rabbitmq.exchanges.tracking}")
    private String trackingExchange;
    
    @Value("${rabbitmq.routing-keys.creado}")
    private String pedidoCreadoKey;
    
    @Value("${rabbitmq.routing-keys.actualizado}")
    private String pedidoActualizadoKey;
    
    @Value("${rabbitmq.routing-keys.ubicacion}")
    private String ubicacionKey;
    
    // Exchanges
    @Bean
    public TopicExchange pedidosExchange() {
        return new TopicExchange(pedidosExchange);
    }
    
    @Bean
    public TopicExchange trackingExchange() {
        return new TopicExchange(trackingExchange);
    }
    
    // Queues (sin TTL para compatibilidad con websocket-service)
    @Bean
    public Queue pedidoCreadoQueue() {
        return new Queue(pedidoCreadoQueue, true);
    }
    
    @Bean
    public Queue pedidoActualizadoQueue() {
        return new Queue(pedidoActualizadoQueue, true);
    }
    
    @Bean
    public Queue ubicacionActualizadaQueue() {
        return new Queue(ubicacionActualizadaQueue, true);
    }
    
    // Bindings
    @Bean
    public Binding pedidoCreadoBinding(Queue pedidoCreadoQueue, TopicExchange pedidosExchange) {
        return BindingBuilder.bind(pedidoCreadoQueue).to(pedidosExchange).with(pedidoCreadoKey);
    }
    
    @Bean
    public Binding pedidoActualizadoBinding(Queue pedidoActualizadoQueue, TopicExchange pedidosExchange) {
        return BindingBuilder.bind(pedidoActualizadoQueue).to(pedidosExchange).with(pedidoActualizadoKey);
    }
    
    @Bean
    public Binding ubicacionActualizadaBinding(Queue ubicacionActualizadaQueue, TopicExchange trackingExchange) {
        return BindingBuilder.bind(ubicacionActualizadaQueue).to(trackingExchange).with(ubicacionKey);
    }
    
    // Conversor JSON
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
