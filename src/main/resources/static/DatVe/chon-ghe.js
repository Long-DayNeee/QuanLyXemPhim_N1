// // (function () {
// //   const params = new URLSearchParams(window.location.search);
// //   const movieId = params.get('movieId');
// //   const showtimeId = params.get('showtimeId');
// //   const time = params.get('time') || '--:--';
// //   const date = params.get('date') || '';
// //   const MAX_COUNT = 8;
// //
// //   if (!movieId || !showtimeId) {
// //     document.querySelector('.flow-page').innerHTML =
// //       '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu thông tin suất chiếu. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
// //     return;
// //   }
// //
// //   let count = 2;
// //   let seatmap = null; // { roomId, price, rows: [{row, seats:[{seatId,soGhe,sold}]}] }
// //   let selectedSeats = new Set();
// //
// //   const el = (id) => document.getElementById(id);
// //   const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';
// //   const seatRow = (seatId) => seatId.match(/^[A-Za-z]+/)[0];
// //
// //   function showToast(msg, type) {
// //     const t = el('toast');
// //     t.textContent = msg;
// //     t.className = 'toast show ' + (type || '');
// //     setTimeout(() => (t.className = 'toast'), 2800);
// //   }
// //
// //   async function loadMovieBar() {
// //     const movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
// //     el('movieBar').innerHTML = `
// //       <img src="${movie.PosterUrl || ''}" alt="${movie.TieuDe || ''}" />
// //       <div>
// //         <h3>${movie.TieuDe || ''}</h3>
// //         <p>${date ? date.split('-').reverse().join('/') : ''} · ${time}</p>
// //       </div>
// //     `;
// //   }
// //
// //   async function fetchSeatMap() {
// //     try {
// //       const res = await fetch(`/api/seatmap/${showtimeId}`);
// //       seatmap = await res.json();
// //     } catch (e) {
// //       showToast('Không tải được sơ đồ ghế, vui lòng thử lại.', 'err');
// //       return;
// //     }
// //     el('priceHint').textContent = `${fmt(Number(seatmap.price) || 0)}/vé · tối đa ${MAX_COUNT} người`;
// //     renderAll();
// //   }
// //
// //   function seatPrice() {
// //     return Number(seatmap?.price) || 0;
// //   }
// //
// //   /* ─── Rule engine — tổng quát trên dữ liệu ghế thật ───────────────────────
// //      Trong 1 hàng, ghế khách đã chọn phải LIỀN VỊ TRÍ trong danh sách ghế
// //      thật của hàng đó (không cần biết trước cụm 2/4/2/4 hay không). */
// //   function computeGaps() {
// //     const gapSeatIds = new Set();
// //     const invalidSeatIds = new Set();
// //     if (!seatmap) return { gapSeatIds, invalidSeatIds };
// //
// //     seatmap.rows.forEach((row) => {
// //       const seatIds = row.seats.map((s) => s.seatId);
// //       const selIdx = [];
// //       seatIds.forEach((id, idx) => { if (selectedSeats.has(id)) selIdx.push(idx); });
// //       if (selIdx.length === 0) return;
// //
// //       const min = Math.min(...selIdx);
// //       const max = Math.max(...selIdx);
// //       if (max - min + 1 === selIdx.length) return; // đã liền nhau
// //
// //       selIdx.forEach((i) => invalidSeatIds.add(seatIds[i]));
// //       for (let i = min; i <= max; i++) {
// //         if (!selectedSeats.has(seatIds[i])) gapSeatIds.add(seatIds[i]);
// //       }
// //     });
// //     return { gapSeatIds, invalidSeatIds };
// //   }
// //
// //   function renderAll() {
// //     const state = computeGaps();
// //     renderSeatMap(state);
// //     renderProgress(state);
// //     renderRuleNote(state);
// //     renderBottomBar(state);
// //   }
// //
// //   function renderSeatMap(state) {
// //     if (!seatmap) return;
// //     const container = el('seatmapInner');
// //     container.innerHTML = '';
// //
// //     seatmap.rows.forEach((row) => {
// //       const rowEl = document.createElement('div');
// //       rowEl.className = 'row';
// //
// //       const label1 = document.createElement('span');
// //       label1.className = 'row-label';
// //       label1.textContent = row.row;
// //       rowEl.appendChild(label1);
// //
// //       const groupEl = document.createElement('div');
// //       groupEl.className = 'group';
// //
// //       row.seats.forEach((seat) => {
// //         const seatEl = document.createElement('div');
// //         const isSold = seat.sold;
// //         const isSel = selectedSeats.has(seat.seatId);
// //         const isGap = !isSold && !isSel && state.gapSeatIds.has(seat.seatId);
// //         const isInvalidSel = isSel && state.invalidSeatIds.has(seat.seatId);
// //         seatEl.className = 'seat'
// //           + (isSold ? ' sold' : '')
// //           + (isSel ? ' selected' : '')
// //           + (isGap ? ' orphan' : '')
// //           + (isInvalidSel ? ' invalid' : '');
// //         seatEl.textContent = isSold ? '' : seat.soGhe;
// //         seatEl.title = seat.seatId;
// //         if (!isSold) seatEl.onclick = () => toggleSeat(seat.seatId);
// //         groupEl.appendChild(seatEl);
// //       });
// //
// //       rowEl.appendChild(groupEl);
// //       container.appendChild(rowEl);
// //     });
// //   }
// //
// //   function renderProgress(state) {
// //     const badge = el('progressBadge');
// //     badge.textContent = `Đã chọn ${selectedSeats.size}/${count} ghế`;
// //     const isFull = selectedSeats.size === count;
// //     const isValid = state.invalidSeatIds.size === 0;
// //     badge.className = 'progress-badge' + (isFull && isValid ? ' ready' : isFull && !isValid ? ' warn' : '');
// //   }
// //
// //   function renderRuleNote(state) {
// //     const note = el('ruleNote');
// //     if (state.invalidSeatIds.size > 0) {
// //       note.className = 'rule-note warn';
// //       note.textContent = '⚠ Ghế bạn chọn đang bị đứt quãng (ghế viền vàng ở giữa chưa được chọn) — hãy chọn nốt ghế đó, hoặc bỏ chọn để đổi vị trí khác.';
// //     } else {
// //       note.className = 'rule-note';
// //       note.textContent = `Mua tối đa ${MAX_COUNT} vé/lượt. Có thể chọn nhiều cụm ghế ở các vị trí khác nhau, miễn ghế trong cùng 1 hàng mà bạn chọn phải liền kề nhau, không bỏ sót ghế ở giữa.`;
// //     }
// //   }
// //
// //   function renderBottomBar(state) {
// //     const bar = el('bottombar');
// //     if (selectedSeats.size === 0) { bar.className = 'bottombar'; return; }
// //     bar.className = 'bottombar show';
// //
// //     const seatsSorted = [...selectedSeats].sort();
// //     const total = seatsSorted.length * seatPrice();
// //
// //     el('bbSeatsLine').innerHTML = `Ghế đã chọn: <span style="color:var(--gold);">${seatsSorted.join(', ')}</span>`;
// //     el('bbCountLine').textContent = `${selectedSeats.size}/${count} vé`;
// //     el('bbTotal').textContent = `Tổng: ${fmt(total)}`;
// //
// //     const ready = selectedSeats.size === count && state.invalidSeatIds.size === 0;
// //     el('confirmBtn').disabled = !ready;
// //     el('confirmBtn').textContent = ready ? 'Xác Nhận →'
// //       : state.invalidSeatIds.size > 0 ? 'Ghế đang bị đứt quãng'
// //       : `Chọn thêm ${count - selectedSeats.size} ghế`;
// //   }
// //
// //   function toggleSeat(seatId) {
// //     if (selectedSeats.has(seatId)) {
// //       selectedSeats.delete(seatId);
// //     } else {
// //       if (selectedSeats.size >= count) {
// //         showToast(`Bạn đã chọn đủ ${count} ghế. Bỏ chọn bớt trước khi chọn ghế khác.`, 'err');
// //         return;
// //       }
// //       selectedSeats.add(seatId);
// //     }
// //     renderAll();
// //   }
// //
// //   function goToPayment() {
// //     const state = computeGaps();
// //     if (selectedSeats.size !== count || state.invalidSeatIds.size > 0) return;
// //     const seatsParam = [...selectedSeats].sort().join(',');
// //     const url = `/DatVe/ThanhToan.html?movieId=${movieId}&showtimeId=${showtimeId}`
// //       + `&time=${encodeURIComponent(time)}&date=${encodeURIComponent(date)}`
// //       + `&seats=${encodeURIComponent(seatsParam)}`;
// //     window.location.href = url;
// //   }
// //
// //   el('decBtn').onclick = () => {
// //     if (count <= 1) return;
// //     count -= 1; el('countVal').textContent = count;
// //     selectedSeats = new Set(); renderAll();
// //   };
// //   el('incBtn').onclick = () => {
// //     if (count >= MAX_COUNT) return;
// //     count += 1; el('countVal').textContent = count;
// //     selectedSeats = new Set(); renderAll();
// //   };
// //   el('clearBtn').onclick = () => { selectedSeats = new Set(); renderAll(); };
// //   el('confirmBtn').onclick = goToPayment;
// //
// //   el('countVal').textContent = count;
// //   loadMovieBar();
// //   fetchSeatMap();
// // })();
//
// (function () {
//   const params = new URLSearchParams(window.location.search);
//   const movieId = params.get('movieId');
//   const showtimeId = params.get('showtimeId');
//   const time = params.get('time') || '--:--';
//   const date = params.get('date') || '';
//   const MAX_COUNT = 8;
//
//   // Cụm ghế cố định 2-4-4-2, giống hệt seat-booking-app: mỗi hàng chia
//   // thành 4 cụm theo dải số ghế, có lối đi ngăn cách giữa các cụm.
//   const GROUPS = [[1, 2], [3, 4, 5, 6], [7, 8, 9, 10], [11, 12]];
//   const VIP_ROWS = new Set(['D', 'E']);
//
//   if (!movieId || !showtimeId) {
//     document.querySelector('.flow-page').innerHTML =
//         '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu thông tin suất chiếu. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
//     return;
//   }
//
//   let count = 2;
//   let seatmap = null; // { roomId, price, rows: [{row, seats:[{seatId,soGhe,sold}]}] }
//   let selectedSeats = new Set();
//
//   const el = (id) => document.getElementById(id);
//   const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';
//   const seatRow = (seatId) => seatId.match(/^[A-Za-z]+/)[0];
//
//   function showToast(msg, type) {
//     const t = el('toast');
//     t.textContent = msg;
//     t.className = 'toast show ' + (type || '');
//     setTimeout(() => (t.className = 'toast'), 2800);
//   }
//
//   async function loadMovieBar() {
//     const movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
//     el('movieBar').innerHTML = `
//       <img src="${movie.PosterUrl || ''}" alt="${movie.TieuDe || ''}" />
//       <div>
//         <h3>${movie.TieuDe || ''}</h3>
//         <p>${date ? date.split('-').reverse().join('/') : ''} · ${time}</p>
//       </div>
//     `;
//   }
//
//   async function fetchSeatMap() {
//     try {
//       const res = await fetch(`/api/seatmap/${showtimeId}`);
//       seatmap = await res.json();
//     } catch (e) {
//       showToast('Không tải được sơ đồ ghế, vui lòng thử lại.', 'err');
//       return;
//     }
//     el('priceHint').textContent = `${fmt(Number(seatmap.price) || 0)}/vé · tối đa ${MAX_COUNT} người`;
//     renderAll();
//   }
//
//   function seatPrice() {
//     return Number(seatmap?.price) || 0;
//   }
//
//   /* Lấy seat thật (nếu có) theo hàng + số ghế */
//   function findSeat(row, soGhe) {
//     const rowData = seatmap.rows.find((r) => r.row === row);
//     if (!rowData) return null;
//     return rowData.seats.find((s) => s.soGhe === soGhe) || null;
//   }
//
//   /* ─── Rule engine — y hệt seat-booking-app: luật áp dụng THEO TỪNG CỤM ─── */
//   function computeGaps() {
//     const gapSeatIds = new Set();
//     const invalidSeatIds = new Set();
//     if (!seatmap) return { gapSeatIds, invalidSeatIds };
//
//     seatmap.rows.forEach((rowData) => {
//       const row = rowData.row;
//       GROUPS.forEach((group) => {
//         // chỉ xét những số ghế thực sự tồn tại trong DB ở hàng này
//         const groupExisting = group.filter((n) => findSeat(row, n));
//         const selectedInGroup = groupExisting.filter((n) => selectedSeats.has(row + n));
//         if (selectedInGroup.length === 0) return;
//
//         // cụm đôi (2 ghế): phải chọn trọn cả 2, không chọn lẻ 1 ghế
//         if (groupExisting.length === 2 && selectedInGroup.length === 1) {
//           invalidSeatIds.add(row + selectedInGroup[0]);
//           const partner = groupExisting.find((n) => n !== selectedInGroup[0]);
//           if (partner != null) gapSeatIds.add(row + partner);
//           return;
//         }
//
//         const min = Math.min(...selectedInGroup);
//         const max = Math.max(...selectedInGroup);
//         if (max - min + 1 === selectedInGroup.length) return; // đã liền nhau
//
//         selectedInGroup.forEach((n) => invalidSeatIds.add(row + n));
//         groupExisting.forEach((n) => {
//           if (n > min && n < max && !selectedSeats.has(row + n)) gapSeatIds.add(row + n);
//         });
//       });
//     });
//     return { gapSeatIds, invalidSeatIds };
//   }
//
//   function renderAll() {
//     const state = computeGaps();
//     renderSeatMap(state);
//     renderProgress(state);
//     renderRuleNote(state);
//     renderBottomBar(state);
//   }
//
//   function renderSeatMap(state) {
//     if (!seatmap) return;
//     const container = el('seatmapInner');
//     container.innerHTML = '';
//
//     seatmap.rows.forEach((rowData) => {
//       const row = rowData.row;
//       const isVip = VIP_ROWS.has(row);
//
//       const rowEl = document.createElement('div');
//       rowEl.className = 'row';
//
//       const label1 = document.createElement('span');
//       label1.className = 'row-label' + (isVip ? ' vip' : '');
//       label1.textContent = row;
//       rowEl.appendChild(label1);
//
//       const groupsEl = document.createElement('div');
//       groupsEl.className = 'groups';
//
//       GROUPS.forEach((group) => {
//         const groupEl = document.createElement('div');
//         groupEl.className = 'group';
//
//         group.forEach((n) => {
//           const seat = findSeat(row, n);
//           if (!seat) return; // hàng này không có ghế số n (phòng nhỏ hơn 12 ghế/hàng)
//
//           const seatEl = document.createElement('div');
//           const isSold = seat.sold;
//           const isSel = selectedSeats.has(seat.seatId);
//           const isGap = !isSold && !isSel && state.gapSeatIds.has(seat.seatId);
//           const isInvalidSel = isSel && state.invalidSeatIds.has(seat.seatId);
//           seatEl.className = 'seat'
//               + (isSold ? ' sold' : isVip ? ' vip' : '')
//               + (isSel ? ' selected' : '')
//               + (isGap ? ' orphan' : '')
//               + (isInvalidSel ? ' invalid' : '');
//           seatEl.textContent = isSold ? '' : seat.soGhe;
//           seatEl.title = seat.seatId;
//           if (!isSold) seatEl.onclick = () => toggleSeat(seat.seatId);
//           groupEl.appendChild(seatEl);
//         });
//
//         if (groupEl.children.length > 0) groupsEl.appendChild(groupEl);
//       });
//
//       rowEl.appendChild(groupsEl);
//
//       const label2 = document.createElement('span');
//       label2.className = 'row-label' + (isVip ? ' vip' : '');
//       label2.textContent = row;
//       rowEl.appendChild(label2);
//
//       container.appendChild(rowEl);
//     });
//   }
//
//   function renderProgress(state) {
//     const badge = el('progressBadge');
//     badge.textContent = `Đã chọn ${selectedSeats.size}/${count} ghế`;
//     const isFull = selectedSeats.size === count;
//     const isValid = state.invalidSeatIds.size === 0;
//     badge.className = 'progress-badge' + (isFull && isValid ? ' ready' : isFull && !isValid ? ' warn' : '');
//   }
//
//   function renderRuleNote(state) {
//     const note = el('ruleNote');
//     if (state.invalidSeatIds.size > 0) {
//       note.className = 'rule-note warn';
//       note.textContent = '⚠ Ghế bạn chọn trong cùng 1 cụm đang bị đứt quãng (ghế viền vàng ở giữa chưa được chọn) — hãy chọn nốt ghế đó để liền nhau, hoặc bỏ chọn để đổi vị trí khác.';
//     } else {
//       note.className = 'rule-note';
//       note.textContent = `Mua tối đa ${MAX_COUNT} vé/lượt. Có thể chọn nhiều cụm ghế ở các vị trí khác nhau, miễn ghế trong cùng 1 cụm mà bạn chọn phải liền nhau, không bỏ sót ghế nào ở giữa. Riêng cụm ghế đôi (1-2 và 11-12) phải chọn trọn cả 2 ghế, không chọn lẻ 1 ghế.`;
//     }
//   }
//
//   function renderBottomBar(state) {
//     const bar = el('bottombar');
//     if (selectedSeats.size === 0) { bar.className = 'bottombar'; return; }
//     bar.className = 'bottombar show';
//
//     const seatsSorted = [...selectedSeats].sort();
//     const total = seatsSorted.length * seatPrice();
//     const hasVip = seatsSorted.some((id) => VIP_ROWS.has(seatRow(id)));
//
//     el('bbSeatsLine').innerHTML = `Ghế đã chọn: <span style="color:var(--gold);">${seatsSorted.join(', ')}</span>`
//         + (hasVip ? ' <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(212,164,76,.15);color:var(--gold);margin-left:4px;">có VIP</span>' : '');
//     el('bbCountLine').textContent = `${selectedSeats.size}/${count} vé`;
//     el('bbTotal').textContent = `Tổng: ${fmt(total)}`;
//
//     const ready = selectedSeats.size === count && state.invalidSeatIds.size === 0;
//     el('confirmBtn').disabled = !ready;
//     el('confirmBtn').textContent = ready ? 'Xác Nhận →'
//         : state.invalidSeatIds.size > 0 ? 'Ghế đang bị đứt quãng'
//             : `Chọn thêm ${count - selectedSeats.size} ghế`;
//   }
//
//   function toggleSeat(seatId) {
//     if (selectedSeats.has(seatId)) {
//       selectedSeats.delete(seatId);
//     } else {
//       if (selectedSeats.size >= count) {
//         showToast(`Bạn đã chọn đủ ${count} ghế. Bỏ chọn bớt trước khi chọn ghế khác.`, 'err');
//         return;
//       }
//       selectedSeats.add(seatId);
//     }
//     renderAll();
//   }
//
//   function goToPayment() {
//     const state = computeGaps();
//     if (selectedSeats.size !== count || state.invalidSeatIds.size > 0) return;
//     const seatsParam = [...selectedSeats].sort().join(',');
//     const url = `/DatVe/ThanhToan.html?movieId=${movieId}&showtimeId=${showtimeId}`
//         + `&time=${encodeURIComponent(time)}&date=${encodeURIComponent(date)}`
//         + `&seats=${encodeURIComponent(seatsParam)}`;
//     window.location.href = url;
//   }
//
//   el('decBtn').onclick = () => {
//     if (count <= 1) return;
//     count -= 1; el('countVal').textContent = count;
//     selectedSeats = new Set(); renderAll();
//   };
//   el('incBtn').onclick = () => {
//     if (count >= MAX_COUNT) return;
//     count += 1; el('countVal').textContent = count;
//     selectedSeats = new Set(); renderAll();
//   };
//   el('clearBtn').onclick = () => { selectedSeats = new Set(); renderAll(); };
//   el('confirmBtn').onclick = goToPayment;
//
//   el('countVal').textContent = count;
//   loadMovieBar();
//   fetchSeatMap();
// })();


