package com.example.security_practice.dtos;

import com.example.security_practice.entities.DayResponse;

import java.util.Set;

public record UserDTO(String username, String email, Set<DayResponse> responses, ATFSuggestionsDTO ATFSuggestions) {
}

