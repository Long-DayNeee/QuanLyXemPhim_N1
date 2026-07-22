package com.duanweb.duanweb;

import java.sql.Connection;

import com.duanweb.duanweb.util.DBConnection;

public class App {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection()) {
            System.out.println("✅ Kết nối MySQL thành công!");
        } catch (Exception e) {
            System.err.println("❌ Kết nối thất bại:");
            e.printStackTrace();
        }
    }

    public boolean someMethod() {
        return true;
    }
}