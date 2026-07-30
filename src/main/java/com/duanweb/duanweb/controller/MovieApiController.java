package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Service.MovieApiService;
import com.duanweb.duanweb.Service.MovieApiService.MovieData;

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

    private final MovieApiService movieApiService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public MovieApiController(MovieApiService movieApiService) {
        this.movieApiService = movieApiService;
    }

    @GetMapping
    public ResponseEntity<Object> getMovies(@RequestParam(value = "movieId", required = false) Integer movieId,
                                            @RequestParam(value = "Id", required = false) Integer idAlt,
                                            @RequestParam(value = "id", required = false) Integer idAlt2) {
        int id = firstPositive(movieId, idAlt, idAlt2);
        if (id > 0) {
            return movieApiService.findByIdAsMap(id)
                    .map(movie -> ResponseEntity.ok((Object) movie))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }
        List<Map<String, Object>> movies = movieApiService.findAllAsMap();
        return ResponseEntity.ok(movies);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrUpdate(HttpServletRequest req,
                                                              @RequestParam(value = "_method", required = false) String methodOverride,
                                                              @RequestParam(value = "movieId", required = false) Integer movieId) throws IOException {
        if ("PUT".equalsIgnoreCase(methodOverride)) {
            return updateMovie(movieId == null ? 0 : movieId, req);
        }
        return createMovie(req);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> update(HttpServletRequest req,
                                                      @RequestParam(value = "movieId", required = false) Integer movieId) throws IOException {
        return updateMovie(movieId == null ? 0 : movieId, req);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> delete(@RequestParam(value = "movieId", required = false) Integer movieId,
                                                      @RequestParam(value = "Id", required = false) Integer idAlt,
                                                      @RequestParam(value = "id", required = false) Integer idAlt2) {
        int id = firstPositive(movieId, idAlt, idAlt2);
        if (id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id"));
        }
        movieApiService.delete(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    private ResponseEntity<Map<String, Object>> createMovie(HttpServletRequest req) throws IOException {
        MovieData data = readMovieData(req, 0);
        if (!StringUtils.hasText(data.tieuDe())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing title"));
        }
        Integer id = movieApiService.create(data);
        return ResponseEntity.ok(Map.of("movieId", id));
    }

    private ResponseEntity<Map<String, Object>> updateMovie(int movieId, HttpServletRequest req) throws IOException {
        if (movieId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id"));
        }
        MovieData data = readMovieData(req, movieId);
        if (!StringUtils.hasText(data.tieuDe())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing title"));
        }
        movieApiService.update(movieId, data);
        return ResponseEntity.ok(Map.of("updated", movieId));
    }

    private MovieData readMovieData(HttpServletRequest req, int existingMovieId) throws IOException {
        String posterUrl;

        String uploadedPoster = savePoster(req);
        if (!uploadedPoster.isEmpty()) {
            posterUrl = uploadedPoster;
        } else {
            String postedPoster = value(req, "posterUrl");
            posterUrl = postedPoster.isEmpty() && existingMovieId > 0
                    ? movieApiService.findPosterUrl(existingMovieId)
                    : postedPoster;
        }
        return new MovieData(
                firstValue(req, "title", "TieuDe", "tieude"),
                parseInt(req.getParameter("duration"), 0),
                firstValue(req, "ageRate", "DoTuoi", "dotuoi"),
                normalizeDate(req.getParameter("premiere")),
                firstValue(req, "TheLoai", "theLoai", "theloai"),
                parsePrice(req.getParameter("price")),
                firstValue(req, "language", "NgonNgu", "ngonngu"),
                firstValue(req, "director", "DaoDien", "daodien"),
                firstValue(req, "cast", "DienVien", "dienvien"),
                firstValue(req, "description", "MieuTa", "mieuta"),
                firstValue(req, "Trailer_ID", "TrailerID", "trailerID"),
                posterUrl);
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
        
        poster.transferTo(dir.resolve(fileName).toFile());
        return "/api/uploads/" + fileName;
    }

    private static String value(HttpServletRequest req, String name) {
        String v = req.getParameter(name);
        return v == null ? "" : v;
    }

    private static String firstValue(HttpServletRequest req, String... names) {
        for (String name : names) {
            String value = value(req, name);
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
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

    private static LocalDate normalizeDate(String value) {
        return value == null || value.isBlank() ? LocalDate.now() : LocalDate.parse(value.split("T")[0]);
    }
}
