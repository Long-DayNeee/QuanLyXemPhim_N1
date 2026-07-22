package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.ShowtimeDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AddShowtimeServlet extends HttpServlet {
    private static final Pattern JSON_FIELD = Pattern.compile("\\\"([^\\\"]+)\\\"\\s*:\\s*(\\\"([^\\\"]*)\\\"|[-]?\\d+([.]\\d+)?)");
    private ShowtimeDAO dao;

    @Override
    public void init() {
        dao = new ShowtimeDAO();
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
        int movieId = parseInt(body.get("movieId"), 0);
        
        // Thêm roomId (mặc định lấy phòng số 1 nếu client không truyền lên)
        int roomId = parseInt(body.get("roomId"), 1); 
        int seats = parseInt(body.get("seats"), 72);
        
        String dateValue = body.getOrDefault("date", "");
        String timeValue = body.getOrDefault("time", "");

        if (movieId <= 0 || dateValue.isBlank() || timeValue.isBlank()) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"Thiếu movieId hoặc date/time\"}");
            return;
        }

        try {
            LocalDate date = LocalDate.parse(dateValue);
            LocalTime time = LocalTime.parse(timeValue);
            
            // Tạm tính thời gian kết thúc cách giờ bắt đầu 2 tiếng (ví dụ phim dài 120 phút)
            LocalTime endTime = time.plusHours(2); 

            // Cập nhật lại lời gọi hàm DAO khớp với cấu trúc bảng Showtime (MovieID, RoomID, ThoiGianBatDau, ThoiGianKetThuc,...)
            long id = dao.insertFull(movieId, roomId, date, time, endTime, seats);
            
            writeJson(resp, HttpServletResponse.SC_OK, "{\"ok\":true,\"id\":" + id + "}");
        } catch (DateTimeParseException e) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"Định dạng date/time không hợp lệ\"}");
        } catch (SQLException e) {
            throw new ServletException("Không thể thêm suất chiếu", e);
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
            result.put(matcher.group(1), matcher.group(3) != null ? matcher.group(3) : matcher.group(2));
        }
        return result;
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