package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.ShowtimeDao;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestController
public class AddShowtimeServlet {

    private final ShowtimeDao dao;

    public AddShowtimeServlet(ShowtimeDao dao) {
        this.dao = dao;
    }

    @PostMapping("/api/add-showtime")
    public ResponseEntity<?> addShowtime(@RequestBody Map<String, Object> body) {
        int movieId = parseInt(body.get("movieId"), 0);
        int roomId = parseInt(body.get("roomId"), 1);
        int seats = parseInt(body.get("seats"), 72);
        String dateValue = body.getOrDefault("date", "").toString();
        String timeValue = body.getOrDefault("time", "").toString();

        if (movieId <= 0 || dateValue.isBlank() || timeValue.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Thiếu movieId hoặc date/time"));
        }

        try {
            LocalDate date = LocalDate.parse(dateValue);
            LocalTime time = LocalTime.parse(timeValue);
            LocalTime endTime = time.plusHours(2);
            long id = dao.insertFull(movieId, roomId, date, time, endTime, seats);
            if (id > 0) {
                return ResponseEntity.ok(Map.of("ok", true, "id", id));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "Không thể thêm suất chiếu vào CSDL"));
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Định dạng date/time không hợp lệ"));
        }
    }

    private static int parseInt(Object value, int defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}