package com.example.security_practice.confg;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {
    @Bean
    public OpenAIClient openAIClient() { //OPENAI_API_KEY added in env. used automatically here. OPENAI_BASE_URL by default set to "https://api.openai.com/v1"
//        System.out.println(System.getenv("OPENAI_API_KEY"));
        return OpenAIOkHttpClient.fromEnv();
    }

    @Bean
    public ChatModel oaiModel() {
        return ChatModel.GPT_3_5_TURBO;
    }

    @Bean
    public String atfSuggestionSysPrompt(@Value("${openai.sys-prompts.atf-suggestion}") String prompt) {
        return prompt;
    }
}