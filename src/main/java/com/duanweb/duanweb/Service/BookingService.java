package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Entity.Booking;
import com.duanweb.duanweb.Entity.BookingSeat;
import com.duanweb.duanweb.Repository.BookingRepository;
import com.duanweb.duanweb.Repository.BookingSeatRepository;
import com.duanweb.duanweb.Repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatRepository seatRepository;

    public BookingService(BookingRepository bookingRepository, BookingSeatRepository bookingSeatRepository, SeatRepository seatRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.seatRepository = seatRepository;
    }

    public List<String> findBookedSeatCodes(Integer showtimeId) {
        return bookingRepository.findBookedSeatRows(showtimeId).stream().map(BookingService::seatCode).toList();
    }

    public Map<String, Object> findBookingDetail(Long bookingId) {
        List<Map<String, Object>> headers = bookingRepository.findBookingHeader(bookingId);
        if (headers.isEmpty()) {
            return null;
        }

        Map<String, Object> detail = new LinkedHashMap<>(headers.get(0));
        List<Map<String, Object>> seats = bookingRepository.findBookingSeatRows(bookingId);
        detail.put("seats", seats.stream().map(BookingService::seatCode).toList());
        BigDecimal total = seats.stream()
                .map(row -> (BigDecimal) row.get("DonGia"))
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        detail.put("total", total);
        return detail;
    }

    @Transactional
    public BookingResult createBooking(Integer showtimeId, List<String> seatCodes, String customer, String phone, String email) {
        List<Map<String, Object>> infoRows = bookingRepository.findShowtimeBookingInfo(showtimeId);
        if (infoRows.isEmpty()) {
            throw new InvalidBookingException("Suất chiếu không tồn tại");
        }
        Map<String, Object> info = infoRows.get(0);
        Integer roomId = ((Number) info.get("RoomID")).intValue();
        BigDecimal price = (BigDecimal) info.get("GiaVe");

        Map<String, Integer> seatsByCode = seatRepository.findSeatRowsByRoomId(roomId).stream()
                .collect(Collectors.toMap(BookingService::seatCode, row -> ((Number) row.get("SeatID")).intValue()));

        List<String> normalizedCodes = seatCodes.stream().map(code -> code == null ? "" : code.trim().toUpperCase()).toList();
        List<Integer> seatIds = new ArrayList<>();
        for (String code : normalizedCodes) {
            Integer seatId = seatsByCode.get(code);
            if (seatId == null) {
                throw new InvalidBookingException("Ghế không hợp lệ: " + code);
            }
            seatIds.add(seatId);
        }

        List<String> conflictSeats = bookingSeatRepository.findTakenSeatRowsForUpdate(showtimeId, seatIds).stream()
                .map(BookingService::seatCode)
                .toList();
        if (!conflictSeats.isEmpty()) {
            throw new SeatTakenException("Ghế đã được đặt", conflictSeats);
        }

        Booking booking = new Booking();
        booking.setShowTimeID(showtimeId);
        booking.setTenKhachHang(customer.trim());
        booking.setPhone(phone.trim());
        booking.setEmail(email == null ? "" : email.trim());
        booking.setTrangThai("DaDat");
        booking.setNgayDat(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        for (Integer seatId : seatIds) {
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBookingID(savedBooking.getBookingID());
            bookingSeat.setSeatID(seatId);
            bookingSeat.setDonGia(price);
            bookingSeatRepository.save(bookingSeat);
        }

        BigDecimal total = price.multiply(BigDecimal.valueOf(seatIds.size()));
        return new BookingResult(savedBooking.getBookingID(), normalizedCodes, total);
    }

    private static String seatCode(Map<String, Object> row) {
        return String.valueOf(row.get("HangGhe")) + row.get("SoGhe");
    }

    public record BookingResult(Long bookingId, List<String> seats, BigDecimal total) {
    }

    public static class InvalidBookingException extends RuntimeException {
        public InvalidBookingException(String message) {
            super(message);
        }
    }

    public static class SeatTakenException extends RuntimeException {
        private final List<String> conflictSeats;

        public SeatTakenException(String message, List<String> conflictSeats) {
            super(message);
            this.conflictSeats = conflictSeats;
        }

        public List<String> getConflictSeats() {
            return conflictSeats;
        }
    }
}