(function () {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movieId');
  const showtimeId = params.get('showtimeId');
  const time = params.get('time') || '--:--';
  const date = params.get('date') || '';
  const MAX_COUNT = 8;

  // Cụm ghế cố định 2-4-4-2, giống hệt seat-booking-app: mỗi hàng chia
  // thành 4 cụm theo dải số ghế, có lối đi ngăn cách giữa các cụm.
  const GROUPS = [[1, 2], [3, 4, 5, 6], [7, 8, 9, 10], [11, 12]];
  const VIP_ROWS = new Set(['D', 'E']);

  if (!movieId || !showtimeId) {
    document.querySelector('.flow-page').innerHTML =
        '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu thông tin suất chiếu. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
    return;
  }

  let count = 2;
  let seatmap = null; // { roomId, price, rows: [{row, seats:[{seatId,soGhe,sold}]}] }
  let selectedSeats = new Set();

  const el = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';
  const seatRow = (seatId) => seatId.match(/^[A-Za-z]+/)[0];

  function showToast(msg, type) {
    const t = el('toast');
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    setTimeout(() => (t.className = 'toast'), 2800);
  }

  async function loadMovieBar() {
    const movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
    el('movieBar').innerHTML = `
      <img src="${movie.PosterUrl || ''}" alt="${movie.TieuDe || ''}" />
      <div>
        <h3>${movie.TieuDe || ''}</h3>
        <p>${date ? date.split('-').reverse().join('/') : ''} · ${time}</p>
      </div>
    `;
  }

  async function fetchSeatMap() {
    try {
      const res = await fetch(`/api/seatmap/${showtimeId}`);
      seatmap = await res.json();
    } catch (e) {
      showToast('Không tải được sơ đồ ghế, vui lòng thử lại.', 'err');
      return;
    }
    el('priceHint').textContent = `${fmt(Number(seatmap.price) || 0)}/vé · tối đa ${MAX_COUNT} người`;
    renderAll();
  }

  function seatPrice() {
    return Number(seatmap?.price) || 0;
  }

  /* Lấy seat thật (nếu có) theo hàng + số ghế */
  function findSeat(row, soGhe) {
    const rowData = seatmap.rows.find((r) => r.row === row);
    if (!rowData) return null;
    return rowData.seats.find((s) => s.soGhe === soGhe) || null;
  }

  /* ─── Rule engine — y hệt seat-booking-app: luật áp dụng THEO TỪNG CỤM ─── */
  function computeGaps() {
    const gapSeatIds = new Set();
    const invalidSeatIds = new Set();
    if (!seatmap) return { gapSeatIds, invalidSeatIds };

    seatmap.rows.forEach((rowData) => {
      const row = rowData.row;
      GROUPS.forEach((group) => {
        // chỉ xét những số ghế thực sự tồn tại trong DB ở hàng này
        const groupExisting = group.filter((n) => findSeat(row, n));
        const selectedInGroup = groupExisting.filter((n) => selectedSeats.has(row + n));
        if (selectedInGroup.length === 0) return;

        // cụm đôi (2 ghế): phải chọn trọn cả 2, không chọn lẻ 1 ghế
        if (groupExisting.length === 2 && selectedInGroup.length === 1) {
          invalidSeatIds.add(row + selectedInGroup[0]);
          const partner = groupExisting.find((n) => n !== selectedInGroup[0]);
          if (partner != null) gapSeatIds.add(row + partner);
          return;
        }

        const min = Math.min(...selectedInGroup);
        const max = Math.max(...selectedInGroup);
        if (max - min + 1 === selectedInGroup.length) return; // đã liền nhau

        selectedInGroup.forEach((n) => invalidSeatIds.add(row + n));
        groupExisting.forEach((n) => {
          if (n > min && n < max && !selectedSeats.has(row + n)) gapSeatIds.add(row + n);
        });
      });
    });
    return { gapSeatIds, invalidSeatIds };
  }

  function renderAll() {
    const state = computeGaps();
    renderSeatMap(state);
    renderProgress(state);
    renderRuleNote(state);
    renderBottomBar(state);
  }

  function renderSeatMap(state) {
    if (!seatmap) return;
    const container = el('seatmapInner');
    container.innerHTML = '';

    seatmap.rows.forEach((rowData) => {
      const row = rowData.row;
      const isVip = VIP_ROWS.has(row);

      const rowEl = document.createElement('div');
      rowEl.className = 'row';

      const label1 = document.createElement('span');
      label1.className = 'row-label' + (isVip ? ' vip' : '');
      label1.textContent = row;
      rowEl.appendChild(label1);

      const groupsEl = document.createElement('div');
      groupsEl.className = 'groups';

      GROUPS.forEach((group) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'group';

        group.forEach((n) => {
          const seat = findSeat(row, n);
          if (!seat) return; // hàng này không có ghế số n (phòng nhỏ hơn 12 ghế/hàng)

          const seatEl = document.createElement('div');
          const isSold = seat.sold;
          const isSel = selectedSeats.has(seat.seatId);
          const isGap = !isSold && !isSel && state.gapSeatIds.has(seat.seatId);
          const isInvalidSel = isSel && state.invalidSeatIds.has(seat.seatId);
          seatEl.className = 'seat'
              + (isSold ? ' sold' : isVip ? ' vip' : '')
              + (isSel ? ' selected' : '')
              + (isGap ? ' orphan' : '')
              + (isInvalidSel ? ' invalid' : '');
          seatEl.textContent = isSold ? '' : seat.soGhe;
          seatEl.title = seat.seatId;
          if (!isSold) seatEl.onclick = () => toggleSeat(seat.seatId);
          groupEl.appendChild(seatEl);
        });

        if (groupEl.children.length > 0) groupsEl.appendChild(groupEl);
      });

      rowEl.appendChild(groupsEl);

      const label2 = document.createElement('span');
      label2.className = 'row-label' + (isVip ? ' vip' : '');
      label2.textContent = row;
      rowEl.appendChild(label2);

      container.appendChild(rowEl);
    });
  }

  function renderProgress(state) {
    const badge = el('progressBadge');
    badge.textContent = `Đã chọn ${selectedSeats.size}/${count} ghế`;
    const isFull = selectedSeats.size === count;
    const isValid = state.invalidSeatIds.size === 0;
    badge.className = 'progress-badge' + (isFull && isValid ? ' ready' : isFull && !isValid ? ' warn' : '');
  }

  function renderRuleNote(state) {
    const note = el('ruleNote');
    if (state.invalidSeatIds.size > 0) {
      note.className = 'rule-note warn';
      note.textContent = '⚠ Ghế bạn chọn trong cùng 1 cụm đang bị đứt quãng (ghế viền vàng ở giữa chưa được chọn) — hãy chọn nốt ghế đó để liền nhau, hoặc bỏ chọn để đổi vị trí khác.';
    } else {
      note.className = 'rule-note';
      note.textContent = `Mua tối đa ${MAX_COUNT} vé/lượt. Có thể chọn nhiều cụm ghế ở các vị trí khác nhau, miễn ghế trong cùng 1 cụm mà bạn chọn phải liền nhau, không bỏ sót ghế nào ở giữa. Riêng cụm ghế đôi (1-2 và 11-12) phải chọn trọn cả 2 ghế, không chọn lẻ 1 ghế.`;
    }
  }

  function renderBottomBar(state) {
    const bar = el('bottombar');
    if (selectedSeats.size === 0) { bar.className = 'bottombar'; return; }
    bar.className = 'bottombar show';

    const seatsSorted = [...selectedSeats].sort();
    const total = seatsSorted.length * seatPrice();
    const hasVip = seatsSorted.some((id) => VIP_ROWS.has(seatRow(id)));

    el('bbSeatsLine').innerHTML = `Ghế đã chọn: <span style="color:var(--gold);">${seatsSorted.join(', ')}</span>`
        + (hasVip ? ' <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(212,164,76,.15);color:var(--gold);margin-left:4px;">có VIP</span>' : '');
    el('bbCountLine').textContent = `${selectedSeats.size}/${count} vé`;
    el('bbTotal').textContent = `Tổng: ${fmt(total)}`;

    const ready = selectedSeats.size === count && state.invalidSeatIds.size === 0;
    el('confirmBtn').disabled = !ready;
    el('confirmBtn').textContent = ready ? 'Xác Nhận →'
        : state.invalidSeatIds.size > 0 ? 'Ghế đang bị đứt quãng'
            : `Chọn thêm ${count - selectedSeats.size} ghế`;
  }

  function toggleSeat(seatId) {
    if (selectedSeats.has(seatId)) {
      selectedSeats.delete(seatId);
    } else {
      if (selectedSeats.size >= count) {
        showToast(`Bạn đã chọn đủ ${count} ghế. Bỏ chọn bớt trước khi chọn ghế khác.`, 'err');
        return;
      }
      selectedSeats.add(seatId);
    }
    renderAll();
  }

  function goToPayment() {
    const state = computeGaps();
    if (selectedSeats.size !== count || state.invalidSeatIds.size > 0) return;
    const seatsParam = [...selectedSeats].sort().join(',');
    const url = `/DatVe/ThanhToan.html?movieId=${movieId}&showtimeId=${showtimeId}`
        + `&time=${encodeURIComponent(time)}&date=${encodeURIComponent(date)}`
        + `&seats=${encodeURIComponent(seatsParam)}`;
    window.location.href = url;
  }

  el('decBtn').onclick = () => {
    if (count <= 1) return;
    count -= 1; el('countVal').textContent = count;
    selectedSeats = new Set(); renderAll();
  };
  el('incBtn').onclick = () => {
    if (count >= MAX_COUNT) return;
    count += 1; el('countVal').textContent = count;
    selectedSeats = new Set(); renderAll();
  };
  el('clearBtn').onclick = () => { selectedSeats = new Set(); renderAll(); };
  el('confirmBtn').onclick = goToPayment;

  el('countVal').textContent = count;
  loadMovieBar();
  fetchSeatMap();
})();
