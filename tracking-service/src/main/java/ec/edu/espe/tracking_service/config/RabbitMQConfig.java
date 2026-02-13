package ec.edu.espe.tracking_service.config;

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
    
    @Value("${rabbitmq.exchanges.tracking}")
    private String trackingExchange;
    
    @Value("${rabbitmq.queues.ubicacion}")
    private String ubicacionQueue;
    
    @Value("${rabbitmq.routing-keys.ubicacion}")
    private String ubicacionRoutingKey;
    
    // Exchange para eventos de tracking
    @Bean
    public TopicExchange trackingExchange() {
        return new TopicExchange(trackingExchange);
    }
    
    // Queue para ubicaciones actualizadas
    @Bean
    public Queue ubicacionQueue() {
        return QueueBuilder
                .durable(ubicacionQueue)
                .withArgument("x-message-ttl", 3600000) // TTL 1 hora
                .build();
    }
    
    // Binding
    @Bean
    public Binding ubicacionBinding() {
        return BindingBuilder
                .bind(ubicacionQueue())
                .to(trackingExchange())
                .with(ubicacionRoutingKey);
    }
    
    // Conversor JSON para mensajes
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    // RabbitTemplate configurado
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
