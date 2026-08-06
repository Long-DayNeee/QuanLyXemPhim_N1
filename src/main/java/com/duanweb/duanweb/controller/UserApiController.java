package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserApiController {

    private final AuthService authService;

    public UserApiController(AuthService authService) {
        this.authService = authService;
    }

    // ===== GET ALL =====
    @GetMapping
    public List<User> getAllUsers() {
        return authService.getAllUsers();
    }

    // ===== GET BY ID =====
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        User user = authService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "Không tìm thấy user!"));
        }
        return ResponseEntity.ok(user);
    }

    // ===== CREATE =====
    @PostMapping
    public ResponseEntity<?> create(@RequestBody(required = false) Map<String, String> body,
                                    @RequestParam(value = "username", required = false) String usernameParam,
                                    @RequestParam(value = "email", required = false) String emailParam,
                                    @RequestParam(value = "password", required = false) String passwordParam,
                                    @RequestParam(value = "role", required = false) String roleParam) {
        String username = value(body, "username", usernameParam);
        String email = value(body, "email", emailParam);
        String password = value(body, "password", passwordParam);
        String role = value(body, "role", roleParam);

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Email và Password không được để trống!"));
        }

        if (authService.checkUserExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("status", "error", "message", "Email đã tồn tại!"));
        }

        User newUser = new User();
        newUser.setUsername(username != null ? username.trim() : "");
        newUser.setEmail(email.trim());
        newUser.setPassword(password.trim());
        newUser.setRole(role != null && !role.isBlank() ? role.trim() : "USER");

        if (authService.addUser(newUser) != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "message", "Thêm tài khoản thành công!"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error", "message", "Thêm tài khoản thất bại!"));
    }

    // ===== UPDATE =====
    @PutMapping("/{id}")  // ← SỬA: Thêm ID vào URL
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody User user) {
        user.setId(id);  // ← THÊM DÒNG NÀY

        User result = authService.updateUser(user);

        if (result == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không tìm thấy User"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Cập nhật thành công"
        ));
    }

    // ===== DELETE =====
    @DeleteMapping("/{id}")  // ← SỬA: Thêm ID vào URL
    public ResponseEntity<?> delete(@PathVariable int id) {
        if (authService.deleteUser(id)) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Xóa tài khoản thành công!"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("status", "error", "message", "Không tìm thấy tài khoản để xóa!"));
    }

    private static String value(Map<String, String> body, String name, String fallback) {
        if (body != null && body.get(name) != null) {
            return body.get(name);
        }
        return fallback;
    }
}