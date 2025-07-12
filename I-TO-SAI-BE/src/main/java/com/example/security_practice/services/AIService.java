package com.example.security_practice.services;

import java.util.Optional;

public interface AIService {
    Optional<String> getATFSuggestion(String goal, String reason);
}
