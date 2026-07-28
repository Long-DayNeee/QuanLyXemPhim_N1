package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.AuthDAO;
import com.duanweb.duanweb.model.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class RegisterController {

    private final AuthDAO authDAO;

    public RegisterController(AuthDAO authDAO) {
        this.authDAO = authDAO;
    }

    @GetMapping("/register")
    public String registerPage() {
        return "forward:/Login/register.html";
    }

    @PostMapping("/register")
    public String register(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String fullName,
            @RequestParam(required = false) String email) {

        username = username.trim();
        password = password.trim();
        fullName = fullName.trim();

        if (email == null) {
            email = "";
        } else {
            email = email.trim();
        }

        if (username.isEmpty() || password.isEmpty() || fullName.isEmpty()) {
            return "redirect:/Login/register.html?error="
                    + encode("Vui lòng nhập đầy đủ thông tin!");
        }

        if (authDAO.checkUserExists(username)) {
            return "redirect:/Login/register.html?error="
                    + encode("Tên đăng nhập đã tồn tại!");
        }

        User user = new User(username, password, fullName, email);

        if (authDAO.register(user)) {
            return "redirect:/Login/login.html?success="
                    + encode("Đăng ký thành công!");
        }

        return "redirect:/Login/register.html?error="
                + encode("Đăng ký thất bại!");
    }

    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }
}