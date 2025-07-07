package com.example.security_practice.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="day_response_answers")
@Getter
@Setter
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name="question_number")
    private Integer questionNumber;

    @Column(name="answer")
    private Boolean answer;

    @ManyToOne @JoinColumn(name="day_response_id")
    @JsonBackReference
    private DayResponse dayResponse;
}