package com.duanweb.duanweb.Repository;

import com.duanweb.duanweb.Entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Integer> {

    List<Showtime> findByMovieIDOrderByThoiGianBatDauAsc(Integer movieID);

    @Query(value = "SELECT MIN(RoomID) FROM CinemaRoom", nativeQuery = true)
    Integer findAnyExistingRoomId();
}