package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.AuthDAO;
import com.duanweb.duanweb.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet("/api/admin/users/*")
public class UserApiServlet extends HttpServlet {

    private static final Pattern JSON_FIELD = Pattern.compile("\\\"([^\\\"]+)\\\"\\s*:\\s*(\\\"([^\\\"]*)\\\"|[-]?\\d+([.]\\d+)?)");
    private final AuthDAO authDAO = new AuthDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        applyApiHeaders(resp);
        resp.setContentType("application/json; charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // Đọc dữ liệu (Hỗ trợ cả JSON body lẫn Form Data)
        Map<String, String> body = parseJsonBody(req);

        String username = body.getOrDefault("username", req.getParameter("username"));
        String email    = body.getOrDefault("email", req.getParameter("email"));
        String password = body.getOrDefault("password", req.getParameter("password"));
        String role     = body.getOrDefault("role", req.getParameter("role"));

        // Validate dữ liệu
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"status\": \"error\", \"message\": \"Email và Password không được để trống!\"}");
            return;
        }

        if (authDAO.checkUserExists(email)) {
            resp.setStatus(HttpServletResponse.SC_CONFLICT);
            out.print("{\"status\": \"error\", \"message\": \"Email đã tồn tại!\"}");
            return;
        }

        // Tạo object User & lưu xuống DB
        User newUser = new User();
        newUser.setUsername(username != null ? username.trim() : "");
        newUser.setEmail(email.trim());
        newUser.setPassword(password.trim());
        newUser.setRole(role != null && !role.isBlank() ? role.trim() : "USER");

        boolean isSuccess = authDAO.addUser(newUser);

        if (isSuccess) {
            resp.setStatus(HttpServletResponse.SC_CREATED);
            out.print("{\"status\": \"success\", \"message\": \"Thêm tài khoản thành công!\"}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"status\": \"error\", \"message\": \"Thêm tài khoản thất bại!\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        applyApiHeaders(resp);
        resp.setContentType("application/json; charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // Lấy id từ URL Parameter (?id=123)
        String idParam = req.getParameter("id");

        if (idParam == null || idParam.isBlank()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"status\": \"error\", \"message\": \"Thiếu tham số ID tài khoản!\"}");
            return;
        }

        try {
            int userId = Integer.parseInt(idParam.trim());
            boolean isSuccess = authDAO.deleteUser(userId);

            if (isSuccess) {
                resp.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"status\": \"success\", \"message\": \"Xóa tài khoản thành công!\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"status\": \"error\", \"message\": \"Không tìm thấy tài khoản để xóa!\"}");
            }
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"status\": \"error\", \"message\": \"ID không hợp lệ!\"}");
        }
    }

    // ====== TIỆN ÍCH CẤU HÌNH HEADERS & PARSE JSON ======

    private static void applyApiHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
            result.put(matcher.group(1), matcher.group(3) != null ? matcher.group(3) : matcher.group(2));
        }
        return result;
    }
}