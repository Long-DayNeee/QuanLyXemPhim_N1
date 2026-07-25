package com.duanweb.duanweb.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Chuyen doi tu BookingDAO (JDBC thuan, tu quan ly Connection/transaction) sang Spring bean
 * dung JdbcTemplate. Transaction duoc Spring quan ly bang @Transactional (thay cho
 * conn.setAutoCommit(false)/commit()/rollback() thu cong) - cung mot connection duoc dung
 * xuyen suot phuong thuc nho DataSourceTransactionManager cua Spring Boot.
 *
 * Khoa WITH (UPDLOCK, HOLDLOCK) duoc giu nguyen trong cau SQL de chong 2 khach dat trung
 * ghe cung luc (giu khoa toi khi transaction commit/rollback).
 */
@Repository
public class BookingDao {

    private static final Pattern SEAT_CODE = Pattern.compile("^([A-Za-z]+)(\\d+)$");

    public static class InvalidBookingException extends RuntimeException {
        public InvalidBookingException(String message) {
            super(message);
        }
    }

    public static class SeatTakenException extends RuntimeException {
        private final List<String> conflictSeats;

        public SeatTakenException(List<String> conflictSeats) {
            super("Ghế đã được đặt: " + String.join(", ", conflictSeats));
            this.conflictSeats = conflictSeats;
        }

        public List<String> getConflictSeats() {
            return conflictSeats;
        }
    }

    public static class BookingResult {
        public long bookingId;
        public List<String> seats;
        public BigDecimal total;
    }

    private final JdbcTemplate jdbcTemplate;

    public BookingDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResult createBooking(int showtimeId, List<String> seatCodes,
                                        String customerName, String phone, String email) {

        if (seatCodes == null || seatCodes.isEmpty()) {
            throw new InvalidBookingException("Vui lòng chọn ít nhất 1 ghế");
        }

        List<String> normalizedCodes = new ArrayList<>();
        for (String raw : seatCodes) {
            String code = raw == null ? "" : raw.trim().toUpperCase();
            if (!SEAT_CODE.matcher(code).matches()) {
                throw new InvalidBookingException("Mã ghế không hợp lệ: " + raw);
            }
            normalizedCodes.add(code);
        }

        // 1) Lay RoomID + gia ve cua phim theo suat chieu
        List<Map<String, Object>> showtimeRows = jdbcTemplate.queryForList(
                "SELECT s.RoomID AS RoomID, m.GiaVe AS GiaVe FROM Showtime s "
                        + "JOIN Movie m ON s.MovieID = m.MovieID WHERE s.ShowTimeID = ?", showtimeId);
        if (showtimeRows.isEmpty()) {
            throw new InvalidBookingException("Suất chiếu không tồn tại");
        }
        int roomId = ((Number) showtimeRows.get(0).get("RoomID")).intValue();
        BigDecimal giaVe = (BigDecimal) showtimeRows.get(0).get("GiaVe");
        if (giaVe == null) {
            giaVe = BigDecimal.ZERO;
        }

        // 2) Quy doi ma ghe -> SeatID trong dung phong cua suat chieu nay
        Map<String, Integer> seatIdByCode = new LinkedHashMap<>();
        jdbcTemplate.query("SELECT SeatID, HangGhe, SoGhe FROM Seat WHERE RoomID = ?",
                (rs, rowNum) -> {
                    String code = rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe");
                    seatIdByCode.put(code, rs.getInt("SeatID"));
                    return null;
                }, roomId);

        List<Integer> seatIds = new ArrayList<>();
        for (String code : normalizedCodes) {
            Integer seatId = seatIdByCode.get(code);
            if (seatId == null) {
                throw new InvalidBookingException("Ghế " + code + " không tồn tại trong phòng chiếu này");
            }
            seatIds.add(seatId);
        }

        // 3) Khoa cac dong lien quan de chong race-condition khi 2 nguoi cung dat 1 ghe cung luc
        String placeholders = String.join(",", seatIds.stream().map(id -> "?").toArray(String[]::new));
        String sqlCheck = "SELECT s.HangGhe, s.SoGhe FROM BookingSeat bs WITH (UPDLOCK, HOLDLOCK) "
                + "JOIN Booking b ON bs.BookingID = b.BookingID "
                + "JOIN Seat s ON bs.SeatID = s.SeatID "
                + "WHERE b.ShowTimeID = ? AND b.TrangThai <> 'DaHuy' AND bs.SeatID IN (" + placeholders + ")";
        List<Object> checkParams = new ArrayList<>();
        checkParams.add(showtimeId);
        checkParams.addAll(seatIds);
        List<String> taken = jdbcTemplate.query(sqlCheck,
                (rs, rowNum) -> rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe"),
                checkParams.toArray());
        if (!taken.isEmpty()) {
            throw new SeatTakenException(taken);
        }

        // 4) Ghi Booking
        String sqlBooking = "INSERT INTO Booking (ShowTimeID, TenKhachHang, Email, Phone, TrangThai, NgayDat) "
                + "VALUES (?, ?, ?, ?, 'ChoThanhToan', ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        Timestamp now = new Timestamp(System.currentTimeMillis());
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sqlBooking, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, showtimeId);
            ps.setString(2, customerName);
            ps.setString(3, email);
            ps.setString(4, phone);
            ps.setTimestamp(5, now);
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        long bookingId = key == null ? 0 : key.longValue();

