package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Entity.CinemaRoom;
import com.duanweb.duanweb.Entity.Movie;
import com.duanweb.duanweb.Entity.Showtime;
import com.duanweb.duanweb.Repository.CinemaRoomRepository;
import com.duanweb.duanweb.Repository.MovieRepository;
import com.duanweb.duanweb.Repository.ShowtimeRepository;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final CinemaRoomRepository cinemaRoomRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository,
                            MovieRepository movieRepository,
                            CinemaRoomRepository cinemaRoomRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.cinemaRoomRepository = cinemaRoomRepository;
    }

    public List<Map<String, Object>> findByMovieId(Integer movieId) {
        return showtimeRepository.findByMovieIDOrderByThoiGianBatDauAsc(movieId).stream()
                .map(this::toMap)
                .toList();
    }

    public Showtime addShowtime(Integer movieId, Integer roomId, String date, String time) {
        Optional<Movie> movie = movieRepository.findById(movieId);
        if (movie.isEmpty()) {
            throw new IllegalArgumentException("MovieID không tồn tại!");
        }

        if (roomId == null || roomId <= 0 || !cinemaRoomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("Phòng chiếu không hợp lệ!");
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

    public List<Map<String, Object>> findAllRooms() {
        return cinemaRoomRepository.findAllByOrderByTenPhongAsc().stream()
                .map(this::toRoomMap)
                .toList();
    }

    public CinemaRoom addRoom(String tenPhong, Integer tongChoNgoi, String trangThai) {
        if (tenPhong == null || tenPhong.isBlank()) {
            throw new IllegalArgumentException("Tên phòng không được để trống!");
        }
        if (tongChoNgoi == null || tongChoNgoi <= 0) {
            throw new IllegalArgumentException("Tổng chỗ ngồi phải lớn hơn 0!");
        }

        boolean exists = cinemaRoomRepository.findAllByOrderByTenPhongAsc().stream()
                .anyMatch(r -> tenPhong.trim().equalsIgnoreCase(r.getTenPhong()));
        if (exists) {
            throw new IllegalStateException("Tên phòng chiếu này đã tồn tại!");
        }

        CinemaRoom room = new CinemaRoom();
        room.setTenPhong(tenPhong.trim());
        room.setTongChoNgoi(tongChoNgoi);
        room.setTrangThai((trangThai == null || trangThai.isBlank()) ? "Hoạt động" : trangThai.trim());
        return cinemaRoomRepository.save(room);
    }

    public CinemaRoom updateRoom(Integer roomId, String tenPhong, Integer tongChoNgoi, String trangThai) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng chiếu!"));

        if (tenPhong == null || tenPhong.isBlank()) {
            throw new IllegalArgumentException("Tên phòng không được để trống!");
        }
        if (tongChoNgoi == null || tongChoNgoi <= 0) {
            throw new IllegalArgumentException("Tổng chỗ ngồi phải lớn hơn 0!");
        }

        boolean trung = cinemaRoomRepository.findAllByOrderByTenPhongAsc().stream()
                .anyMatch(r -> !r.getRoomID().equals(roomId)
                        && tenPhong.trim().equalsIgnoreCase(r.getTenPhong()));
        if (trung) {
            throw new IllegalStateException("Tên phòng chiếu này đã tồn tại!");
        }

        room.setTenPhong(tenPhong.trim());
        room.setTongChoNgoi(tongChoNgoi);
        if (trangThai != null && !trangThai.isBlank()) {
            room.setTrangThai(trangThai.trim());
        }
        return cinemaRoomRepository.save(room);
    }

    public void deleteRoom(Integer roomId) {
        if (!cinemaRoomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("Không tìm thấy phòng chiếu!");
        }
        try {
            cinemaRoomRepository.deleteById(roomId);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException(
                    "Không thể xoá: phòng chiếu này đang có suất chiếu hoặc ghế liên kết!");
        }
    }

    private Map<String, Object> toRoomMap(CinemaRoom room) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("RoomID", room.getRoomID());
        map.put("TenPhong", room.getTenPhong());
        map.put("TongChoNgoi", room.getTongChoNgoi());
        map.put("TrangThai", room.getTrangThai());
        return map;
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
