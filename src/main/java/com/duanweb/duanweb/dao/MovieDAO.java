package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.model.Movie;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Chuyen doi tu MovieDAO (JDBC thuan) sang Spring bean dung JdbcTemplate.
 * Giu nguyen toan bo cau SQL va ten cot de tuong thich voi schema SQL Server hien co.
 */
@Repository
public class MovieDAO {

    private static final String COLUMNS = "MovieID, TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, "
            + "NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID";

    private final JdbcTemplate jdbcTemplate;

    public MovieDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findAllAsMap() {
        String sql = "SELECT " + COLUMNS + " FROM Movie ORDER BY MovieID DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> toMap(rs));
    }

    public Map<String, Object> findByIdAsMap(int movieId) {
        String sql = "SELECT " + COLUMNS + " FROM Movie WHERE MovieID = ?";
        List<Map<String, Object>> result = jdbcTemplate.query(sql, (rs, rowNum) -> toMap(rs), movieId);
        return result.isEmpty() ? null : result.get(0);
    }

    public List<Movie> findAll() {
        String sql = "SELECT " + COLUMNS + " FROM Movie ORDER BY MovieID DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> toMovie(rs));
    }

    public Movie findById(int movieId) {
        String sql = "SELECT " + COLUMNS + " FROM Movie WHERE MovieID = ?";
        List<Movie> result = jdbcTemplate.query(sql, (rs, rowNum) -> toMovie(rs), movieId);
        return result.isEmpty() ? null : result.get(0);
    }

    public long insert(MovieData data) {
        String sql = "INSERT INTO Movie "
                + "(TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update((java.sql.Connection connection) -> {
            java.sql.PreparedStatement ps = connection.prepareStatement(sql, new String[]{"movieid"});
            bindMovie(ps, data);
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        return key == null ? 0 : key.longValue();
    }

    public boolean update(int movieId, MovieData data) {
        String sql = "UPDATE Movie SET TieuDe=?, ThoiLuong=?, DoTuoi=?, NgayKhoiChieu=?, TheLoai=?, GiaVe=?, "
                + "NgonNgu=?, DaoDien=?, DienVien=?, MieuTa=?, PosterUrl=?, TrailerID=? WHERE MovieID=?";
        int rows = jdbcTemplate.update(sql,
                data.tieuDe, data.thoiLuong, data.doTuoi, Date.valueOf(data.ngayKhoiChieu), data.theLoai, data.giaVe,
                data.ngonNgu, data.daoDien, data.cast, data.mieuTa, data.posterUrl, data.trailerID, movieId);
        return rows > 0;
    }

    /**
     * FIX: truoc day chi "DELETE FROM Movie WHERE MovieID = ?" -> luon crash 500 (vi pham khoa ngoai)
     * neu phim da co Showtime (va Showtime da co Booking). Gio xoa theo dung thu tu tu bang con
     * (BookingSeat -> Booking -> Showtime) roi moi xoa Movie, tat ca trong 1 transaction de dam bao
     * toan ven du lieu (neu 1 buoc loi thi rollback het, khong bi xoa dang do).
     */
    @Transactional
    public boolean delete(int movieId) {
        jdbcTemplate.update(
                "DELETE FROM BookingSeat WHERE BookingID IN ("
                        + "SELECT b.BookingID FROM Booking b JOIN Showtime s ON b.ShowTimeID = s.ShowTimeID "
                        + "WHERE s.MovieID = ?)", movieId);
        jdbcTemplate.update(
                "DELETE FROM Booking WHERE ShowTimeID IN ("
                        + "SELECT ShowTimeID FROM Showtime WHERE MovieID = ?)", movieId);
        jdbcTemplate.update("DELETE FROM Showtime WHERE MovieID = ?", movieId);
        int rows = jdbcTemplate.update("DELETE FROM Movie WHERE MovieID = ?", movieId);
        return rows > 0;
    }

    public String findPosterUrl(int movieId) {
        try {
            String url = jdbcTemplate.queryForObject(
                    "SELECT PosterUrl FROM Movie WHERE MovieID = ?", String.class, movieId);
            return url == null ? "" : url;
        } catch (EmptyResultDataAccessException e) {
            return "";
        }
    }

    private static void bindMovie(PreparedStatement ps, MovieData data) throws SQLException {
        ps.setString(1, data.tieuDe);
        ps.setInt(2, data.thoiLuong);
        ps.setString(3, data.doTuoi);
        ps.setDate(4, Date.valueOf(data.ngayKhoiChieu));
        ps.setString(5, data.theLoai);
        ps.setBigDecimal(6, data.giaVe);
        ps.setString(7, data.ngonNgu);
        ps.setString(8, data.daoDien);
        ps.setString(9, data.cast);
        ps.setString(10, data.mieuTa);
        ps.setString(11, data.posterUrl);
        ps.setString(12, data.trailerID);
    }

    private static Map<String, Object> toMap(ResultSet rs) throws SQLException {
        Map<String, Object> movie = new LinkedHashMap<>();
        movie.put("MovieID", rs.getInt("MovieID"));
        movie.put("TieuDe", rs.getString("TieuDe"));
        movie.put("ThoiLuong", rs.getInt("ThoiLuong"));
        movie.put("DoTuoi", rs.getString("DoTuoi"));
        Date ngayKhoiChieu = rs.getDate("NgayKhoiChieu");
        movie.put("NgayKhoiChieu", ngayKhoiChieu == null ? null : ngayKhoiChieu.toString());
        movie.put("TheLoai", rs.getString("TheLoai"));
        movie.put("GiaVe", rs.getBigDecimal("GiaVe"));
        movie.put("NgonNgu", rs.getString("NgonNgu"));
        movie.put("DaoDien", rs.getString("DaoDien"));
        movie.put("DienVien", rs.getString("DienVien"));
        movie.put("MieuTa", rs.getString("MieuTa"));
        movie.put("PosterUrl", rs.getString("PosterUrl"));
        movie.put("TrailerID", rs.getString("TrailerID"));
        return movie;
    }

    private static Movie toMovie(ResultSet rs) throws SQLException {
        Movie movie = new Movie();
        movie.setMovieID(rs.getInt("MovieID"));
        movie.setTieuDe(rs.getString("TieuDe"));
        movie.setThoiLuong(rs.getInt("ThoiLuong"));
        movie.setDoTuoi(rs.getString("DoTuoi"));
        movie.setNgayChieu(rs.getDate("NgayKhoiChieu"));
        movie.setGiaVe(rs.getBigDecimal("GiaVe"));
        movie.setNgonNgu(rs.getString("NgonNgu"));
        movie.setDaoDien(rs.getString("DaoDien"));
        movie.setDienVien(rs.getString("DienVien"));
        movie.setMieuTa(rs.getString("MieuTa"));
        movie.setPosterUrl(rs.getString("PosterUrl"));
        movie.setTrailerId(rs.getString("TrailerID"));
        return movie;
    }

    /** DTO trung gian dung khi nhan du lieu tu form/JSON truoc khi ghi xuong DB. */
    public static class MovieData {
        public String tieuDe = "";
        public int thoiLuong;
        public String doTuoi = "";
        public String ngayKhoiChieu;
        public String theLoai = "";
        public BigDecimal giaVe = BigDecimal.valueOf(200000);
        public String ngonNgu = "";
        public String daoDien = "";
        public String cast = "";
        public String mieuTa = "";
        public String posterUrl = "";
        public String trailerID = "";
    }
}
