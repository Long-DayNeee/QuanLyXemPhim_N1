package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.AuthDAO;
import com.duanweb.duanweb.dao.AuthDAO.LoginResult;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LoginServlet extends HttpServlet {
    private static final Pattern JSON_FIELD = Pattern.compile("\\\"([^\\\"]+)\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"");
    private AuthDAO authDAO;

    @Override
    public void init() {
        authDAO = new AuthDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        applyApiHeaders(resp);
        resp.setContentType("application/json; charset=UTF-8");

        Map<String, String> body = parseJsonBody(req);
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "").trim();

        if (username.isEmpty() || password.isEmpty()) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"Tên hoặc mật khẩu không được để trống\"}");
            return;
        }

        try {
            LoginResult result = authDAO.authenticate(username, password);
            if (result == LoginResult.OK) {
                writeJson(resp, HttpServletResponse.SC_OK, "{\"ok\":true}");
            } else if (result == LoginResult.USER_NOT_FOUND) {
                writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, "{\"error\":\"Tên không tồn tại\"}");
            } else {
                writeJson(resp, HttpServletResponse.SC_UNAUTHORIZED, "{\"error\":\"Mật khẩu không đúng\"}");
            }
        } catch (SQLException e) {
            throw new ServletException("Không thể xác thực đăng nhập", e);
        }
    }

    private static Map<String, String> parseJsonBody(HttpServletRequest req) throws IOException {
        StringBuilder raw = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                raw.append(line);
            }
        }

        Map<String, String> result = new HashMap<>();
        Matcher matcher = JSON_FIELD.matcher(raw.toString());
        while (matcher.find()) {
            result.put(matcher.group(1), matcher.group(2));
        }
        return result;
    }

    private static void applyApiHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void writeJson(HttpServletResponse resp, int status, String json) throws IOException {
        resp.setStatus(status);
        resp.getWriter().write(json);
    }
}