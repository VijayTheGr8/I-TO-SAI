package com.example.security_practice.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "role")
    private Set<String> roles;

    @OneToMany(
        mappedBy = "user",
        cascade = CascadeType.ALL)
    private Set<DayResponse> responses;

    @OneToMany(
        mappedBy = "user",
        cascade = CascadeType.ALL)
    private Set<ATFSuggestion> atfSuggestions;
}
