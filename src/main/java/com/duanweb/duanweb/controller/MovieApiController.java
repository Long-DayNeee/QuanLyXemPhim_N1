package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.dao.MovieDao;
import com.duanweb.duanweb.dao.MovieDao.MovieData;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Chuyen doi tu MovieApiServlet. Giu nguyen tap tham so form (title, duration, ageRate, premiere,
 * TheLoai, price, language, director, description, Trailer_ID, poster) de front-end cu (admin.js)
 * khong phai sua nhieu.
 */
@RestController
@RequestMapping("/api/movies")
public class MovieApiController {

    private final MovieDao movieDao;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public MovieApiController(MovieDao movieDao) {
        this.movieDao = movieDao;
    }

    @GetMapping
    public Object getMovies(@RequestParam(value = "movieId", required = false) Integer movieId,
                             @RequestParam(value = "Id", required = false) Integer idAlt,
                             @RequestParam(value = "id", required = false) Integer idAlt2) {
        int id = firstPositive(movieId, idAlt, idAlt2);
        if (id > 0) {
            Map<String, Object> movie = movieDao.findByIdAsMap(id);
            return movie;
        }
        List<Map<String, Object>> movies = movieDao.findAllAsMap();
        return movies;
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdate(HttpServletRequest req,
                                             @RequestParam(value = "_method", required = false) String methodOverride,
                                             @RequestParam(value = "movieId", required = false) Integer movieId) throws IOException {
        if ("PUT".equalsIgnoreCase(methodOverride)) {
            return updateMovie(movieId == null ? 0 : movieId, req);
        }
        return createMovie(req);
    }

    @PutMapping
    public ResponseEntity<?> update(HttpServletRequest req,
                                     @RequestParam(value = "movieId", required = false) Integer movieId) throws IOException {
        return updateMovie(movieId == null ? 0 : movieId, req);
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam(value = "movieId", required = false) Integer movieId,
                                     @RequestParam(value = "Id", required = false) Integer idAlt,
                                     @RequestParam(value = "id", required = false) Integer idAlt2) {
        int id = firstPositive(movieId, idAlt, idAlt2);
        if (id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id"));
        }
        movieDao.delete(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    private ResponseEntity<?> createMovie(HttpServletRequest req) throws IOException {
        MovieData data = readMovieData(req, 0);
        long id = movieDao.insert(data);
        return ResponseEntity.ok(Map.of("movieId", id));
    }

    private ResponseEntity<?> updateMovie(int movieId, HttpServletRequest req) throws IOException {
        if (movieId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id"));
        }
        MovieData data = readMovieData(req, movieId);
        movieDao.update(movieId, data);
        return ResponseEntity.ok(Map.of("updated", movieId));
    }

    private MovieData readMovieData(HttpServletRequest req, int existingMovieId) throws IOException {
        MovieData data = new MovieData();
        data.tieuDe = value(req, "title");
        data.thoiLuong = parseInt(req.getParameter("duration"), 0);
        data.doTuoi = value(req, "ageRate");
        data.ngayKhoiChieu = normalizeDate(req.getParameter("premiere"));
        data.theLoai = value(req, "TheLoai");
        data.giaVe = parsePrice(req.getParameter("price"));
        data.ngonNgu = value(req, "language");
        data.daoDien = value(req, "director");
        data.cast = value(req, "cast");
        data.mieuTa = value(req, "description");
        data.trailerID = value(req, "Trailer_ID");

        String uploadedPoster = savePoster(req);
        if (!uploadedPoster.isEmpty()) {
            data.posterUrl = uploadedPoster;
        } else {
            String postedPoster = value(req, "posterUrl");
            data.posterUrl = postedPoster.isEmpty() && existingMovieId > 0
                    ? movieDao.findPosterUrl(existingMovieId)
                    : postedPoster;
        }
        return data;
    }

    private String savePoster(HttpServletRequest req) throws IOException {
        if (!(req instanceof org.springframework.web.multipart.MultipartHttpServletRequest multipartReq)) {
            return "";
        }
        MultipartFile poster = multipartReq.getFile("poster");
        if (poster == null || poster.isEmpty() || !StringUtils.hasText(poster.getOriginalFilename())) {
            return "";
        }

        Path dir = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        
        String originalFilename = poster.getOriginalFilename();
        String original = (originalFilename != null) ? Path.of(originalFilename).getFileName().toString() : "file";
        
        String fileName = UUID.randomUUID() + "-" + original;
        
        // Thêm ép kiểu (Path) để triệt tiêu cảnh báo Null Type Safety
        poster.transferTo(dir.resolve(fileName).toFile());
        return "/api/uploads/" + fileName;
    }

    private static String value(HttpServletRequest req, String name) {
        String v = req.getParameter(name);
        return v == null ? "" : v;
    }

    private static int firstPositive(Integer... values) {
        for (Integer v : values) {
            if (v != null && v > 0) {
                return v;
            }
        }
        return 0;
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
}
