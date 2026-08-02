package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Entity.CinemaRoom;
import com.duanweb.duanweb.Entity.Showtime;
import com.duanweb.duanweb.Service.ShowtimeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

/**
 * Chuyen doi tu ShowtimesServlet (GET /api/showtimes, /showtimes) va AddShowtimeServlet (POST /api/add-showtime).
 */
@RestController
@RequestMapping("/api")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping({"/showtimes"})
    public ResponseEntity<?> getShowtimes(@RequestParam(value = "movieId", required = false, defaultValue = "0") int movieId) {
        if (movieId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "movieId không hợp lệ"));
        }
        List<Map<String, Object>> showtimes = showtimeService.findByMovieId(movieId);
        return ResponseEntity.ok(showtimes);
    }

    @PostMapping("/add-showtime")
    public ResponseEntity<?> addShowtime(@RequestBody Map<String, Object> body) {
        int movieId = parseInt(body.get("movieId"), 0);
        int roomId = parseInt(body.get("roomId"), 0);
        String dateValue = body.getOrDefault("date", "").toString();
        String timeValue = body.getOrDefault("time", "").toString();

        if (movieId <= 0 || roomId <= 0 || dateValue.isBlank() || timeValue.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Thiếu movieId, roomId hoặc date/time"));
        }

        try {
            Showtime showtime = showtimeService.addShowtime(movieId, roomId, dateValue, timeValue);
            return ResponseEntity.ok(Map.of("ok", true, "id", showtime.getShowTimeID()));
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Định dạng date/time không hợp lệ"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "Không thể thêm suất chiếu vào CSDL"));
        }
    }

    @DeleteMapping("/showtimes")
    public ResponseEntity<?> deleteShowtime(@RequestParam(value = "id", required = false, defaultValue = "0") int id) {
        if (id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id"));
        }
        showtimeService.delete(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    @GetMapping("/rooms")
    public ResponseEntity<?> getRooms() {
        return ResponseEntity.ok(showtimeService.findAllRooms());
    }

    @PostMapping("/add-room")
    public ResponseEntity<?> addRoom(@RequestBody Map<String, Object> body) {
        String tenPhong = body.getOrDefault("tenPhong", "").toString().trim();
        Integer tongChoNgoi = parseIntOrNull(body.get("tongChoNgoi"));
        String trangThai = body.getOrDefault("trangThai", "").toString().trim();

        try {
            CinemaRoom room = showtimeService.addRoom(tenPhong, tongChoNgoi, trangThai);
            return ResponseEntity.ok(Map.of("ok", true, "roomId", room.getRoomID()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        String tenPhong = body.getOrDefault("tenPhong", "").toString().trim();
        Integer tongChoNgoi = parseIntOrNull(body.get("tongChoNgoi"));
        String trangThai = body.getOrDefault("trangThai", "").toString().trim();

        try {
            CinemaRoom room = showtimeService.updateRoom(id, tenPhong, tongChoNgoi, trangThai);
            return ResponseEntity.ok(Map.of("ok", true, "roomId", room.getRoomID()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("ok", false, "error", e.getMessage()));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Integer id) {
        try {
            showtimeService.deleteRoom(id);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("ok", false, "error", e.getMessage()));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", e.getMessage()));
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

    private static Integer parseIntOrNull(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
