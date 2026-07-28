package com.duanweb.duanweb.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Map;

public interface SeatRepository extends Repository<com.duanweb.duanweb.Entity.BookingSeat, Long> {

    @Query(value = "SELECT SeatID, HangGhe, SoGhe FROM Seat WHERE RoomID = :roomId", nativeQuery = true)
    List<Map<String, Object>> findSeatRowsByRoomId(Integer roomId);
}