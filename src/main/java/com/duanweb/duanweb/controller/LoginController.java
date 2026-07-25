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
public class LoginController {

    private final AuthDao authDAO;

    public LoginController(AuthDao authDAO) {
        this.authDAO = authDAO;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/Login/login.html";
    }

    @PostMapping("/login")
    public String login(@RequestParam(value = "username", required = false) String username,
                        @RequestParam(value = "password", required = false) String password,
                        HttpServletRequest request,
                        HttpSession session) {
        String u = username != null ? username.trim() : "";
        String p = password != null ? password.trim() : "";

        if (u.isBlank() || p.isBlank()) {
            request.setAttribute("error", "Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!");
            return "forward:/Login/login.html";
        }

        User user = authDAO.login(u, p);
        if (user != null) {
            session.setAttribute("account", user);
            session.setMaxInactiveInterval(3600);
            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return "redirect:/Admin/QuanLyPhim.jsp";
            }
            return "redirect:/Home/home.html";
        }

        request.setAttribute("error", "Tài khoản hoặc mật khẩu không đúng!");
        return "forward:/Login/login.html";
    }
}