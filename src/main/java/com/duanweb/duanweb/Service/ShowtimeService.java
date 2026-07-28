package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Entity.Movie;
import com.duanweb.duanweb.Entity.Showtime;
import com.duanweb.duanweb.Repository.MovieRepository;
import com.duanweb.duanweb.Repository.ShowtimeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ShowtimeService {

    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository, MovieRepository movieRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
    }

    public List<Map<String, Object>> findByMovieId(Integer movieId) {
        return showtimeRepository.findByMovieIDOrderByThoiGianBatDauAsc(movieId).stream()
                .map(this::toMap)
                .toList();
    }

    public Showtime addShowtime(Integer movieId, String date, String time) {
        Optional<Movie> movie = movieRepository.findById(movieId);
        if (movie.isEmpty()) {
            throw new IllegalArgumentException("MovieID không tồn tại!");
        }

        Integer roomId = showtimeRepository.findAnyExistingRoomId();
        if (roomId == null || roomId <= 0) {
            throw new IllegalStateException("Chưa có phòng chiếu nào trong CinemaRoom!");
        }

        LocalDateTime start = LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));
        int duration = movie.get().getThoiLuong() == null || movie.get().getThoiLuong() <= 0 ? 120 : movie.get().getThoiLuong();

        Showtime showtime = new Showtime();
        showtime.setMovieID(movieId);
        showtime.setRoomID(roomId);
        showtime.setThoiGianBatDau(start);
        showtime.setThoiGianKetThuc(start.plusMinutes(duration));
        return showtimeRepository.save(showtime);
    }

    public void delete(Integer id) {
        showtimeRepository.deleteById(id);
    }

    private Map<String, Object> toMap(Showtime showtime) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("ShowTimeID", showtime.getShowTimeID());
        map.put("MovieID", showtime.getMovieID());
        map.put("RoomID", showtime.getRoomID());
        map.put("ThoiGianBatDau", showtime.getThoiGianBatDau());
        map.put("ThoiGianKetThuc", showtime.getThoiGianKetThuc());
        if (showtime.getThoiGianBatDau() != null) {
            map.put("startTime", showtime.getThoiGianBatDau().format(DISPLAY_FORMATTER));
        }
        return map;
    }
}