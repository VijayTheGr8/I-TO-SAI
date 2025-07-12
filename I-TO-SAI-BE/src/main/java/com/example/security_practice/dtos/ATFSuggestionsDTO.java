package com.example.security_practice.dtos;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Map;
import java.util.Set;

public record ATFSuggestionsDTO(
        @JsonValue
        Map<String, Set<ATFSuggestionDetail>> suggestions
) {
    public record ATFSuggestionDetail(
            String reason,
            String guidance
    ) {}
}