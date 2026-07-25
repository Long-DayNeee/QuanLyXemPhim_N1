package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.AuthDao;
import com.duanweb.duanweb.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RegisterController {
    private final AuthDao authDAO;

    public RegisterController(AuthDao authDAO) {
        this.authDAO = authDAO;
    }

    @GetMapping("/register")
    public String registerPage() {
        return "forward:/Login/register.html";
    }

    @PostMapping("/register")
    public String register(@RequestParam(value = "username", required = false) String username,
                           @RequestParam(value = "password", required = false) String password,
                           @RequestParam(value = "fullName", required = false) String fullName,
                           HttpServletRequest request,
                           HttpSession session) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            request.setAttribute("error", "Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu!");
            request.setAttribute("fullName", fullName);
            return "forward:/Login/register.html";
        }

        String u = username.trim();
        String p = password.trim();
        String name = fullName != null ? fullName.trim() : "";

        if (authDAO.checkUserExists(u)) {
            request.setAttribute("error", "Tên tài khoản này đã có người sử dụng!");
            request.setAttribute("fullName", name);
            return "forward:/Login/register.html";
        }

        User newUser = new User(u, p, name);
        boolean isSuccess = authDAO.register(newUser);
        if (isSuccess) {
            session.setAttribute("message", "Đăng ký thành công! Hãy đăng nhập ngay.");
            return "redirect:/Login/register.html";
        }

        request.setAttribute("error", "Đã xảy ra lỗi trong quá trình lưu dữ liệu. Vui lòng thử lại!");
        return "forward:/Login/register.html";
    }
}