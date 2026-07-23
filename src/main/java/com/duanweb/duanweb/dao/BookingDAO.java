package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.util.DBConnection;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Xử lý toàn bộ nghiệp vụ đặt vé: quy đổi mã ghế (VD "A1") -> SeatID theo đúng
 * phòng chiếu, khoá ghi để chống 2 khách đặt trùng ghế cùng lúc, rồi ghi
 * Booking + BookingSeat trong 1 transaction.
 */
public class BookingDAO {

    private static final Pattern SEAT_CODE = Pattern.compile("^([A-Za-z]+)(\\d+)$");

    // ===== Exceptions riêng để servlet trả đúng mã HTTP =====

    /** Dữ liệu request không hợp lệ (showtimeId sai, mã ghế sai định dạng, ghế không thuộc phòng...) -> HTTP 400 */
    public static class InvalidBookingException extends Exception {
        public InvalidBookingException(String message) { super(message); }
    }

    /** Một hoặc nhiều ghế đã bị người khác đặt trước -> HTTP 409 Conflict */
    public static class SeatTakenException extends Exception {
        private final List<String> conflictSeats;
        public SeatTakenException(List<String> conflictSeats) {
            super("Ghế đã được đặt: " + String.join(", ", conflictSeats));
            this.conflictSeats = conflictSeats;
        }
        public List<String> getConflictSeats() { return conflictSeats; }
    }

    public static class BookingResult {
        public long bookingId;
        public List<String> seats;
        public BigDecimal total;
    }

