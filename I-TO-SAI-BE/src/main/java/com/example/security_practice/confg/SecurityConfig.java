package com.example.security_practice.confg;

import com.example.security_practice.services.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, UserService userService) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf->csrf.ignoringRequestMatchers("/submitDailyResponse"))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/css/**", "/js/**", "/register").permitAll()
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/perform_login")
                        .defaultSuccessUrl("http://localhost:5173", true)
                        .failureUrl("/login?error")
                        .usernameParameter("usernameOrEmail")
                        .passwordParameter("password")
                        .permitAll())
                .logout(logout -> logout
                        .logoutRequestMatcher(request ->
                            "GET".equalsIgnoreCase(request.getMethod())
                                    && "/perform_logout".equals(request.getServletPath()))
                        .logoutSuccessUrl("/login?logout")
                        .permitAll())
                .userDetailsService(userService)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
