// package com.duanweb.duanweb.controller;

// import com.duanweb.duanweb.Service.AuthService;
// import com.duanweb.duanweb.model.AdminAccount;
// import com.duanweb.duanweb.model.User;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import jakarta.servlet.http.HttpSession;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Controller;
// import org.springframework.ui.Model;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestParam;

// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;

// @Controller
// public class LoginController {

//     @Autowired
//     HttpSession session;
//     @Autowired
//     HttpServletRequest request;
//     @Autowired
//     HttpServletResponse response;
//     @Autowired
//     AuthService authService;

//     public LoginController(AuthService authService) {
//         this.authService = authService;
//     }

//     @GetMapping("/login")
//     public String loginPage() {
//         return "forward:/Login/login.html";
//     }

//     @GetMapping("/logout")
//     public  String logout() {
//         session.invalidate();
//         return "redirect:/Login/login.html?message="+ encode("Đã đăng xuất");
//     }

//     @PostMapping("/login")
//     public String login(
//             @RequestParam(required = false) String username,
//             @RequestParam(required = false) String password,
//             Model model) {

//         username = username == null ? "" : username.trim();
//         password = password == null ? "" : password.trim();

//         if (username.isEmpty() || password.isEmpty()) {
//             return "redirect:/Login/login.html?error="
//                     + encode("Vui lòng nhập đầy đủ thông tin!");
//         }

//         session = request.getSession();
//         // ===== Đăng nhập USER =====
//         User user = authService.login(username, password);
//         if (user.getRole().equalsIgnoreCase("admin")) {
//             if (user != null) {
//                 session.setAttribute("role", user.getRole());
//                 session.setAttribute("username", user.getUsername());
//                 session.setAttribute("email", user.getEmail());
//                 session.setMaxInactiveInterval(60 * 60);
//                 return "redirect:/Admin/QuanLyPhim.html";
//             }
//         } else if (user.getRole().equalsIgnoreCase("user")) {
//             if (user != null) {
//                 session.setAttribute("role", user.getRole());
//                 session.setMaxInactiveInterval(60 * 60);

//                 return "redirect:/Home/index.html";

//             }
//         }
//         return "redirect:/Login/login.html?error="
//                 + encode("Sai tên đăng nhập hoặc mật khẩu!");
//     }

//     private String encode(String text) {
//         return URLEncoder.encode(text, StandardCharsets.UTF_8);
//     }
// }


package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class LoginController {

    @Autowired
    AuthService authService;

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/Login/login.html";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        if (session != null) {
            session.invalidate(); // Xóa sạch session
        }
        return "redirect:/Login/login.html?message=" + encode("Đã đăng xuất");
    }

    @PostMapping("/login")
    public String login(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            HttpServletRequest request) {

        username = (username == null) ? "" : username.trim();
        password = (password == null) ? "" : password.trim();

        if (username.isEmpty() || password.isEmpty()) {
            return "redirect:/Login/login.html?error="
                    + encode("Vui lòng nhập đầy đủ thông tin!");
        }

        // ===== Đăng nhập USER / ADMIN =====
        User user = authService.login(username, password);

        // 1. Kiểm tra nếu tài khoản hoặc mật khẩu không đúng (user == null)
        if (user == null) {
            return "redirect:/Login/login.html?error="
                    + encode("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 2. Tạo Session mới an toàn
        HttpSession session = request.getSession(true);
        session.setAttribute("role", user.getRole());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("email", user.getEmail());
        session.setMaxInactiveInterval(60 * 60); // Session sống 1 tiếng

        // 3. Điều hướng dựa theo Role
        if ("admin".equalsIgnoreCase(user.getRole())) {
            return "redirect:/Admin/QuanLyPhim.html";
        } else if ("user".equalsIgnoreCase(user.getRole())) {
            return "redirect:/Home/index.html";
        }

        // Trường hợp Role bị sai hỏng dữ liệu trong DB
        return "redirect:/Login/login.html?error=" + encode("Tài khoản chưa được phân quyền!");
    }

    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }
}