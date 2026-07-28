package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class LoginController {

    private final AuthService authService;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/Login/login.html";
    }

    @PostMapping("/login")
    public String login(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String role,
            HttpSession session) {

        username = username == null ? "" : username.trim();
        password = password == null ? "" : password.trim();
        role = role == null ? "USER" : role.trim();

        if (username.isEmpty() || password.isEmpty()) {
            return "redirect:/Login/login.html?error="
                    + encode("Vui lòng nhập đầy đủ thông tin!");
        }

        // ===== Đăng nhập USER =====
        if ("USER".equalsIgnoreCase(role)) {

            User user = authService.login(username, password);

            if (user != null) {
                session.setAttribute("account", user);
                session.setMaxInactiveInterval(60 * 60);

                return "redirect:/Home/index.html";
            }
        }

        // ===== Đăng nhập ADMIN =====
        if ("ADMIN".equalsIgnoreCase(role)) {

            AdminAccount admin = authService.loginAdmin(username, password);

            if (admin != null) {
                session.setAttribute("admin", admin);
                session.setMaxInactiveInterval(60 * 60);

                return "redirect:/Admin/QuanLyPhim.html";
            }
        }

        return "redirect:/Login/login.html?error="
                + encode("Sai tên đăng nhập hoặc mật khẩu!");
    }

    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }
}