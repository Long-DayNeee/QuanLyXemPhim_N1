package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.model.Movie;
import com.duanweb.duanweb.util.DBConnection;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class MovieDAO {
    // Khớp 100% với tên cột trong SQL (MovieID, TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID)
    // Lưu ý: Cần bổ sung cột DienVien (NVARCHAR) vào bảng Movie trong SQL nếu chưa có.
    private static final String COLUMNS = "MovieID, TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, "
            + "NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID";

    public List<Map<String, Object>> findAllAsMap() throws SQLException {
        String sql = "SELECT " + COLUMNS + " FROM Movie ORDER BY MovieID DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> movies = new ArrayList<>();
            while (rs.next()) {
                movies.add(toMap(rs));
            }
            return movies;
        }
    }

    public Map<String, Object> findByIdAsMap(int movieId) throws SQLException {
        String sql = "SELECT " + COLUMNS + " FROM Movie WHERE MovieID = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? toMap(rs) : null;
            }
        }
    }

    public List<Movie> findAll() throws SQLException {
        String sql = "SELECT " + COLUMNS + " FROM Movie ORDER BY MovieID DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Movie> movies = new ArrayList<>();
            while (rs.next()) {
                movies.add(toMovie(rs));
            }
            return movies;
        }
    }

    public Movie findById(int movieId) throws SQLException {
        String sql = "SELECT " + COLUMNS + " FROM Movie WHERE MovieID = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? toMovie(rs) : null;
            }
        }
    }

    public long insert(Movie movie) throws SQLException {
        MovieData data = fromMovie(movie);
        return insert(data);
    }

    public boolean update(Movie movie) throws SQLException {
        MovieData data = fromMovie(movie);
        return update(movie.getMovieID(), data);
    }

    public long insert(MovieData data) throws SQLException {
        String sql = "INSERT INTO Movie "
                + "(TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bindMovie(ps, data);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                return keys.next() ? keys.getLong(1) : 0;
            }
        }
    }

    public boolean update(int movieId, MovieData data) throws SQLException {
        String sql = "UPDATE Movie SET TieuDe=?, ThoiLuong=?, DoTuoi=?, NgayKhoiChieu=?, TheLoai=?, GiaVe=?, "
                + "NgonNgu=?, DaoDien=?, DienVien=?, MieuTa=?, PosterUrl=?, TrailerID=? WHERE MovieID=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            bindMovie(ps, data);
            ps.setInt(13, movieId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(int movieId) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM Movie WHERE MovieID = ?")) {
            ps.setInt(1, movieId);
            return ps.executeUpdate() > 0;
        }
    }

    public String findPosterUrl(int movieId) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT PosterUrl FROM Movie WHERE MovieID = ?")) {
            ps.setInt(1, movieId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getString("PosterUrl") : "";
            }
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
        movie.setNgayChieu(rs.getDate("NgayKhoiChieu")); // Khớp setter NgayKhoiChieu chuẩn SQL
        movie.setGiaVe(rs.getBigDecimal("GiaVe"));
        movie.setNgonNgu(rs.getString("NgonNgu"));
        movie.setDaoDien(rs.getString("DaoDien"));
        movie.setDienVien(rs.getString("DienVien"));
        movie.setMieuTa(rs.getString("MieuTa"));
        movie.setPosterUrl(rs.getString("PosterUrl"));
        movie.setTrailerId(rs.getString("TrailerID"));
        return movie;
    }

    private static MovieData fromMovie(Movie movie) {
        MovieData data = new MovieData();
        data.tieuDe = nullToEmpty(movie.getTieuDe());
        data.thoiLuong = movie.getThoiLuong();
        data.doTuoi = nullToEmpty(movie.getDoTuoi());
        data.ngayKhoiChieu = movie.getNgayChieu() == null ? java.time.LocalDate.now().toString() : new Date(movie.getNgayChieu().getTime()).toString();
        data.theLoai = nullToEmpty(movie.getTheLoai()); // Thêm dòng này nếu Movie có getTheLoai()
        data.giaVe = movie.getGiaVe() == null ? BigDecimal.ZERO : movie.getGiaVe();
        data.ngonNgu = nullToEmpty(movie.getNgonNgu());
        data.daoDien = nullToEmpty(movie.getDaoDien());
        data.cast = nullToEmpty(movie.getDienVien());
        data.mieuTa = nullToEmpty(movie.getMieuTa());
        data.posterUrl = nullToEmpty(movie.getPosterUrl());
        data.trailerID = nullToEmpty(movie.getTrailerId());
        return data;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

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