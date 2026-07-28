package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.AuthDAO;
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

    private final AuthDAO authDAO;

    public LoginController(AuthDAO authDAO) {
        this.authDAO = authDAO;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/Login/login.html";
    }

    @PostMapping("/login")
    public String login(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session) {

        username = username.trim();
        password = password.trim();

        if (username.isEmpty() || password.isEmpty()) {
            return "redirect:/Login/login.html?error="
                    + encode("Vui lòng nhập đầy đủ thông tin!");
        }

        // Đăng nhập User
        User user = authDAO.login(username, password);

        if (user != null) {
            session.setAttribute("account", user);
            session.setMaxInactiveInterval(60 * 60);

            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return "redirect:/Admin/QuanLyPhim.html";
            }

            return "redirect:/Home/index.html";
        }

        // Nếu không phải User thì kiểm tra Admin
        AuthDAO.LoginResult result = authDAO.authenticate(username, password);

        if (result == AuthDAO.LoginResult.OK) {
            session.setAttribute("admin", username);
            session.setMaxInactiveInterval(60 * 60);
            return "redirect:/Admin/QuanLyPhim.html";
        }

        return "redirect:/Login/login.html?error="
                + encode("Sai tên đăng nhập hoặc mật khẩu!");
    }

    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }
}