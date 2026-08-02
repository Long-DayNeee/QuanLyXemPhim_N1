/* ============================================================
   BOOKING FLOW — nối SeatEngine với modal đặt vé trong
   ChiTietSanPham.html. File này GHI ĐÈ hàm loadSeatMap() cũ
   trong script.js (định nghĩa sau nên thắng), các trang khác
   (Phim.html) không load file này nên không bị ảnh hưởng.
   ============================================================ */

(function () {
  let qty = 1;
  const MAX_QTY = 4;
  let bookedSeats = new Set();
  let selectedSeats = new Set();
  let currentOptions = [];
  let currentShowtimeId = null;

  const seatMapEl = () => document.getElementById('seat-map');
  const optionsEl = () => document.getElementById('seatOptions');
  const qtyValueEl = () => document.getElementById('qtyValue');
  const infoPanelEl = () => document.getElementById('bookingInfoPanel');
  const confirmBtn = () => document.getElementById('confirmBooking');
  const termsCheck = () => document.getElementById('termsCheck');

  function setQty(n) {
    qty = Math.max(1, Math.min(MAX_QTY, n));
    if (qtyValueEl()) qtyValueEl().textContent = qty;
    selectedSeats = new Set();
    refreshOptions();
  }

  function refreshOptions() {
    currentOptions = SeatEngine.findOptions(qty, bookedSeats, 4);
    const el = optionsEl();
    if (!el) return;

    if (!currentShowtimeId) {
      el.innerHTML = '<p class="seat-options-empty">Vui lòng chọn suất chiếu trước.</p>';
    } else if (currentOptions.length === 0) {
      el.innerHTML = '<p class="seat-options-empty">Suất chiếu này đã hết chỗ phù hợp cho ' + qty + ' vé. Vui lòng thử số vé khác hoặc suất khác.</p>';
    } else {
      el.innerHTML = currentOptions.map((opt, i) => `
        <button type="button" class="seat-option-btn" data-index="${i}">
          <span class="seat-option-tag">Lựa chọn ${i + 1}</span>
          <span class="seat-option-label">${opt.label}</span>
        </button>
      `).join('');
      el.querySelectorAll('.seat-option-btn').forEach((btn) => {
        btn.addEventListener('click', () => selectOption(Number(btn.dataset.index)));
      });
    }
    renderGrid();
    syncFormAndTotal();
  }

  function selectOption(index) {
    const opt = currentOptions[index];
    if (!opt) return;
    selectedSeats = new Set(opt.seats);
    optionsEl().querySelectorAll('.seat-option-btn').forEach((b, i) => {
      b.classList.toggle('active', i === index);
    });
    renderGrid();
    syncFormAndTotal();
  }

  function renderGrid() {
    if (!seatMapEl()) return;
    SeatEngine.renderGrid(seatMapEl(), bookedSeats, selectedSeats);
  }

  function syncFormAndTotal() {
    const seatsArr = Array.from(selectedSeats);
    const soLuongInput = document.getElementById('so_luong');
    const gheNgoiInput = document.getElementById('ghe_ngoi');
    if (soLuongInput) soLuongInput.value = seatsArr.length;
    if (gheNgoiInput) gheNgoiInput.value = seatsArr.join(',');
    if (typeof updateTotal === 'function') updateTotal();
    updateInfoPanel(seatsArr);
    updateConfirmState();
  }

  function updateConfirmState() {
    const btn = confirmBtn();
    if (!btn) return;
    const enoughSeats = selectedSeats.size === qty;
    const agreed = termsCheck() ? termsCheck().checked : true;
    btn.disabled = !(enoughSeats && agreed && currentShowtimeId);
  }

  /* Sinh "Phòng chiếu" giả lập ổn định theo showtimeId (backend hiện chưa
     trả về số phòng thật — cần API bổ sung trường phòng chiếu để thay thế) */
  function fakeScreenNumber(showtimeId) {
    const n = (Number(showtimeId) % 6) + 1;
    return 'Screen' + String(n).padStart(2, '0');
  }

  function formatDateVN(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const days = ['chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()} (${days[d.getDay()]})`;
  }

  function updateInfoPanel(seatsArr) {
    const panel = infoPanelEl();
    if (!panel) return;
    if (!currentShowtimeId || seatsArr.length === 0) {
      panel.style.display = 'none';
      return;
    }
    const dateStr = document.getElementById('form-date')?.value;
    const startTime = document.getElementById('booking-time')?.textContent?.trim() || '--:--';
    const durationMin = Number(window.currentMovie?.ThoiLuong) || 120;
    const [hh, mm] = startTime.split(':').map(Number);
    let endLabel = '--:--';
    if (!isNaN(hh) && !isNaN(mm)) {
      const endDate = new Date(2000, 0, 1, hh, mm + durationMin);
      endLabel = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    }

    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="info-row"><span>Phòng chiếu</span><b>${fakeScreenNumber(currentShowtimeId)}</b></div>
      <div class="info-row"><span>Số lượng</span><b>Người lớn - ${seatsArr.length}</b></div>
      <div class="info-row"><span>Ghế ngồi</span><b>${seatsArr.join(', ')}</b></div>
      <div class="info-row"><span>Ngày chiếu</span><b>${formatDateVN(dateStr)}</b></div>
      <div class="info-row"><span>Lịch chiếu phim</span><b>${startTime} ~ ${endLabel}</b></div>
      <div class="info-row"><span>Rạp chiếu</span><b>EVL Cinemas — Số 31 LK20B Khu đô thị Văn Phú, phường Phú La, quận Hà Đông</b></div>
    `;
  }

  /* ==== GHI ĐÈ loadSeatMap (được gọi từ initShowtimeButtons trong script.js) ==== */
  window.loadSeatMap = async function (showtimeId) {
    currentShowtimeId = showtimeId;
    try {
      const res = await fetch(`/api/bookings?showtimeId=${showtimeId}`);
      const booked = await res.json();
      bookedSeats = new Set(Array.isArray(booked) ? booked : []);
    } catch (e) {
      console.error('Không tải được danh sách ghế đã bán:', e);
      bookedSeats = new Set();
    }
    selectedSeats = new Set();
    refreshOptions();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('seat-map')) return; // chỉ chạy trên ChiTietSanPham.html

    document.getElementById('qtyMinus')?.addEventListener('click', () => setQty(qty - 1));
    document.getElementById('qtyPlus')?.addEventListener('click', () => setQty(qty + 1));

    document.getElementById('termsLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      const box = document.getElementById('termsBox');
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });
    termsCheck()?.addEventListener('change', updateConfirmState);

    setQty(1);
  });
})();
