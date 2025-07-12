package com.example.security_practice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "ATF_Suggestions")
public class ATFSuggestion {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private int id;

    @Lob
    private String goal;
    @Lob
    private String reason;
    @Lob
    private String guidance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