        // 5) Ghi tung ghe da chon kem don gia (snapshot gia tai thoi diem dat)
        String sqlBookingSeat = "INSERT INTO BookingSeat (BookingID, SeatID, DonGia) VALUES (?, ?, ?)";
        BigDecimal finalGiaVe = giaVe;
        jdbcTemplate.batchUpdate(sqlBookingSeat, seatIds, seatIds.size(), (ps, seatId) -> {
            ps.setLong(1, bookingId);
            ps.setInt(2, seatId);
            ps.setBigDecimal(3, finalGiaVe);
        });

        BookingResult result = new BookingResult();
        result.bookingId = bookingId;
        result.seats = normalizedCodes;
        result.total = giaVe.multiply(BigDecimal.valueOf(normalizedCodes.size()));
        return result;
    }

    /** Danh sach ma ghe da co nguoi dat (chua huy) cho 1 suat chieu -> dung de ve so do ghe. */
    public List<String> findBookedSeatCodes(int showtimeId) {
        String sql = "SELECT s.HangGhe, s.SoGhe FROM BookingSeat bs "
                + "JOIN Booking b ON bs.BookingID = b.BookingID "
                + "JOIN Seat s ON bs.SeatID = s.SeatID "
                + "WHERE b.ShowTimeID = ? AND b.TrangThai <> 'DaHuy'";
        return jdbcTemplate.query(sql,
                (rs, rowNum) -> rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe"),
                showtimeId);
    }

    /** Chi tiet 1 booking (dung cho trang hoa don HoaDon.html). Tra ve null neu khong tim thay. */
    public Map<String, Object> findBookingDetail(long bookingId) {
        String sqlHeader = "SELECT b.BookingID, b.TenKhachHang, b.Email, b.Phone, b.TrangThai, b.NgayDat, "
                + "b.ShowTimeID, m.TieuDe, sh.ThoiGianBatDau "
                + "FROM Booking b "
                + "JOIN Showtime sh ON b.ShowTimeID = sh.ShowTimeID "
                + "JOIN Movie m ON sh.MovieID = m.MovieID "
                + "WHERE b.BookingID = ?";

        List<Map<String, Object>> headerRows = jdbcTemplate.query(sqlHeader, (rs, rowNum) -> {
            Map<String, Object> header = new LinkedHashMap<>();
            header.put("BookingID", rs.getLong("BookingID"));
            header.put("TenKhachHang", rs.getString("TenKhachHang"));
            header.put("Email", rs.getString("Email"));
            header.put("Phone", rs.getString("Phone"));
            header.put("TrangThai", rs.getString("TrangThai"));
            header.put("NgayDat", rs.getTimestamp("NgayDat"));
            header.put("ShowTimeID", rs.getInt("ShowTimeID"));
            header.put("TieuDe", rs.getString("TieuDe"));
            header.put("ThoiGianBatDau", rs.getTimestamp("ThoiGianBatDau"));
            return header;
        }, bookingId);

        if (headerRows.isEmpty()) {
            return null;
        }
        Map<String, Object> result = headerRows.get(0);

        String sqlSeats = "SELECT s.HangGhe, s.SoGhe, bs.DonGia FROM BookingSeat bs "
                + "JOIN Seat s ON bs.SeatID = s.SeatID WHERE bs.BookingID = ? ORDER BY s.HangGhe, s.SoGhe";
        List<Map<String, Object>> seatRows = jdbcTemplate.query(sqlSeats, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("seat", rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe"));
            row.put("donGia", rs.getBigDecimal("DonGia"));
            return row;
        }, bookingId);

        List<String> seats = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> row : seatRows) {
            seats.add((String) row.get("seat"));
            BigDecimal donGia = (BigDecimal) row.get("donGia");
            if (donGia != null) {
                total = total.add(donGia);
            }
        }
        result.put("Seats", seats);
        result.put("Total", total);
        return result;
    }
}
