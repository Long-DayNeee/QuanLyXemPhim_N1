package com.duanweb.duanweb.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class ShowtimeDAO {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;

    public ShowtimeDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long insertFull(int movieId, int roomId, LocalDate date, LocalTime startTime, LocalTime endTime) throws SQLException {
        return insertFull(movieId, roomId, date, startTime, endTime, 0);
    }

    public long insertFull(int movieId, int roomId, LocalDate date, LocalTime startTime, LocalTime endTime, int seats) {
        String sql = "INSERT INTO Showtime (MovieID, RoomID, ThoiGianBatDau, ThoiGianKetThuc) VALUES (?, ?, ?, ?)";
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(date, endTime);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"showtimeid"});
            ps.setInt(1, movieId);
            ps.setInt(2, roomId);
            ps.setTimestamp(3, Timestamp.valueOf(startDateTime));
            ps.setTimestamp(4, Timestamp.valueOf(endDateTime));
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        return key == null ? 0 : key.longValue();
    }

    public boolean delete(int showtimeId) {
        int rows = jdbcTemplate.update("DELETE FROM Showtime WHERE ShowTimeID = ?", showtimeId);
        return rows > 0;
    }

    /** Tra ve mot roomid co that trong bang cinemaroom (id nho nhat), hoac 0 neu chua co phong nao. */
    public int findAnyExistingRoomId() {
        try {
            Integer id = jdbcTemplate.queryForObject("SELECT MIN(RoomID) FROM CinemaRoom", Integer.class);
            return id == null ? 0 : id;
        } catch (Exception e) {
            return 0;
        }
    }

    public List<Map<String, Object>> findByMovieId(int movieId) {
        String sql = "SELECT ShowTimeID, RoomID, ThoiGianBatDau, ThoiGianKetThuc FROM Showtime WHERE MovieID = ? ORDER BY ThoiGianBatDau";
        return jdbcTemplate.query(sql, (rs, rowNum) -> toShowtimeMap(rs), movieId);
    }

    private static Map<String, Object> toShowtimeMap(ResultSet rs) throws SQLException {
        Timestamp timestamp = rs.getTimestamp("ThoiGianBatDau");
        LocalDateTime startTime = timestamp.toLocalDateTime();
        String formatted = DATE_TIME_FORMATTER.format(startTime);

        Map<String, Object> showtime = new LinkedHashMap<>();
        showtime.put("ShowTimeID", rs.getInt("ShowTimeID"));
        showtime.put("RoomID", rs.getInt("RoomID"));
        showtime.put("dt", formatted);
        showtime.put("date", startTime.toLocalDate().toString());
        showtime.put("startTime", formatted);
        // FIX: front-end (script.js) doc field "time" de hien thi gio chieu tren nut chon gio,
        // truoc day API chi tra "dt"/"startTime" nen script.js luon fallback ve "-:-" (khong tim thay field "time")
        showtime.put("time", formatted);
        return showtime;
    }
}
