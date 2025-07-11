package com.example.security_practice.controllers;

import com.example.security_practice.dtos.DayResponseDTO;
import com.example.security_practice.entities.Answer;
import com.example.security_practice.entities.DayResponse;
import com.example.security_practice.entities.User;
import com.example.security_practice.dtos.UserDTO;
import com.example.security_practice.repositories.DayResponseRepository;
import com.example.security_practice.repositories.UserRepository;
import com.example.security_practice.services.AIService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
//@CrossOrigin(value = "http://localhost:5173", allowCredentials = "true") //commented out since we are getting NGINX to proxy both FE and BE through the same host:port
public class UserController {
    private final UserRepository userRepo;
    private final DayResponseRepository dayResponseRepo;
    private final AIService aiService;

    @GetMapping("/getUserDetails")
    public ResponseEntity<?> getUserDetails(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User u = userRepo.findByUsername(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(new UserDTO(u.getUsername(), u.getEmail()));
    }

    @PostMapping("/submitDailyResponse")
    public ResponseEntity<?> submitDailyResponse(@AuthenticationPrincipal UserDetails principal,
                                  @RequestBody DayResponseDTO dto) {
        User user = userRepo.findByUsername(principal.getUsername()).orElseThrow();

        if (dayResponseRepo.findByUserAndDayIndex(user, dto.dayIndex()).isPresent()) {
            return ResponseEntity.badRequest().body("fail:resubmit");
            //throw exception, as user should not be able to resubmit or edit a day response
        }
        DayResponse dr = new DayResponse();
        dr.setUser(user);
        Set<Answer> answers = new HashSet<>();
        dto.answers().forEach(ans -> {
            Answer a = new Answer();
            a.setDayResponse(dr);
            a.setQuestionNumber(ans.questionNumber());
            a.setAnswer(ans.answer());
            answers.add(a);
        });
        dr.setAnswers(answers);
        dr.setDayIndex(dto.dayIndex());

        dayResponseRepo.save(dr);
        return ResponseEntity.ok().body("success");
    }

    @GetMapping("/viewResponsesForUser") //returns arr  of days each with answers for that day
    public ResponseEntity<?> viewResponsesForUser(@AuthenticationPrincipal UserDetails principal) {
        var u = userRepo.findByUsername(principal.getUsername()).orElseThrow();
        var responses = dayResponseRepo.findAllByUserWithAnswers(u);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/getATFSuggestion")
    @PreAuthorize("hasRole('USER')")
    public String getATFSuggestion(@RequestParam("struggle") String struggle, @RequestParam("reason") String reason) {
        return aiService.getATFSuggestion(struggle, reason).orElseThrow(() -> new IllegalStateException("oai api fetch failed. check if outage or request\nstruggle:"+struggle+"\nreason: "+reason));
    }
}
