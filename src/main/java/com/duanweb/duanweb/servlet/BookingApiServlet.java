package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.BookingDAO;
import com.duanweb.duanweb.dao.BookingDAO.BookingResult;
import com.duanweb.duanweb.dao.BookingDAO.InvalidBookingException;
import com.duanweb.duanweb.dao.BookingDAO.SeatTakenException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * API đặt vé.
 *  - POST /api/bookings           body JSON: {showtimeId, seats:["A1","A2"], customer, phone, email}
 *  - GET  /api/bookings?bookingId=123     -> chi tiết 1 booking (dùng cho trang hoá đơn)
 *  - GET  /api/bookings?showtimeId=45     -> danh sách mã ghế đã bị đặt của suất chiếu đó (vẽ sơ đồ ghế)
 */
@WebServlet(urlPatterns = "/api/bookings")
public class BookingApiServlet extends HttpServlet {

    // Regex đơn giản để tách field dạng "key":"value" hoặc "key":123 hoặc "key":[...]
    private static final Pattern JSON_STRING_OR_NUMBER =
            Pattern.compile("\"([^\"]+)\"\\s*:\\s*(\"([^\"]*)\"|-?\\d+(?:\\.\\d+)?)");
    private static final Pattern JSON_ARRAY = Pattern.compile("\"seats\"\\s*:\\s*\\[(.*?)\\]", Pattern.DOTALL);
    private static final Pattern ARRAY_ITEM = Pattern.compile("\"([^\"]*)\"");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{9}$");

    private final BookingDAO bookingDAO = new BookingDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);
        try {
            String bookingIdParam = req.getParameter("bookingId");
            if (bookingIdParam != null && !bookingIdParam.isBlank()) {
                long bookingId = Long.parseLong(bookingIdParam.trim());
                Map<String, Object> detail = bookingDAO.findBookingDetail(bookingId);
                if (detail == null) {
                    writeJson(resp, HttpServletResponse.SC_NOT_FOUND, "{\"error\":\"Không tìm thấy booking\"}");
                    return;
                }
                writeJson(resp, HttpServletResponse.SC_OK, toJson(detail));
                return;
            }

            String showtimeIdParam = req.getParameter("showtimeId");
            if (showtimeIdParam != null && !showtimeIdParam.isBlank()) {
                int showtimeId = Integer.parseInt(showtimeIdParam.trim());
                List<String> booked = bookingDAO.findBookedSeatCodes(showtimeId);
                writeJson(resp, HttpServletResponse.SC_OK, seatsArrayJson(booked));
                return;
            }

            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    "{\"error\":\"Thiếu bookingId hoặc showtimeId\"}");
        } catch (NumberFormatException e) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"id không hợp lệ\"}");
        } catch (SQLException e) {
            throw new ServletException("Lỗi truy vấn booking", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);

        String rawBody = readBody(req);
        int showtimeId = parseInt(extractString(rawBody, "showtimeId"), 0);
        List<String> seats = extractSeats(rawBody);
        String customer = extractString(rawBody, "customer");
        String phone = extractString(rawBody, "phone");
        String email = extractString(rawBody, "email");

        if (showtimeId <= 0) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"ok\":false,\"error\":\"Thiếu showtimeId\"}");
            return;
        }
        if (seats.isEmpty()) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"ok\":false,\"error\":\"Vui lòng chọn ghế\"}");
            return;
        }
        if (customer == null || customer.isBlank()) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"ok\":false,\"error\":\"Vui lòng nhập họ tên\"}");
            return;
        }
        if (phone == null || !PHONE_PATTERN.matcher(phone).matches()) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"ok\":false,\"error\":\"Số điện thoại không hợp lệ\"}");
            return;
        }

        try {
            BookingResult result = bookingDAO.createBooking(showtimeId, seats, customer, phone, email);
            String json = "{\"ok\":true,\"bookingId\":" + result.bookingId
                    + ",\"seats\":" + seatsArrayJson(result.seats)
                    + ",\"total\":" + result.total.toPlainString() + "}";
            writeJson(resp, HttpServletResponse.SC_OK, json);
        } catch (InvalidBookingException e) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    "{\"ok\":false,\"error\":\"" + escape(e.getMessage()) + "\"}");
        } catch (SeatTakenException e) {
            // 409 Conflict: ghế đã có người khác đặt trước trong lúc mình đang xử lý
            writeJson(resp, HttpServletResponse.SC_CONFLICT,
                    "{\"ok\":false,\"error\":\"" + escape(e.getMessage())
                            + "\",\"conflictSeats\":" + seatsArrayJson(e.getConflictSeats()) + "}");
        } catch (SQLException e) {
            throw new ServletException("Không thể đặt vé", e);
        }
    }

    // ================= Helpers =================

    private static String readBody(HttpServletRequest req) throws IOException {
        StringBuilder raw = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                raw.append(line);
            }
        }
        return raw.toString();
    }

    private static String extractString(String rawBody, String key) {
        Matcher m = JSON_STRING_OR_NUMBER.matcher(rawBody);
        while (m.find()) {
            if (m.group(1).equals(key)) {
                return m.group(3) != null ? m.group(3) : m.group(2);
            }
        }
        return "";
    }

    /** Đọc "seats":["A1","A2"] dạng mảng JSON. Nếu client lỡ gửi "seats":"A1,A2" (chuỗi) vẫn hỗ trợ luôn cho tiện test bằng curl. */
    private static List<String> extractSeats(String rawBody) {
        List<String> seats = new ArrayList<>();
        Matcher arrayMatcher = JSON_ARRAY.matcher(rawBody);
        if (arrayMatcher.find()) {
            Matcher item = ARRAY_ITEM.matcher(arrayMatcher.group(1));
            while (item.find()) {
                String s = item.group(1).trim();
                if (!s.isEmpty()) seats.add(s);
            }
            return seats;
        }
        // fallback: "seats":"A1,A2"
        String plain = extractString(rawBody, "seats");
        if (!plain.isBlank()) {
            for (String part : plain.split(",")) {
                String s = part.trim();
                if (!s.isEmpty()) seats.add(s);
            }
        }
        return seats;
    }

    private static int parseInt(String value, int defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            return (int) Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static String seatsArrayJson(List<String> seats) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < seats.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escape(seats.get(i))).append("\"");
        }
        return sb.append("]").toString();
    }

    private static String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(escape(e.getKey())).append("\":");
            Object v = e.getValue();
            if (v == null) {
                sb.append("null");
            } else if (v instanceof Number || v instanceof BigDecimal) {
                sb.append(v.toString());
            } else if (v instanceof List<?> list) {
                List<String> strList = new ArrayList<>();
                for (Object o : list) strList.add(String.valueOf(o));
                sb.append(seatsArrayJson(strList));
            } else {
                sb.append("\"").append(escape(v.toString())).append("\"");
            }
        }
        return sb.append("}").toString();
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    private static void prepareJson(HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setContentType("application/json; charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");
    }

    private static void applyApiHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void writeJson(HttpServletResponse resp, int status, String json) throws IOException {
        resp.setStatus(status);
        resp.getWriter().write(json);
    }
}