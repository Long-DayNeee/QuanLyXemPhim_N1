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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class MovieDAO {

    private static final String COLUMNS = "MovieID, TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, "
            + "NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID";

    // ==========================================
    // 1. TRẢ VỀ DẠNG MAP (DÙNG CHO REST API / JSON)
    // ==========================================

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

    // ==========================================
    // 2. TRẢ VỀ DẠNG MODEL MOVIE (DÙNG CHO JSP / MVC)
    // ==========================================

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

    // ==========================================
    // 3. CÁC THAO TÁC CHI TIẾT (INSERT, UPDATE, DELETE)
    // ==========================================

    public long insert(Movie movie) throws SQLException {
        String sql = "INSERT INTO Movie "
                + "(TieuDe, ThoiLuong, DoTuoi, NgayKhoiChieu, TheLoai, GiaVe, NgonNgu, DaoDien, DienVien, MieuTa, PosterUrl, TrailerID) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bindMovie(ps, movie);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                return keys.next() ? keys.getLong(1) : 0;
            }
        }
    }

    public boolean update(Movie movie) throws SQLException {
        String sql = "UPDATE Movie SET TieuDe=?, ThoiLuong=?, DoTuoi=?, NgayKhoiChieu=?, TheLoai=?, GiaVe=?, "
                + "NgonNgu=?, DaoDien=?, DienVien=?, MieuTa=?, PosterUrl=?, TrailerID=? WHERE MovieID=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            bindMovie(ps, movie);
            ps.setInt(13, movie.getMovieID());
            return ps.executeUpdate() > 0;
        }
    }

    // Hỗ trợ Overloading cho MovieData nếu các API Servlet trước đó gọi đến
    public long insert(MovieData data) throws SQLException {
        return insert(fromData(data));
    }

    public boolean update(int movieId, MovieData data) throws SQLException {
        Movie m = fromData(data);
        m.setMovieID(movieId);
        return update(m);
    }

    public boolean delete(int movieId) throws SQLException {
        String sql = "DELETE FROM Movie WHERE MovieID = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            return ps.executeUpdate() > 0;
        }
    }

    public String findPosterUrl(int movieId) throws SQLException {
        String sql = "SELECT PosterUrl FROM Movie WHERE MovieID = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getString("PosterUrl") : "";
            }
        }
    }

    // ==========================================
    // 4. HELPER METHODS MAPPING DỮ LIỆU
    // ==========================================

    private static void bindMovie(PreparedStatement ps, Movie m) throws SQLException {
        ps.setString(1, nullToEmpty(m.getTieuDe()));
        ps.setInt(2, m.getThoiLuong());
        ps.setString(3, nullToEmpty(m.getDoTuoi()));

        if (m.getNgayChieu() != null) {
            ps.setDate(4, new Date(m.getNgayChieu().getTime()));
        } else {
            ps.setDate(4, Date.valueOf(LocalDate.now()));
        }

        ps.setString(5, nullToEmpty(m.getTheLoai()));
        ps.setBigDecimal(6, m.getGiaVe() != null ? m.getGiaVe() : BigDecimal.ZERO);
        ps.setString(7, nullToEmpty(m.getNgonNgu()));
        ps.setString(8, nullToEmpty(m.getDaoDien()));
        ps.setString(9, nullToEmpty(m.getDienVien()));
        ps.setString(10, nullToEmpty(m.getMieuTa()));
        ps.setString(11, nullToEmpty(m.getPosterUrl()));
        ps.setString(12, nullToEmpty(m.getTrailerId()));
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
        movie.setTheLoai(rs.getString("TheLoai"));
        movie.setGiaVe(rs.getBigDecimal("GiaVe"));
        movie.setNgonNgu(rs.getString("NgonNgu"));
        movie.setDaoDien(rs.getString("DaoDien"));
        movie.setDienVien(rs.getString("DienVien"));
        movie.setMieuTa(rs.getString("MieuTa"));
        movie.setPosterUrl(rs.getString("PosterUrl"));
        movie.setTrailerId(rs.getString("TrailerID"));
        return movie;
    }

    private static Movie fromData(MovieData data) {
        Movie m = new Movie();
        m.setTieuDe(data.tieuDe);
        m.setThoiLuong(data.thoiLuong);
        m.setDoTuoi(data.doTuoi);
        if (data.ngayKhoiChieu != null && !data.ngayKhoiChieu.isBlank()) {
            try {
                m.setNgayChieu(Date.valueOf(data.ngayKhoiChieu.trim()));
            } catch (Exception e) {
                m.setNgayChieu(Date.valueOf(LocalDate.now()));
            }
        } else {
            m.setNgayChieu(Date.valueOf(LocalDate.now()));
        }
        m.setTheLoai(data.theLoai);
        m.setGiaVe(data.giaVe);
        m.setNgonNgu(data.ngonNgu);
        m.setDaoDien(data.daoDien);
        m.setDienVien(data.cast);
        m.setMieuTa(data.mieuTa);
        m.setPosterUrl(data.posterUrl);
        m.setTrailerId(data.trailerID);
        return m;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    // Giữ lại DTO struct cho tương thích API cũ
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