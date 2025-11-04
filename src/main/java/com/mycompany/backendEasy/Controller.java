package com.mycompany.backendEasy;

public class Controller {package com.example.demo.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

    @RestController
    public class WebhookController {

        // Your verify token - must match exactly what you enter in Meta portal
        private static final String Verify_Token= System.getenv("VERIFY_TOKEN");


        @GetMapping("/webhook")
        public ResponseEntity<String> verifyWebhook(
                @RequestParam(name = "hub.mode") String mode,
                @RequestParam(name = "hub.verify_token") String token,
                @RequestParam(name = "hub.challenge") String challenge
        ) {
            if ("subscribe".equals(mode) && Verify_Token.equals(token)) {
                // Verification successful - return the challenge
                return ResponseEntity.ok(challenge);
            } else {
                // Verification failed
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
            }
        }


        @PostMapping("/webhook")
        public ResponseEntity<String> receiveWebhook(@RequestBody String payload) {
            System.out.println(" Received webhook payload: " + payload);
            // Here you can parse and process the message if you want
            return ResponseEntity.ok("EVENT_RECEIVED");
        }
    }
}
