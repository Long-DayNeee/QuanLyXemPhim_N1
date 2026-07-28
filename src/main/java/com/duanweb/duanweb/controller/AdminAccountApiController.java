package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.AdminAccount;
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
@RequestMapping("/api/admin/account")
public class AdminAccountApiController {

    private final AuthService authService;

    public AdminAccountApiController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody(required = false) Map<String, String> body,
                                    @RequestParam(value = "username", required = false) String usernameParam,
                                    @RequestParam(value = "password", required = false) String passwordParam,
                                    @RequestParam(value = "fullName", required = false) String fullNameParam,
                                    @RequestParam(value = "email", required = false) String emailParam,
                                    @RequestParam(value = "role", required = false) String roleParam) {
        String username = value(body, "username", usernameParam);
        String password = value(body, "password", passwordParam);
        String fullName = value(body, "fullName", fullNameParam);
        String email = value(body, "email", emailParam);
        String role = value(body, "role", roleParam);

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Username và Password không được để trống!"));
        }

        if (authService.checkUsernameExists(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("status", "error", "message", "Tên tài khoản đã tồn tại!"));
        }

        AdminAccount acc = new AdminAccount();
        acc.setUsername(username);
        acc.setPassword(password);
        acc.setFullName(fullName != null ? fullName : "");
        acc.setEmail(email != null ? email : "");
        acc.setRole(role != null && !role.isBlank() ? role : "ADMIN");

        if (authService.addAdminAccount(acc) != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "success", "message", "Thêm tài khoản admin thành công!"));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error", "message", "Thêm thất bại từ CSDL!"));
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam(value = "id", required = false) String idParam) {
        if (idParam == null || idParam.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Thiếu tham số id tài khoản!"));
        }

        try {
            int accountID = Integer.parseInt(idParam.trim());
            if (authService.deleteAdminAccount(accountID)) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "Xóa tài khoản thành công!"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("status", "error", "message", "Không tìm thấy ID tài khoản để xóa!"));
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