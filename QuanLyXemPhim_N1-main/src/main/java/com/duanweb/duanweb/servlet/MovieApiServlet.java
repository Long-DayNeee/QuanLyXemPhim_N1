package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.MovieDAO;
import com.duanweb.duanweb.dao.MovieDAO.MovieData;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class MovieApiServlet extends HttpServlet {
    private MovieDAO movieDAO;

    @Override
    public void init() {
        movieDAO = new MovieDAO();
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);
        int movieId = parseMovieId(req);

        try {
            if (movieId > 0) {
                Map<String, Object> movie = movieDAO.findByIdAsMap(movieId);
                writeJson(resp, HttpServletResponse.SC_OK, movie == null ? "null" : toJsonObject(movie));
            } else {
                List<Map<String, Object>> movies = movieDAO.findAllAsMap();
                writeJson(resp, HttpServletResponse.SC_OK, toJsonArray(movies));
            }
        } catch (SQLException e) {
            throw new ServletException("Không thể lấy dữ liệu phim", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);
        String override = getFormValue(req, "_method");
        if ("PUT".equalsIgnoreCase(override)) {
            updateMovie(req, resp);
        } else {
            createMovie(req, resp);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);
        updateMovie(req, resp);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        prepareJson(resp);
        int movieId = parseMovieId(req);
        if (movieId <= 0) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"Missing id\"}");
            return;
        }

        try {
            movieDAO.delete(movieId);
            writeJson(resp, HttpServletResponse.SC_OK, "{\"deleted\":" + movieId + "}");
        } catch (SQLException e) {
            throw new ServletException("Không thể xóa phim", e);
        }
    }

    private void createMovie(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            MovieData data = readMovieData(req, 0);
            long id = movieDAO.insert(data);
            writeJson(resp, HttpServletResponse.SC_OK, "{\"movieId\":" + id + "}");
        } catch (SQLException e) {
            throw new ServletException("Không thể thêm phim", e);
        }
    }

    private void updateMovie(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int movieId = parseMovieId(req);
        if (movieId <= 0) {
            writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, "{\"error\":\"Missing id\"}");
            return;
        }

        try {
            MovieData data = readMovieData(req, movieId);
            movieDAO.update(movieId, data);
            writeJson(resp, HttpServletResponse.SC_OK, "{\"updated\":" + movieId + "}");
        } catch (SQLException e) {
            throw new ServletException("Không thể cập nhật phim", e);
        }
    }

    private MovieData readMovieData(HttpServletRequest req, int existingMovieId) throws ServletException, IOException, SQLException {
        MovieData data = new MovieData();
        
        // Map trực tiếp với các thuộc tính đã đồng bộ khớp với cột SQL
        data.tieuDe = getFormValue(req, "title"); // Hoặc "tieuDe" tùy thuộc vào tên gửi lên từ Form/Client
        data.thoiLuong = parseInt(getFormValue(req, "duration"), 0);
        data.doTuoi = getFormValue(req, "ageRate");
        data.ngayKhoiChieu = normalizeDate(getFormValue(req, "premiere"));
        data.theLoai = getFormValue(req, "TheLoai");
        data.giaVe = parsePrice(getFormValue(req, "price"));
        data.ngonNgu = getFormValue(req, "language");
        data.daoDien = getFormValue(req, "director");
        data.mieuTa = getFormValue(req, "description");
        data.trailerID = getFormValue(req, "Trailer_ID"); // Khớp với cột TrailerID trong SQL

        String uploadedPoster = savePoster(req);
        if (!uploadedPoster.isEmpty()) {
            data.posterUrl = uploadedPoster;
        } else {
            String postedPoster = getFormValue(req, "posterUrl");
            data.posterUrl = postedPoster.isEmpty() && existingMovieId > 0 ? movieDAO.findPosterUrl(existingMovieId) : postedPoster;
        }
        return data;
    }

    private String savePoster(HttpServletRequest req) throws ServletException, IOException {
        Part poster = getPartOrNull(req, "poster");
        if (poster == null || poster.getSize() <= 0 || poster.getSubmittedFileName() == null || poster.getSubmittedFileName().isBlank()) {
            return "";
        }

        Path uploadDir = Paths.get(req.getServletContext().getRealPath("/api/uploads"));
        Files.createDirectories(uploadDir);
        String original = Paths.get(poster.getSubmittedFileName()).getFileName().toString();
        String fileName = UUID.randomUUID() + "-" + original;
        poster.write(uploadDir.resolve(fileName).toString());
        return "/DuAnWeb/api/uploads/" + fileName;
    }

    private static Part getPartOrNull(HttpServletRequest req, String name) throws ServletException, IOException {
        try {
            return req.getPart(name);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            return null;
        }
    }

    private static String getFormValue(HttpServletRequest req, String name) throws ServletException, IOException {
        Part part = getPartOrNull(req, name);
        if (part == null) {
            String value = req.getParameter(name);
            return value == null ? "" : value;
        }
        return new String(part.getInputStream().readAllBytes(), req.getCharacterEncoding() == null ? "UTF-8" : req.getCharacterEncoding());
    }

    private static int parseMovieId(HttpServletRequest req) {
        int movieId = parseInt(req.getParameter("movieId"), 0);
        return movieId > 0 ? movieId : parseInt(req.getParameter("Id"), parseInt(req.getParameter("id"), 0));
    }

    private static int parseInt(String value, int defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static BigDecimal parsePrice(String value) {
        if (value == null || value.isBlank()) {
            return BigDecimal.valueOf(200000);
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private static String normalizeDate(String value) {
        return value == null || value.isBlank() ? LocalDate.now().toString() : value.split("T")[0];
    }

    private static void prepareJson(HttpServletResponse resp) {
        applyApiHeaders(resp);
        resp.setContentType("application/json; charset=UTF-8");
    }

    private static void applyApiHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void writeJson(HttpServletResponse resp, int status, String json) throws IOException {
        resp.setStatus(status);
        resp.getWriter().write(json);
    }

    private static String toJsonArray(List<Map<String, Object>> rows) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < rows.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            json.append(toJsonObject(rows.get(i)));
        }
        return json.append(']').toString();
    }

    private static String toJsonObject(Map<String, Object> row) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (!first) {
                json.append(',');
            }
            first = false;
            json.append('"').append(escape(entry.getKey())).append("\":").append(toJsonValue(entry.getValue()));
        }
        return json.append('}').toString();
    }

    private static String toJsonValue(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        return '"' + escape(value.toString()) + '"';
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}