package com.duanweb.duanweb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull; // Nhớ import thư viện này
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/**
 * Thay the cho ServletContext.getRealPath("/api/uploads") cua servlet cu.
 * File poster duoc luu vao thu muc app.upload-dir (ngoai classpath) va
 * duoc serve lai qua URL /api/uploads/**.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String location = Path.of(uploadDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(location);
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // Giu tuong tu header CORS "*" cua cac servlet cu (front-end tinh co the goi tu domain khac khi dev)
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}