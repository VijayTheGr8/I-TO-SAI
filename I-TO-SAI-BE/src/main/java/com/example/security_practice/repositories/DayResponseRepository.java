package com.example.security_practice.repositories;

import com.example.security_practice.entities.DayResponse;
import com.example.security_practice.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.Set;

public interface DayResponseRepository extends JpaRepository<DayResponse, Integer> {
    Optional<DayResponse> findByUserAndDayIndex(User user, int dayIndex);
    @Query("SELECT dr FROM DayResponse dr JOIN FETCH dr.answers WHERE dr.user = :user")
    Set<DayResponse> findAllByUserWithAnswers(@Param("user") User user);
}
