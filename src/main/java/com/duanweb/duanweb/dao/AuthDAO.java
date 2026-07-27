package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuthDAO {

    private final JdbcTemplate jdbcTemplate;

    public AuthDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public User login(String username, String password) {
        String sql = "SELECT UserID, TenDangNhap, MatKhau, HoTen, Email FROM UserAccount WHERE TenDangNhap = ? AND MatKhau = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new User(
                    rs.getInt("UserID"),
                    rs.getString("TenDangNhap"),
                    rs.getString("MatKhau"),
                    rs.getString("HoTen"),
                    rs.getString("Email"),
                    "USER"
            ), username, password);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public boolean checkUserExists(String value) {
        String sql = "SELECT COUNT(*) FROM UserAccount WHERE TenDangNhap = ? OR Email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, value, value);
        return count != null && count > 0;
    }

    public boolean register(User user) {
        return addUser(user);
    }

    public boolean addUser(User user) {
        String sql = "INSERT INTO UserAccount (TenDangNhap, MatKhau, HoTen, Email) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql, user.getUsername(), user.getPassword(), user.getFullName(), user.getEmail()) > 0;
    }

    public boolean deleteUser(int userId) {
        return jdbcTemplate.update("DELETE FROM UserAccount WHERE UserID = ?", userId) > 0;
    }

    public boolean checkUsernameExists(String username) {
        String sql = "SELECT COUNT(*) FROM AdminAccount WHERE TenNguoiDung = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, username);
        return count != null && count > 0;
    }

    public boolean addAdminAccount(AdminAccount account) {
        String sql = "INSERT INTO AdminAccount (TenNguoiDung, MatKhau, VaiTro) VALUES (?, ?, ?)";
        return jdbcTemplate.update(sql, account.getUsername(), account.getPassword(), account.getRole()) > 0;
    }

    public boolean deleteAdminAccount(int adminId) {
        return jdbcTemplate.update("DELETE FROM AdminAccount WHERE AdminID = ?", adminId) > 0;
    }

    public LoginResult authenticate(String username, String password) {
        String sql = "SELECT MatKhau FROM AdminAccount WHERE TenNguoiDung = ?";
        String storedPassword;
        try {
            storedPassword = jdbcTemplate.queryForObject(sql, String.class, username);
        } catch (EmptyResultDataAccessException e) {
            return LoginResult.USER_NOT_FOUND;
        }
        
        // Đảm bảo storedPassword không bị null trước khi gọi equals
        if (storedPassword == null) {
            return LoginResult.INVALID_PASSWORD;
        }
        
        return storedPassword.equals(password) ? LoginResult.OK : LoginResult.INVALID_PASSWORD;
    }

    public enum LoginResult {
        OK,
        USER_NOT_FOUND,
        INVALID_PASSWORD
    }
}