package com.example.security_practice.dtos;

import java.util.Set;

public record DayResponseDTO (int dayIndex, Set<AnswerDTO> answers){}
