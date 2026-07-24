package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import com.duanweb.duanweb.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AuthDAO {

    // ==========================================
    // XỬ LÝ DÀNH CHO USER (KHÁCH HÀNG)
    // ==========================================

    public User login(String username, String password) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setId(rs.getInt("id"));
                    user.setUsername(rs.getString("username"));
                    user.setPassword(rs.getString("password"));

                    // Tránh lỗi nếu cột fullName, email, role null hoặc không tồn tại
                    user.setFullName(rs.getString("fullName") != null ? rs.getString("fullName") : "");
                    try { user.setEmail(rs.getString("email")); } catch (Exception ignored) {}
                    try { user.setRole(rs.getString("role")); } catch (Exception e) { user.setRole("USER"); }

                    return user;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean checkUserExists(String identifier) {
        String sql = "SELECT id FROM users WHERE username = ? OR email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, identifier);
            ps.setString(2, identifier);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean register(User user) {
        String sql = "INSERT INTO users (username, password, fullName, email, role) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getFullName() != null ? user.getFullName() : "");
            ps.setString(4, user.getEmail() != null ? user.getEmail() : "");
            ps.setString(5, user.getRole() != null ? user.getRole() : "USER");

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean addUser(User user) {
        return register(user); // Tái sử dụng hàm register để tránh lặp code
    }

    public boolean deleteUser(int userId) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ==========================================
    // XỬ LÝ DÀNH CHO ADMINACCOUNT
    // ==========================================

    public boolean checkUsernameExists(String username) {
        String sql = "SELECT AccountID FROM AdminAccount WHERE Username = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean addAdminAccount(AdminAccount acc) {
        String sql = "INSERT INTO AdminAccount (Username, Password, FullName, Email, Role) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, acc.getUsername());
            ps.setString(2, acc.getPassword());
            ps.setString(3, acc.getFullName());
            ps.setString(4, acc.getEmail());
            ps.setString(5, acc.getRole() != null ? acc.getRole() : "ADMIN");

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteAdminAccount(int accountID) {
        String sql = "DELETE FROM AdminAccount WHERE AccountID = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, accountID);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}