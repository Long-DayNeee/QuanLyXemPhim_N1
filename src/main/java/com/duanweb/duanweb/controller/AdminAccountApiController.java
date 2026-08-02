package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/account")
public class AdminAccountApiController {

    private final AuthService authService;

    public AdminAccountApiController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllAccounts() {
        return ResponseEntity.ok(authService.getAllAccounts());
    }


    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody(required = false)
            Map<String, String> body,

            @RequestParam(value = "username", required = false)
            String usernameParam,

            @RequestParam(value = "password", required = false)
            String passwordParam,

            @RequestParam(value = "fullName", required = false)
            String fullNameParam,

            @RequestParam(value = "email", required = false)
            String emailParam,

            @RequestParam(value = "role", required = false)
            String roleParam) {

        String username = value(body, "username", usernameParam);
        String password = value(body, "password", passwordParam);
        String fullName = value(body, "fullName", fullNameParam);
        String email = value(body, "email", emailParam);
        String role = value(body, "role", roleParam);

        // Kiểm tra username và password
        if (username == null || username.isBlank()
                || password == null || password.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "status", "error",
                            "message", "Username và Password không được để trống!"
                    ));
        }

        // Kiểm tra username/email đã tồn tại
        if (authService.checkUserExists(username)) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "status", "error",
                            "message", "Tên tài khoản đã tồn tại!"
                    ));
        }

        // Tạo User mới
        User user = new User();

        user.setUsername(username);
        user.setPassword(password);
        user.setFullName(fullName != null ? fullName : "");
        user.setEmail(email != null ? email : "");

        // Nếu không truyền role thì mặc định là USER
        user.setRole(
                role != null && !role.isBlank()
                        ? role
                        : "USER"
        );

        // Lưu vào user_account
        if (authService.addUser(user) != null) {

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "status", "success",
                            "message", "Thêm tài khoản thành công!"
                    ));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", "error",
                        "message", "Thêm tài khoản thất bại!"
                ));
    }



    @DeleteMapping
    public ResponseEntity<?> delete(
            @RequestParam(value = "id", required = false)
            String idParam) {

        if (idParam == null || idParam.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "status", "error",
                            "message", "Thiếu tham số id tài khoản!"
                    ));
        }

        try {

            int userId = Integer.parseInt(idParam.trim());

            if (authService.deleteUser(userId)) {

                return ResponseEntity.ok(
                        Map.of(
                                "status", "success",
                                "message", "Xóa tài khoản thành công!"
                        )
                );
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "status", "error",
                                    "message", "Không tìm thấy tài khoản!"
                            )
                    );

        } catch (NumberFormatException e) {

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "status", "error",
                                    "message", "ID không hợp lệ!"
                            )
                    );
        }
    }


    private static String value(
            Map<String, String> body,
            String name,
            String fallback) {

        if (body != null && body.get(name) != null) {
            return body.get(name);
        }

        return fallback;
    }
}