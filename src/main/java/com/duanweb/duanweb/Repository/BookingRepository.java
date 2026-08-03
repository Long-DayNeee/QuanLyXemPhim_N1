package com.duanweb.duanweb.Repository;

import com.duanweb.duanweb.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query(value = "SELECT s.RoomID AS RoomID, m.GiaVe AS GiaVe FROM Showtime s "
            + "JOIN Movie m ON s.MovieID = m.MovieID WHERE s.ShowTimeID = :showtimeId", nativeQuery = true)
    List<Map<String, Object>> findShowtimeBookingInfo(Integer showtimeId);

    @Query(value = "SELECT s.HangGhe, s.SoGhe FROM BookingSeat bs "
            + "JOIN Booking b ON bs.BookingID = b.BookingID "
            + "JOIN Seat s ON bs.SeatID = s.SeatID "
            + "WHERE b.ShowTimeID = :showtimeId AND b.TrangThai <> 'DaHuy'", nativeQuery = true)
    List<Map<String, Object>> findBookedSeatRows(Integer showtimeId);

    @Query(value = "SELECT b.BookingID, b.TenKhachHang, b.Email, b.Phone, b.TrangThai, b.NgayDat, "
            + "b.ShowTimeID, m.TieuDe, sh.ThoiGianBatDau "
            + "FROM Booking b "
            + "JOIN Showtime sh ON b.ShowTimeID = sh.ShowTimeID "
            + "JOIN Movie m ON sh.MovieID = m.MovieID "
            + "WHERE b.BookingID = :bookingId", nativeQuery = true)
    List<Map<String, Object>> findBookingHeader(Long bookingId);

    @Query(value = "SELECT s.HangGhe, s.SoGhe, bs.DonGia FROM BookingSeat bs "
            + "JOIN Seat s ON bs.SeatID = s.SeatID WHERE bs.BookingID = :bookingId ORDER BY s.HangGhe, s.SoGhe", nativeQuery = true)
    List<Map<String, Object>> findBookingSeatRows(Long bookingId);

    // Dùng cho màn hình Admin: lịch sử đặt vé + doanh thu (mỗi dòng = 1 booking,
    // Seats là danh sách ghế nối chuỗi, Total là tổng DonGia thực tế của các ghế trong booking đó)
    @Query(value = "SELECT b.BookingID AS BookingID, b.Phone AS Phone, m.TieuDe AS MovieTitle, "
            + "sh.ThoiGianBatDau AS ThoiGianBatDau, "
            + "string_agg(CONCAT(s.HangGhe, s.SoGhe), ',' ORDER BY s.HangGhe, s.SoGhe) AS Seats, "
            + "SUM(bs.DonGia) AS Total "
            + "FROM Booking b "
            + "JOIN Showtime sh ON b.ShowTimeID = sh.ShowTimeID "
            + "JOIN Movie m ON sh.MovieID = m.MovieID "
            + "JOIN BookingSeat bs ON bs.BookingID = b.BookingID "
            + "JOIN Seat s ON bs.SeatID = s.SeatID "
            + "WHERE b.TrangThai <> 'DaHuy' "
            + "AND (CAST(:movieId AS INTEGER) IS NULL OR m.MovieID = :movieId) "
            + "GROUP BY b.BookingID, b.Phone, m.TieuDe, sh.ThoiGianBatDau "
            + "ORDER BY sh.ThoiGianBatDau DESC", nativeQuery = true)
    List<Map<String, Object>> findAdminBookingHistoryRows(Integer movieId);
}