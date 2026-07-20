package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AuthDAO {
    public LoginResult authenticate(String username, String password) throws SQLException {
        String sql = "SELECT MatKhau FROM Admin WHERE TenNguoiDung = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return LoginResult.USER_NOT_FOUND;
                }
                String storedPassword = rs.getString("MatKhau");
                if (!storedPassword.equals(password)) {
                    return LoginResult.INVALID_PASSWORD;
                }
                return LoginResult.OK;
            }
        }
    }

    public enum LoginResult {
        OK,
        USER_NOT_FOUND,
        INVALID_PASSWORD
    }
}