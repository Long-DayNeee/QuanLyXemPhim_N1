package com.duanweb.duanweb.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class CheckAuthController {

    @GetMapping("/api/check-auth")
    public Map<String, Object> checkAuth(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String role = (session != null) ? (String) session.getAttribute("role") : null;
        String username = (session != null) ? (String) session.getAttribute("username") : null;

        if (role != null) {
            response.put("isLoggedIn", true);
            response.put("role", role);
            response.put("username", username);
        } else {
            response.put("isLoggedIn", false);
        }

        return response; // Trả về dạng JSON cho Frontend
    }
}