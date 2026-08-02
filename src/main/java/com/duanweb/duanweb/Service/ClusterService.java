package com.duanweb.duanweb.Service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Luật chọn ghế "không để trống 1 ghế lẻ" (lấy từ seat-booking-app demo,
 * tổng quát hoá để chạy trực tiếp trên dữ liệu ghế THẬT trong bảng Seat,
 * không giả định trước sơ đồ 2-4-4-2).
 *
 * Trong một hàng, với danh sách số ghế (SoGhe) đã tồn tại theo đúng thứ tự
 * (đã sắp xếp), 2 ghế được coi là "liền nhau" nếu đứng cạnh nhau trong danh
 * sách đó (không phải chênh lệch đúng 1 về số — vì SoGhe trong DB có thể đã
 * có khoảng trống cho lối đi sẵn). Với 1 khối ghế trống liên tục, phần ghế
 * còn lại ở hai bên chỗ khách chọn phải bằng 0 hoặc từ 2 trở lên — không bao
 * giờ để lại đúng 1 ghế lẻ.
 */
@Service
public class ClusterService {

    /**
     * @param rowSeatNumbers danh sách SoGhe đã tồn tại trong hàng đó, đã sort tăng dần
     * @param soldNumbers    tập SoGhe đã bán trong hàng đó
     * @param count          số vé muốn mua
     * @return danh sách các cách xếp hợp lệ, mỗi cách là 1 List<Integer> SoGhe liên tiếp
     */
    public List<List<Integer>> validPlacements(List<Integer> rowSeatNumbers, Set<Integer> soldNumbers, int count) {
        List<List<Integer>> placements = new ArrayList<>();
        if (count < 1 || count > rowSeatNumbers.size()) return placements;

        int i = 0;
        int n = rowSeatNumbers.size();
        while (i < n) {
            if (soldNumbers.contains(rowSeatNumbers.get(i))) { i++; continue; }
            int start = i;
            while (i < n && !soldNumbers.contains(rowSeatNumbers.get(i))) i++;
            int runLength = i - start; // khối trống liên tục: index [start, i-1]

            for (int p = 0; p <= runLength - count; p++) {
                int before = p;
                int after = runLength - count - p;
                boolean beforeOk = before == 0 || before >= 2;
                boolean afterOk = after == 0 || after >= 2;
                if (beforeOk && afterOk) {
                    placements.add(new ArrayList<>(rowSeatNumbers.subList(start + p, start + p + count)));
                }
            }
        }
        return placements;
    }

    /** Kiểm tra 1 cách chọn ghế (đã biết cùng hàng, đã sort) có hợp lệ theo đúng luật trên không. */
    public boolean isValidBooking(List<Integer> rowSeatNumbers, Set<Integer> soldNumbers, List<Integer> candidateSorted) {
        for (List<Integer> valid : validPlacements(rowSeatNumbers, soldNumbers, candidateSorted.size())) {
            if (valid.equals(candidateSorted)) return true;
        }
        return false;
    }
}
