package com.duanweb.duanweb.Repository;

import com.duanweb.duanweb.Entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Map;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(value = "SELECT s.HangGhe, s.SoGhe FROM BookingSeat bs "
            + "JOIN Booking b ON bs.BookingID = b.BookingID "
            + "JOIN Seat s ON bs.SeatID = s.SeatID "
            + "WHERE b.ShowTimeID = :showtimeId AND b.TrangThai <> 'DaHuy' AND bs.SeatID IN (:seatIds)", nativeQuery = true)
    List<Map<String, Object>> findTakenSeatRowsForUpdate(Integer showtimeId, List<Integer> seatIds);
}