package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.ShowtimeDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/showtimes", "/showtimes"})
public class ShowtimesServlet extends HttpServlet {
    private ShowtimeDAO showtimeDAO;

    @Override
    public void init() {
        showtimeDAO = new ShowtimeDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);
        int movieId = parseInt(req.getParameter("movieId"), 0);

        if (movieId <= 0) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"movieId không hợp lệ hoặc thiếu tham số!\"}");
            return;
        }

        try {
            List<Map<String, Object>> showtimes = showtimeDAO.findByMovieId(movieId);
            writeJson(resp, HttpServletResponse.SC_OK, toJsonArray(showtimes));
        } catch (SQLException e) {
            e.printStackTrace();
            writeJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "{\"error\":\"Không thể lấy danh sách suất chiếu từ CSDL\"}");
        }
    }

    private static int parseInt(String value, int defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static void prepareJson(HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setContentType("application/json; charset=UTF-8");
    }

    private static void applyApiHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void writeJson(HttpServletResponse resp, int status, String json) throws IOException {
        resp.setStatus(status);
        resp.getWriter().write(json);
    }

    private static String toJsonArray(List<Map<String, Object>> rows) {
        if (rows == null) return "[]";
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < rows.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            json.append(toJsonObject(rows.get(i)));
        }
        return json.append(']').toString();
    }

    private static String toJsonObject(Map<String, Object> row) {
        if (row == null) return "{}";
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (!first) {
                json.append(',');
            }
            first = false;
            json.append('"').append(escape(entry.getKey())).append("\":").append(toJsonValue(entry.getValue()));
        }
        return json.append('}').toString();
    }

    private static String toJsonValue(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        return '"' + escape(value.toString()) + '"';
    }

    private static String escape(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}