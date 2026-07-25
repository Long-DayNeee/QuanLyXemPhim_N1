package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.ShowtimeDao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

/**
 * Chuyen doi tu ShowtimesServlet (GET /api/showtimes, /showtimes) va AddShowtimeServlet (POST /api/add-showtime).
 */
@RestController
@RequestMapping("/api")
public class ShowtimeController {

    private final ShowtimeDao showtimeDao;

    public ShowtimeController(ShowtimeDao showtimeDao) {
        this.showtimeDao = showtimeDao;
    }

    @GetMapping({"/showtimes"})
    public ResponseEntity<?> getShowtimes(@RequestParam(value = "movieId", required = false, defaultValue = "0") int movieId) {
        if (movieId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "movieId không hợp lệ"));
        }
        List<Map<String, Object>> showtimes = showtimeDao.findByMovieId(movieId);
        return ResponseEntity.ok(showtimes);
    }

    @DeleteMapping("/showtimes")
    public ResponseEntity<?> deleteShowtime(@RequestParam(value = "id", required = false, defaultValue = "0") int id) {
        if (id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id"));
        }
        showtimeDao.delete(id);
        return ResponseEntity.ok(Map.of("deleted", id));
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
