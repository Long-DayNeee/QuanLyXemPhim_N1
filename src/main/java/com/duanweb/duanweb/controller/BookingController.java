package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.BookingDAO;
import com.duanweb.duanweb.dao.BookingDAO.BookingResult;
import com.duanweb.duanweb.dao.BookingDAO.InvalidBookingException;
import com.duanweb.duanweb.dao.BookingDAO.SeatTakenException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Chuyen doi tu BookingApiServlet.
 *  - POST /api/bookings  body JSON: {showtimeId, seats:["A1","A2"], customer, phone, email}
 *  - GET  /api/bookings?bookingId=123   -> chi tiet 1 booking (dung cho trang hoa don)
 *  - GET  /api/bookings?showtimeId=45   -> danh sach ma ghe da bi dat cua suat chieu do (ve so do ghe)
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{9}$");

    private final BookingDAO bookingDao;

    public BookingController(BookingDAO bookingDao) {
        this.bookingDao = bookingDao;
    }

    @GetMapping
    public ResponseEntity<?> get(@RequestParam(value = "bookingId", required = false) Long bookingId,
                                  @RequestParam(value = "showtimeId", required = false) Integer showtimeId) {
        if (bookingId != null) {
            Map<String, Object> detail = bookingDao.findBookingDetail(bookingId);
            if (detail == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy booking"));
            }
            return ResponseEntity.ok(detail);
        }
        if (showtimeId != null) {
            List<String> booked = bookingDao.findBookedSeatCodes(showtimeId);
            return ResponseEntity.ok(booked);
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Thiếu bookingId hoặc showtimeId"));
    }

    public record BookingRequest(Integer showtimeId, List<String> seats, String customer, String phone, String email) {
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookingRequest body) {
        int showtimeId = body.showtimeId() == null ? 0 : body.showtimeId();
        List<String> seats = body.seats();
        String customer = body.customer();
        String phone = body.phone();
        String email = body.email();

        if (showtimeId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Thiếu showtimeId"));
        }
        if (seats == null || seats.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Vui lòng chọn ghế"));
        }
        if (customer == null || customer.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Vui lòng nhập họ tên"));
        }
        if (phone == null || !PHONE_PATTERN.matcher(phone).matches()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Số điện thoại không hợp lệ"));
        }

        try {
            BookingResult result = bookingDao.createBooking(showtimeId, seats, customer, phone, email);
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "bookingId", result.bookingId,
                    "seats", result.seats,
                    "total", result.total));
        } catch (InvalidBookingException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        } catch (SeatTakenException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "ok", false, "error", e.getMessage(), "conflictSeats", e.getConflictSeats()));
        }
    }
}
