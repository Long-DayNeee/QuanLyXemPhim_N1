package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class LoginController {

    @Autowired
    private AuthService authService;

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/Login/login.html";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {

        if (session != null) {
            session.invalidate();
        }

        return "redirect:/Login/login.html?message=" + encode("Đã đăng xuất");
    }

    @PostMapping("/login")
    public String login(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            HttpServletRequest request) {

        username = username == null ? "" : username.trim();
        password = password == null ? "" : password.trim();

        if (username.isEmpty() || password.isEmpty()) {
            return "redirect:/Login/login.html?error="
                    + encode("Vui lòng nhập đầy đủ thông tin!");
        }

        HttpSession session = request.getSession(true);

        //======================
        // Đăng nhập bảng USER
        //======================

        User user = authService.login(username, password);

        if (user != null) {

            session.setAttribute("role", user.getRole());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("email", user.getEmail());
            session.setMaxInactiveInterval(60 * 60);

            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return "redirect:/Admin/QuanLyPhim.html";
            }

            return "redirect:/Home/index.html";
        }

        //=========================
        // Đăng nhập bảng ADMINACCOUNT
        //=========================

        AdminAccount admin = authService.loginAdmin(username, password);

        if (admin != null) {

            session.setAttribute("role", "ADMIN");
            session.setAttribute("username", admin.getUsername());
            session.setAttribute("email", admin.getEmail());
            session.setAttribute("accountID", admin.getAccountID());
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