    /**
     * Tạo booking mới. seatCodes ví dụ: ["A1", "A2"].
     * Toàn bộ thao tác chạy trong 1 transaction: nếu bất kỳ ghế nào đã bị đặt,
     * không ghi gì cả (rollback) và ném SeatTakenException.
     */
    public BookingResult createBooking(int showtimeId, List<String> seatCodes,
                                        String customerName, String phone, String email)
            throws SQLException, InvalidBookingException, SeatTakenException {

        if (seatCodes == null || seatCodes.isEmpty()) {
            throw new InvalidBookingException("Vui lòng chọn ít nhất 1 ghế");
        }

        // Chuẩn hoá mã ghế: "a1" -> "A1", loại khoảng trắng thừa
        List<String> normalizedCodes = new ArrayList<>();
        for (String raw : seatCodes) {
            String code = raw == null ? "" : raw.trim().toUpperCase();
            if (!SEAT_CODE.matcher(code).matches()) {
                throw new InvalidBookingException("Mã ghế không hợp lệ: " + raw);
            }
            normalizedCodes.add(code);
        }

        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1) Lấy RoomID + giá vé của phim theo suất chiếu
                int roomId;
                BigDecimal giaVe;
                String sqlShowtime = "SELECT s.RoomID, m.GiaVe FROM Showtime s "
                        + "JOIN Movie m ON s.MovieID = m.MovieID WHERE s.ShowTimeID = ?";
                try (PreparedStatement ps = conn.prepareStatement(sqlShowtime)) {
                    ps.setInt(1, showtimeId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            throw new InvalidBookingException("Suất chiếu không tồn tại");
                        }
                        roomId = rs.getInt("RoomID");
                        giaVe = rs.getBigDecimal("GiaVe");
                        if (giaVe == null) giaVe = BigDecimal.ZERO;
                    }
                }

                // 2) Quy đổi mã ghế -> SeatID trong đúng phòng của suất chiếu này
                Map<String, Integer> seatIdByCode = new LinkedHashMap<>();
                String sqlSeats = "SELECT SeatID, HangGhe, SoGhe FROM Seat WHERE RoomID = ?";
                try (PreparedStatement ps = conn.prepareStatement(sqlSeats)) {
                    ps.setInt(1, roomId);
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            String code = rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe");
                            seatIdByCode.put(code, rs.getInt("SeatID"));
                        }
                    }
                }

                List<Integer> seatIds = new ArrayList<>();
                for (String code : normalizedCodes) {
                    Integer seatId = seatIdByCode.get(code);
                    if (seatId == null) {
                        throw new InvalidBookingException("Ghế " + code + " không tồn tại trong phòng chiếu này");
                    }
                    seatIds.add(seatId);
                }

                // 3) Khoá các dòng liên quan (nếu có) để chống race-condition khi 2 người
                // cùng đặt 1 ghế cùng lúc. WITH (UPDLOCK, HOLDLOCK) giữ khoá tới khi commit/rollback.
                String placeholders = String.join(",", seatIds.stream().map(id -> "?").toArray(String[]::new));
                String sqlCheck = "SELECT s.HangGhe, s.SoGhe FROM BookingSeat bs WITH (UPDLOCK, HOLDLOCK) "
                        + "JOIN Booking b ON bs.BookingID = b.BookingID "
                        + "JOIN Seat s ON bs.SeatID = s.SeatID "
                        + "WHERE b.ShowTimeID = ? AND b.TrangThai <> 'DaHuy' AND bs.SeatID IN (" + placeholders + ")";
                try (PreparedStatement ps = conn.prepareStatement(sqlCheck)) {
                    ps.setInt(1, showtimeId);
                    int idx = 2;
                    for (Integer seatId : seatIds) {
                        ps.setInt(idx++, seatId);
                    }
                    try (ResultSet rs = ps.executeQuery()) {
                        List<String> taken = new ArrayList<>();
                        while (rs.next()) {
                            taken.add(rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe"));
                        }
                        if (!taken.isEmpty()) {
                            throw new SeatTakenException(taken);
                        }
                    }
                }

                // 4) Ghi Booking
                long bookingId;
                String sqlBooking = "INSERT INTO Booking (ShowTimeID, TenKhachHang, Email, Phone, TrangThai, NgayDat) "
                        + "VALUES (?, ?, ?, ?, 'ChoThanhToan', ?)";
                try (PreparedStatement ps = conn.prepareStatement(sqlBooking, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, showtimeId);
                    ps.setString(2, customerName);
                    ps.setString(3, email);
                    ps.setString(4, phone);
                    ps.setTimestamp(5, new Timestamp(System.currentTimeMillis()));
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (!keys.next()) {
                            throw new SQLException("Không lấy được BookingID vừa tạo");
                        }
                        bookingId = keys.getLong(1);
                    }
                }

                // 5) Ghi từng ghế đã chọn kèm đơn giá (snapshot giá tại thời điểm đặt)
                String sqlBookingSeat = "INSERT INTO BookingSeat (BookingID, SeatID, DonGia) VALUES (?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(sqlBookingSeat)) {
                    for (Integer seatId : seatIds) {
                        ps.setLong(1, bookingId);
                        ps.setInt(2, seatId);
                        ps.setBigDecimal(3, giaVe);
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }

                conn.commit();

                BookingResult result = new BookingResult();
                result.bookingId = bookingId;
                result.seats = normalizedCodes;
                result.total = giaVe.multiply(BigDecimal.valueOf(normalizedCodes.size()));
                return result;

            } catch (InvalidBookingException | SeatTakenException | SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /** Danh sách mã ghế đã có người đặt (chưa huỷ) cho 1 suất chiếu -> dùng để vẽ sơ đồ ghế. */
    public List<String> findBookedSeatCodes(int showtimeId) throws SQLException {
        String sql = "SELECT s.HangGhe, s.SoGhe FROM BookingSeat bs "
                + "JOIN Booking b ON bs.BookingID = b.BookingID "
                + "JOIN Seat s ON bs.SeatID = s.SeatID "
                + "WHERE b.ShowTimeID = ? AND b.TrangThai <> 'DaHuy'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, showtimeId);
            try (ResultSet rs = ps.executeQuery()) {
                List<String> booked = new ArrayList<>();
                while (rs.next()) {
                    booked.add(rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe"));
                }
                return booked;
            }
        }
    }

    /** Chi tiết 1 booking (dùng cho trang hoá đơn HoaDon.jsp). Trả về null nếu không tìm thấy. */
    public Map<String, Object> findBookingDetail(long bookingId) throws SQLException {
        String sqlHeader = "SELECT b.BookingID, b.TenKhachHang, b.Email, b.Phone, b.TrangThai, b.NgayDat, "
                + "b.ShowTimeID, m.TieuDe, sh.ThoiGianBatDau "
                + "FROM Booking b "
                + "JOIN Showtime sh ON b.ShowTimeID = sh.ShowTimeID "
                + "JOIN Movie m ON sh.MovieID = m.MovieID "
                + "WHERE b.BookingID = ?";

        Map<String, Object> result = new LinkedHashMap<>();
        try (Connection conn = DBConnection.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement(sqlHeader)) {
                ps.setLong(1, bookingId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        return null;
                    }
                    result.put("BookingID", rs.getLong("BookingID"));
                    result.put("TenKhachHang", rs.getString("TenKhachHang"));
                    result.put("Email", rs.getString("Email"));
                    result.put("Phone", rs.getString("Phone"));
                    result.put("TrangThai", rs.getString("TrangThai"));
                    result.put("NgayDat", rs.getTimestamp("NgayDat"));
                    result.put("ShowTimeID", rs.getInt("ShowTimeID"));
                    result.put("TieuDe", rs.getString("TieuDe"));
                    result.put("ThoiGianBatDau", rs.getTimestamp("ThoiGianBatDau"));
                }
            }

            String sqlSeats = "SELECT s.HangGhe, s.SoGhe, bs.DonGia FROM BookingSeat bs "
                    + "JOIN Seat s ON bs.SeatID = s.SeatID WHERE bs.BookingID = ? ORDER BY s.HangGhe, s.SoGhe";
            List<String> seats = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;
            try (PreparedStatement ps = conn.prepareStatement(sqlSeats)) {
                ps.setLong(1, bookingId);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        seats.add(rs.getString("HangGhe").trim().toUpperCase() + rs.getInt("SoGhe"));
                        BigDecimal donGia = rs.getBigDecimal("DonGia");
                        if (donGia != null) total = total.add(donGia);
                    }
                }
            }
            result.put("Seats", seats);
            result.put("Total", total);
        }
        return result;
    }
}