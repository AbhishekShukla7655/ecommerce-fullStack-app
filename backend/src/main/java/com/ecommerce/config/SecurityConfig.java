package com.ecommerce.config;

import com.ecommerce.oauth2.OAuth2SuccessHandler;
import com.ecommerce.security.JwtFilter;
import com.ecommerce.security.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private OAuth2SuccessHandler oAuth2SuccessHandler;

        @Autowired
        private JwtFilter jwtFilter;

        @Autowired
        private CustomUserDetailsService userDetailsService;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(userDetailsService);
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOrigins(List.of(
                                "http://localhost:3000",
                                "http://localhost:5173", // Vite default port
                                "https://ecommerce-full-stack-app.vercel.app"));

                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

                config.setAllowedHeaders(List.of("*"));

                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config); // apply to all endpoints
                return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/products",
                                                                "/api/products/**",
                                                                "/images/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/oauth2/**",
                                                                "/login/oauth2/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/api/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/products")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.PUT,
                                                                "/api/products/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.DELETE,
                                                                "/api/products/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/cart/**",
                                                                "/api/orders/**")
                                                .authenticated()

                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2SuccessHandler) // our handler issues JWT after
                                                                                      // Google login
                                )
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                                .authenticationProvider(authenticationProvider());

                return http.build();
        }
}