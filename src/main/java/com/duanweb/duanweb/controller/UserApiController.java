package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.AuthDao;
import com.duanweb.duanweb.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserApiController {

    private final AuthDao authDAO;

    public UserApiController(AuthDao authDAO) {
        this.authDAO = authDAO;
    }

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

        if (authDAO.checkUserExists(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("status", "error", "message", "Email đã tồn tại!"));
        }

        User newUser = new User();
        newUser.setUsername(username != null ? username.trim() : "");
        newUser.setEmail(email.trim());
        newUser.setPassword(password.trim());
        newUser.setRole(role != null && !role.isBlank() ? role.trim() : "USER");

        if (authDAO.addUser(newUser)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "message", "Thêm tài khoản thành công!"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error", "message", "Thêm tài khoản thất bại!"));
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam(value = "id", required = false) String idParam) {
        if (idParam == null || idParam.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Thiếu tham số ID tài khoản!"));
        }

        try {
            int userId = Integer.parseInt(idParam.trim());
            if (authDAO.deleteUser(userId)) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "Xóa tài khoản thành công!"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("status", "error", "message", "Không tìm thấy tài khoản để xóa!"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "ID không hợp lệ!"));
        }
    }

    private static String value(Map<String, String> body, String name, String fallback) {
        if (body != null && body.get(name) != null) {
            return body.get(name);
        }
        return fallback;
    }
}