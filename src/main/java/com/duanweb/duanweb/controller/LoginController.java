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
    public String login(@RequestParam(value = "username", required = false) String username,
                        @RequestParam(value = "password", required = false) String password,
                        HttpSession session) {
        String u = username != null ? username.trim() : "";
        String p = password != null ? password.trim() : "";

        if (u.isBlank() || p.isBlank()) {
            return "redirect:/Login/login.html?error=" + encode("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!");
        }

        User user = authDAO.login(u, p);
        if (user != null) {
            session.setAttribute("account", user);
            session.setMaxInactiveInterval(3600);
            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return "redirect:/Admin/QuanLyPhim.html";
            }
            return "redirect:/Home/index.html";
        }

        return "redirect:/Login/login.html?error=" + encode("Tài khoản hoặc mật khẩu không đúng!");
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
