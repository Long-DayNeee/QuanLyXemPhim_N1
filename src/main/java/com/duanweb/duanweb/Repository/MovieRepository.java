package com.duanweb.duanweb.Repository;

import com.duanweb.duanweb.Entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie,Integer> {

    List<Movie> findAllByOrderByMovieIDDesc();

    @Modifying
    @Query(value = "DELETE FROM BookingSeat WHERE BookingID IN ("
            + "SELECT b.BookingID FROM Booking b JOIN Showtime s ON b.ShowTimeID = s.ShowTimeID "
            + "WHERE s.MovieID = :movieId)", nativeQuery = true)
    void deleteBookingSeatsByMovieId(Integer movieId);

    @Modifying
    @Query(value = "DELETE FROM Booking WHERE ShowTimeID IN ("
            + "SELECT ShowTimeID FROM Showtime WHERE MovieID = :movieId)", nativeQuery = true)
    void deleteBookingsByMovieId(Integer movieId);

    @Modifying
    @Query(value = "DELETE FROM Showtime WHERE MovieID = :movieId", nativeQuery = true)
    void deleteShowtimesByMovieId(Integer movieId);
}