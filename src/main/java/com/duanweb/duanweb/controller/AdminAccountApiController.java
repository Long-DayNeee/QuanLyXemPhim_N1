package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.AuthService;
import com.duanweb.duanweb.model.AdminAccount;
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

    // ================= THỐNG KÊ =================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        return ResponseEntity.ok(authService.getDashboardStats());
    }

    // ================= KHÁCH HÀNG =================

    @GetMapping("/customers")
    public List<User> getCustomers() {
        return authService.getCustomers();
    }

    // ================= NHÂN VIÊN =================

    @GetMapping("/staff")
    public List<AdminAccount> getStaff() {
        return authService.getAllAdmins();
    }

    // ================= LẤY USER =================

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable int id) {

        User user = authService.getUserById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", "error",
                            "message", "Không tìm thấy khách hàng!"
                    ));
        }

        return ResponseEntity.ok(user);
    }

    // ================= LẤY ADMIN =================

    @GetMapping("/staff/{id}")
    public ResponseEntity<?> getAdmin(@PathVariable int id) {

        AdminAccount admin = authService.getAdminById(id);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", "error",
                            "message", "Không tìm thấy nhân viên!"
                    ));
        }

        return ResponseEntity.ok(admin);
    }

    // ================= SỬA USER =================

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable int id,
            @RequestBody User user) {

        user.setId(id);

        User result = authService.updateUser(user);

        if (result == null) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "status", "error",
                            "message", "Không tìm thấy khách hàng!"
                    ));
        }

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "Cập nhật khách hàng thành công!"
                ));
    }

    // ================= SỬA NHÂN VIÊN =================

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable int id,
            @RequestBody AdminAccount admin) {

        admin.setAccountID(id);

        System.out.println("===== UPDATE STAFF =====");
        System.out.println("Path ID = " + id);
        System.out.println("AccountID = " + admin.getAccountID());
        System.out.println("Username = " + admin.getUsername());
        System.out.println("FullName = " + admin.getFullName());
        System.out.println("Email = " + admin.getEmail());
        System.out.println("Role = " + admin.getRole());
        System.out.println("========================");

        AdminAccount result = authService.updateAdminAccount(admin);

        if (result == null) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "status", "error",
                            "message", "Không tìm thấy nhân viên!"
                    ));
        }

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "Cập nhật nhân viên thành công!"
                ));
    }

    // ================= XÓA KHÁCH HÀNG =================

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {

        if (authService.deleteUser(id)) {

            return ResponseEntity.ok(
                    Map.of(
                            "status", "success",
                            "message", "Xóa khách hàng thành công!"
                    ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(
                        Map.of(
                                "status", "error",
                                "message", "Không tìm thấy khách hàng!"
                        )
                );
    }

    // ================= XÓA NHÂN VIÊN =================

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable int id) {

        if (authService.deleteAdminAccount(id)) {

            return ResponseEntity.ok(
                    Map.of(
                            "status", "success",
                            "message", "Xóa nhân viên thành công!"
                    ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(
                        Map.of(
                                "status", "error",
                                "message", "Không tìm thấy nhân viên!"
                        )
                );
    }

}