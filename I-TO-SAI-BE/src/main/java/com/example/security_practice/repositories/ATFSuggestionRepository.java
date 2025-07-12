package com.example.security_practice.repositories;

import com.example.security_practice.entities.ATFSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ATFSuggestionRepository extends JpaRepository<ATFSuggestion, Integer> {
}
