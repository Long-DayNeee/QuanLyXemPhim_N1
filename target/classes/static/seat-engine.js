/* ============================================================
   SEAT ENGINE — sơ đồ ghế dạng cụm (2-4-2-4) + luật chọn ghế
   kiểu Lotte Cinema. Thay thế logic seat-map cũ trong script.js
   dành cho ChiTietSanPham.html.
   ============================================================

   Sơ đồ 1 hàng (12 cột, chia 4 cụm):
   [1 2] [3 4 5 6] [7 8] [9 10 11 12]
    2ghế    4ghế    2ghế    4ghế

   Luật:
   - Mua 1 vé  -> chỉ ghế NGOÀI RÌA của cụm 4 ghế (vị trí 1 hoặc 4 trong cụm)
   - Mua 2 vé  -> 2 ghế liền nhau, KHÔNG phải cặp giữa cụm 4 ghế (1-2 hoặc 3-4,
                  không được 2-3); hoặc trọn cụm 2 ghế
   - Mua 3 vé  -> 3 ghế liền nhau trong 1 cụm 4 ghế (1-2-3 hoặc 2-3-4)
   - Mua 4 vé  -> trọn 1 cụm 4 ghế
   - Ghế đã bán hiển thị dấu X, không chọn được
   ============================================================ */

const SeatEngine = (function () {
  const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  // Định nghĩa cụm ghế theo cột: [colStart, colEnd, size]
  const BLOCKS = [
    { start: 1, end: 2, size: 2 },
    { start: 3, end: 6, size: 4 },
    { start: 7, end: 8, size: 2 },
    { start: 9, end: 12, size: 4 },
  ];
  const TOTAL_COLS = 12;
  // Ưu tiên hàng giữa rạp trước (giống cinema thật) khi gợi ý option
  const ROW_PRIORITY = ['D', 'E', 'C', 'F', 'B', 'G', 'A', 'H'];

  function seatId(row, col) { return `${row}${col}`; }

  /* Sinh danh sách vị trí hợp lệ (tương đối trong cụm) theo số vé */
  function positionSetsForQty(qty, blockSize) {
    if (blockSize === 4) {
      if (qty === 1) return [[1], [4]];               // 2 lựa chọn ghế đơn ngoài rìa
      if (qty === 2) return [[1, 2], [3, 4]];          // không cho [2,3] (cặp giữa)
      if (qty === 3) return [[1, 2, 3], [2, 3, 4]];
      if (qty === 4) return [[1, 2, 3, 4]];
    }
    if (blockSize === 2 && qty === 2) return [[1, 2]]; // trọn cụm đôi
    return [];
  }

  /**
   * Tìm tối đa `limit` option ghế hợp lệ, ưu tiên hàng giữa rạp.
   * bookedSeats: Set<string> các seatId đã bán/đã đặt.
   */
  function findOptions(qty, bookedSeats, limit = 4) {
    if (qty < 1) return [];
    const options = [];

    for (const row of ROW_PRIORITY) {
      for (const block of BLOCKS) {
        const posSets = positionSetsForQty(qty, block.size);
        for (const posSet of posSets) {
          const seats = posSet.map((p) => seatId(row, block.start + p - 1));
          const allFree = seats.every((s) => !bookedSeats.has(s));
          if (allFree) {
            options.push({ row, seats, label: `Hàng ${row} · Ghế ${seats.map(s => s.slice(1)).join(', ')}` });
          }
        }
      }
      if (options.length >= limit) break;
    }
    return options.slice(0, limit);
  }

  /* Render toàn bộ sơ đồ (dùng để hiển thị, không còn click chọn tự do) */
  function renderGrid(container, bookedSeats, selectedSeats) {
    container.innerHTML = '';
    container.classList.add('seat-grid-2424');

    ROWS.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      const rowLabelL = document.createElement('span');
      rowLabelL.className = 'seat-row-label';
      rowLabelL.textContent = row;
      rowEl.appendChild(rowLabelL);

      BLOCKS.forEach((block, bi) => {
        for (let c = block.start; c <= block.end; c++) {
          const id = seatId(row, c);
          const cell = document.createElement('div');
          cell.dataset.seatId = id;

          const isBooked = bookedSeats.has(id);
          const isSelected = selectedSeats.has(id);
          cell.className = 'seat2 ' + (isBooked ? 'is-booked' : isSelected ? 'is-selected' : 'is-free');
          cell.textContent = isBooked ? '' : c;
          rowEl.appendChild(cell);
        }
        if (bi < BLOCKS.length - 1) {
          const gap = document.createElement('div');
          gap.className = 'seat-aisle';
          rowEl.appendChild(gap);
        }
      });

      const rowLabelR = document.createElement('span');
      rowLabelR.className = 'seat-row-label';
      rowLabelR.textContent = row;
      rowEl.appendChild(rowLabelR);

      container.appendChild(rowEl);
    });
  }

  return { findOptions, renderGrid, ROWS, BLOCKS, TOTAL_COLS };
})();
