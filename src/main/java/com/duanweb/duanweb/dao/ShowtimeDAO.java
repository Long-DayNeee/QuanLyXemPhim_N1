package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ShowtimeDAO {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    // Hàm insertFull đúng với yêu cầu gọi từ AddShowtimeServlet
    public long insertFull(int movieId, int roomId, LocalDate date, LocalTime startTime, LocalTime endTime, int seats) throws SQLException {
        String sql = "INSERT INTO Showtime (MovieID, RoomID, ThoiGianBatDau, ThoiGianKetThuc) VALUES (?, ?, ?, ?)";
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(date, endTime);

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, movieId);
            ps.setInt(2, roomId);
            ps.setTimestamp(3, Timestamp.valueOf(startDateTime));
            ps.setTimestamp(4, Timestamp.valueOf(endDateTime));
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getLong(1);
                }
            }
        }
        return 0;
    }

    // Giữ lại hàm insert cũ để phòng trường hợp nơi khác trong code gọi đến
    public long insert(int movieId, LocalDate date, LocalTime time, int seats) throws SQLException {
        LocalTime endTime = time.plusHours(2);
        return insertFull(movieId, 1, date, time, endTime, seats);
    }

    public List<Map<String, Object>> findByMovieId(int movieId) throws SQLException {
        String sql = "SELECT ShowTimeID, RoomID, ThoiGianBatDau, ThoiGianKetThuc FROM Showtime WHERE MovieID = ? ORDER BY ThoiGianBatDau";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> showtimes = new ArrayList<>();
                while (rs.next()) {
                    Timestamp timestamp = rs.getTimestamp("ThoiGianBatDau");
                    LocalDateTime startTime = timestamp.toLocalDateTime();
                    String formatted = DATE_TIME_FORMATTER.format(startTime);

                    Map<String, Object> showtime = new LinkedHashMap<>();
                    showtime.put("ShowTimeID", rs.getInt("ShowTimeID"));
                    showtime.put("RoomID", rs.getInt("RoomID"));
                    showtime.put("dt", formatted);
                    showtime.put("date", startTime.toLocalDate().toString());
                    showtime.put("startTime", formatted);
                    showtimes.add(showtime);
                }
                return showtimes;
            }
        }
    }
}