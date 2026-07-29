package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class RegisterController {

    private final AuthService authService;

    public RegisterController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/register")
    public String registerPage() {
        return "forward:/Login/register.html";
    }

    @PostMapping("/register")
    public String register(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String password2
    ) {

        fullName = fullName == null ? "" : fullName.trim();
        email = email == null ? "" : email.trim();
        username = username == null ? "" : username.trim();
        password = password == null ? "" : password.trim();
        password2 = password2 == null ? "" : password2.trim();

        // Kiểm tra dữ liệu
        if (fullName.isEmpty()
                || email.isEmpty()
                || username.isEmpty()
                || password.isEmpty() || password2.isEmpty()) {

            return "redirect:/Login/register.html?error="
                    + encode("Vui lòng nhập đầy đủ thông tin!");
        }

        // Kiểm tra tên đăng nhập hoặc email đã tồn tại
        if (authService.checkUserExists(username)
                || authService.checkUserExists(email)) {

            return "redirect:/Login/register.html?error="
                    + encode("Tên đăng nhập hoặc Email đã tồn tại!");
        }

        if(password.equals(password2)) {
            // Tạo User
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setUsername(username);
            user.setPassword(password);
            user.setRole("USER");

            // Lưu
            if (authService.register(user) != null) {
                return "redirect:/Login/login.html?message="
                        + encode("Đăng ký thành công! Vui lòng đăng nhập.");
            }
        }else{
            return "redirect:/Login/register.html?error="+ encode("Xác nhận mật khẩu chưa giống mật khẩu!");
        }


        return "redirect:/Login/register.html?error="
                + encode("Đăng ký thất bại!");
    }

    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }
}