package com.duanweb.duanweb.controller;

import com.duanweb.duanweb.Repository.BookingRepository;
import com.duanweb.duanweb.Repository.SeatRepository;
import com.duanweb.duanweb.Service.BookingService;
import com.duanweb.duanweb.Service.ClusterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Trang "Chọn Ghế" (page 2 của luồng đặt vé 3 trang):
 * GET /api/seatmap/{showtimeId}?count=2
 *  -> toàn bộ sơ đồ ghế thật của phòng chiếu đó (theo Seat/RoomID trong DB)
 *     + trạng thái đã bán/còn trống + danh sách "Lựa chọn" hợp lệ cho count vé,
 *     áp dụng đúng luật "không để trống 1 ghế lẻ" (ClusterService).
 */
@RestController
@RequestMapping("/api/seatmap")
public class SeatMapController {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final BookingService bookingService;
    private final ClusterService clusterService;

    public SeatMapController(BookingRepository bookingRepository, SeatRepository seatRepository,
                              BookingService bookingService, ClusterService clusterService) {
        this.bookingRepository = bookingRepository;
        this.seatRepository = seatRepository;
        this.bookingService = bookingService;
        this.clusterService = clusterService;
    }

    @GetMapping("/{showtimeId}")
    public ResponseEntity<?> getSeatMap(@PathVariable Integer showtimeId,
                                         @RequestParam(value = "count", defaultValue = "1") Integer count) {
        List<Map<String, Object>> infoRows = bookingRepository.findShowtimeBookingInfo(showtimeId);
        if (infoRows.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Suất chiếu không tồn tại"));
        }
        Map<String, Object> info = infoRows.get(0);
        Integer roomId = ((Number) info.get("RoomID")).intValue();
        BigDecimal price = (BigDecimal) info.get("GiaVe");

        List<Map<String, Object>> seatRows = seatRepository.findSeatRowsByRoomId(roomId);
        Set<String> bookedCodes = new HashSet<>(bookingService.findBookedSeatCodes(showtimeId));

        // Gom theo HangGhe, giữ SoGhe đã sort tăng dần
        Map<String, List<Map<String, Object>>> byRow = new TreeMap<>();
        for (Map<String, Object> row : seatRows) {
            String hang = String.valueOf(row.get("HangGhe"));
            byRow.computeIfAbsent(hang, k -> new ArrayList<>()).add(row);
        }
        for (List<Map<String, Object>> rowSeats : byRow.values()) {
            rowSeats.sort(Comparator.comparingInt(r -> ((Number) r.get("SoGhe")).intValue()));
        }

        List<Map<String, Object>> rowsOut = new ArrayList<>();
        List<Map<String, Object>> optionsOut = new ArrayList<>();

        for (Map.Entry<String, List<Map<String, Object>>> entry : byRow.entrySet()) {
            String hang = entry.getKey();
            List<Map<String, Object>> rowSeats = entry.getValue();

            List<Integer> soGheList = rowSeats.stream()
                    .map(r -> ((Number) r.get("SoGhe")).intValue()).toList();
            Set<Integer> sold = rowSeats.stream()
                    .filter(r -> bookedCodes.contains(hang + r.get("SoGhe")))
                    .map(r -> ((Number) r.get("SoGhe")).intValue())
                    .collect(Collectors.toSet());

            List<Map<String, Object>> seatsJson = new ArrayList<>();
            for (Map<String, Object> r : rowSeats) {
                int soGhe = ((Number) r.get("SoGhe")).intValue();
                Map<String, Object> seatJson = new LinkedHashMap<>();
                seatJson.put("seatId", hang + soGhe);
                seatJson.put("soGhe", soGhe);
                seatJson.put("sold", sold.contains(soGhe));
                seatsJson.add(seatJson);
            }
            Map<String, Object> rowJson = new LinkedHashMap<>();
            rowJson.put("row", hang);
            rowJson.put("seats", seatsJson);
            rowsOut.add(rowJson);

            if (count != null && count >= 1) {
                for (List<Integer> placement : clusterService.validPlacements(soGheList, sold, count)) {
                    Map<String, Object> opt = new LinkedHashMap<>();
                    List<String> seatCodes = placement.stream().map(n -> hang + n).toList();
                    opt.put("row", hang);
                    opt.put("seats", seatCodes);
                    opt.put("label", "Hàng " + hang + " · Ghế " + String.join(", ", placement.stream().map(String::valueOf).toList()));
                    optionsOut.add(opt);
                    if (optionsOut.size() >= 6) break;
                }
            }
            if (optionsOut.size() >= 6) break;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("roomId", roomId);
        result.put("price", price);
        result.put("rows", rowsOut);
        result.put("options", optionsOut);
        return ResponseEntity.ok(result);
    }
}
