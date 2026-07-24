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

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public long insertFull(int movieId, int roomId, LocalDate date, LocalTime startTime, LocalTime endTime) throws SQLException {
        String sql = "INSERT INTO Showtime (MovieID, RoomID, ThoiGianBatDau, ThoiGianKetThuc) VALUES (?, ?, ?, ?)";
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(date, endTime != null ? endTime : startTime.plusHours(2));

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, movieId);
            ps.setInt(2, roomId > 0 ? roomId : 1);
            ps.setTimestamp(3, Timestamp.valueOf(startDateTime));
            ps.setTimestamp(4, Timestamp.valueOf(endDateTime));
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                return keys.next() ? keys.getLong(1) : 0;
            }
        }
    }

    public long insert(int movieId, LocalDate date, LocalTime time) throws SQLException {
        return insertFull(movieId, 1, date, time, time.plusHours(2));
    }

    public List<Map<String, Object>> findByMovieId(int movieId) throws SQLException {
        String sql = "SELECT ShowTimeID, RoomID, ThoiGianBatDau, ThoiGianKetThuc FROM Showtime WHERE MovieID = ? ORDER BY ThoiGianBatDau DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> showtimes = new ArrayList<>();
                while (rs.next()) {
                    Timestamp timestamp = rs.getTimestamp("ThoiGianBatDau");
                    if (timestamp != null) {
                        LocalDateTime startTime = timestamp.toLocalDateTime();

                        Map<String, Object> showtime = new LinkedHashMap<>();
                        showtime.put("ShowTimeID", rs.getInt("ShowTimeID"));
                        showtime.put("RoomID", rs.getInt("RoomID"));
                        showtime.put("dt", ISO_FORMATTER.format(startTime));
                        showtime.put("date", startTime.toLocalDate().toString());
                        showtime.put("startTime", ISO_FORMATTER.format(startTime));
                        showtime.put("time", TIME_FORMATTER.format(startTime)); // Giờ dạng HH:mm (VD: 19:30)
                        showtimes.add(showtime);
                    }
                }
                return showtimes;
            }
        }
    }

    public List<Map<String, Object>> findAll() throws SQLException {
        String sql = "SELECT s.ShowTimeID, s.MovieID, m.TieuDe, s.RoomID, s.ThoiGianBatDau, s.ThoiGianKetThuc " +
                "FROM Showtime s LEFT JOIN Movie m ON s.MovieID = m.MovieID " +
                "ORDER BY s.ThoiGianBatDau DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<Map<String, Object>> showtimes = new ArrayList<>();
            while (rs.next()) {
                Timestamp timestamp = rs.getTimestamp("ThoiGianBatDau");
                if (timestamp != null) {
                    LocalDateTime startTime = timestamp.toLocalDateTime();
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("ShowTimeID", rs.getInt("ShowTimeID"));
                    map.put("MovieID", rs.getInt("MovieID"));
                    map.put("MovieTitle", rs.getString("TieuDe") != null ? rs.getString("TieuDe") : "Không xác định");
                    map.put("RoomID", rs.getInt("RoomID"));
                    map.put("startTime", ISO_FORMATTER.format(startTime));
                    map.put("time", TIME_FORMATTER.format(startTime));
                    map.put("date", startTime.toLocalDate().toString());
                    showtimes.add(map);
                }
            }
            return showtimes;
        }
    }

    public boolean delete(int showtimeId) throws SQLException {
        String sql = "DELETE FROM Showtime WHERE ShowTimeID = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, showtimeId);
            return ps.executeUpdate() > 0;
        }
    }
}