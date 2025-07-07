package com.example.security_practice.services;

import com.example.security_practice.repositories.UserRepository;
import com.example.security_practice.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail)
            throws UsernameNotFoundException {
        Optional<User> optUser = userRepo.findByUsername(usernameOrEmail);
        if (optUser.isEmpty()) {
            optUser = userRepo.findByEmail(usernameOrEmail);
        }
        User user = optUser.orElseThrow(()->new UsernameNotFoundException("no user found w email/password: "+ usernameOrEmail));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet())
        );
    }

    public void register(String username, String rawPassword, String email) {
        if (userRepo.findByUsername(username).isPresent() || userRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("user already exists!!1");
        }
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setEmail(email);
        newUser.setRoles(Set.of("ROLE_USER"));
        userRepo.save(newUser);
    }
}
