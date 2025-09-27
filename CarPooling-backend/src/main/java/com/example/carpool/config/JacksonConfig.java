package com.example.carpool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;

@Configuration
public class JacksonConfig {
    
    @Bean
    public Module hibernateModule() {
        Hibernate5JakartaModule module = new Hibernate5JakartaModule();
        // Configure module to ignore lazy loading
        module.configure(Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING, false);
        return module;
    }
}
