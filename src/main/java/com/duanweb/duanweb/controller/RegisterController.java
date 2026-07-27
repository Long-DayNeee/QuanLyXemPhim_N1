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
    public String register(@RequestParam(value = "username", required = false) String username,
                           @RequestParam(value = "password", required = false) String password,
                           @RequestParam(value = "fullName", required = false) String fullName) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return "redirect:/Login/register.html?error=" + encode("Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu!");
        }

        String u = username.trim();
        String p = password.trim();
        String name = fullName != null ? fullName.trim() : "";

        if (authDAO.checkUserExists(u)) {
            return "redirect:/Login/register.html?error=" + encode("Tên tài khoản này đã có người sử dụng!");
        }

        User newUser = new User(u, p, name);
        boolean isSuccess = authDAO.register(newUser);
        if (isSuccess) {
            return "redirect:/Login/register.html?message=" + encode("Đăng ký thành công! Hãy đăng nhập ngay.");
        }

        return "redirect:/Login/register.html?error=" + encode("Đã xảy ra lỗi trong quá trình lưu dữ liệu. Vui lòng thử lại!");
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
