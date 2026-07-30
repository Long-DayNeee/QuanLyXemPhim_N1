package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Entity.Movie;
import com.duanweb.duanweb.Repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MovieApiService {

    private final MovieRepository movieRepository;

    public MovieApiService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Map<String, Object>> findAllAsMap() {
        return movieRepository.findAllByOrderByMovieIDDesc().stream().map(this::toMap).toList();
    }

    public Optional<Map<String, Object>> findByIdAsMap(Integer id) {
        return movieRepository.findById(id).map(this::toMap);
    }

    public String findPosterUrl(Integer id) {
        return movieRepository.findById(id).map(Movie::getPosterUrl).orElse("");
    }

    public Integer create(MovieData data) {
        Movie movie = new Movie();
        applyData(movie, data);
        return movieRepository.save(movie).getMovieID();
    }

    public void update(Integer id, MovieData data) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Movie not found"));
        applyData(movie, data);
        movieRepository.save(movie);
    }

    @Transactional
    public void delete(Integer id) {
        movieRepository.deleteBookingSeatsByMovieId(id);
        movieRepository.deleteBookingsByMovieId(id);
        movieRepository.deleteShowtimesByMovieId(id);
        movieRepository.deleteById(id);
    }

    private void applyData(Movie movie, MovieData data) {
        movie.setTieuDe(data.tieuDe());
        movie.setThoiLuong(data.thoiLuong());
        movie.setDoTuoi(data.doTuoi());
        movie.setNgayKhoiChieu(data.ngayKhoiChieu());
        movie.setTheLoai(data.theLoai());
        movie.setGiaVe(data.giaVe());
        movie.setNgonNgu(data.ngonNgu());
        movie.setDaoDien(data.daoDien());
        movie.setDienVien(data.cast());
        movie.setMieuTa(data.mieuTa());
        movie.setTrailerID(data.trailerID());
        movie.setPosterUrl(data.posterUrl());
    }

    private Map<String, Object> toMap(Movie movie) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("MovieID", movie.getMovieID());
        map.put("movieId", movie.getMovieID());
        map.put("TieuDe", movie.getTieuDe());
        map.put("title", movie.getTieuDe());
        map.put("ThoiLuong", movie.getThoiLuong());
        map.put("duration", movie.getThoiLuong());
        map.put("DoTuoi", movie.getDoTuoi());
        map.put("ageRate", movie.getDoTuoi());
        map.put("NgayKhoiChieu", movie.getNgayKhoiChieu());
        map.put("premiere", movie.getNgayKhoiChieu());
        map.put("TheLoai", movie.getTheLoai());
        map.put("GiaVe", movie.getGiaVe());
        map.put("price", movie.getGiaVe());
        map.put("NgonNgu", movie.getNgonNgu());
        map.put("language", movie.getNgonNgu());
        map.put("DaoDien", movie.getDaoDien());
        map.put("director", movie.getDaoDien());
        map.put("DienVien", movie.getDienVien());
        map.put("cast", movie.getDienVien());
        map.put("MieuTa", movie.getMieuTa());
        map.put("description", movie.getMieuTa());
        map.put("TrailerID", movie.getTrailerID());
        map.put("Trailer_ID", movie.getTrailerID());
        map.put("PosterUrl", movie.getPosterUrl());
        map.put("posterUrl", movie.getPosterUrl());
        return map;
    }

    public record MovieData(
            String tieuDe,
            Integer thoiLuong,
            String doTuoi,
            LocalDate ngayKhoiChieu,
            String theLoai,
            BigDecimal giaVe,
            String ngonNgu,
            String daoDien,
            String cast,
            String mieuTa,
            String trailerID,
            String posterUrl) {
    }
}