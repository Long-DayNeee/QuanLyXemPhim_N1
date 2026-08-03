(function () {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movieId');
  const showtimeId = params.get('showtimeId');
  const time = params.get('time') || '--:--';
  const date = params.get('date') || '';
  const seats = (params.get('seats') || '').split(',').filter(Boolean);

  const termsCheck = () => document.getElementById('termsCheck');
  const payBtn = () => document.getElementById('payBtn');

  if (!movieId || !showtimeId || seats.length === 0) {
    document.querySelector('.flow-page').innerHTML =
      '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu thông tin đặt vé. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
    return;
  }

  function formatDateVN(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const days = ['chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'];
    return `${d}/${m}/${y} (${days[dt.getDay()]})`;
  }

  async function loadInfo() {
    let movie = {};
    try {
      movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
    } catch (e) {
      console.warn('Không tải được thông tin phim', e);
    }

    let seatmap = {};
    try {
      seatmap = await fetch(`/api/seatmap/${showtimeId}?count=0`).then((r) => r.json());
    } catch (e) {
      console.warn('Không tải được thông tin phòng chiếu', e);
    }

    const price = Number(movie.GiaVe) || 0;
    const total = price * seats.length;
    const durationMin = Number(movie.ThoiLuong) || 120;
    const [hh, mm] = time.split(':').map(Number);
    let endLabel = '--:--';
    if (!isNaN(hh) && !isNaN(mm)) {
      const endDate = new Date(2000, 0, 1, hh, mm + durationMin);
      endLabel = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    }

    document.getElementById('bookingInfoPanel').innerHTML = `
      <div class="info-row"><span>Phim</span><b>${movie.TieuDe || '—'}</b></div>
      <div class="info-row"><span>Phòng chiếu</span><b>Phòng ${seatmap.roomId ?? '—'}</b></div>
      <div class="info-row"><span>Số lượng</span><b>Người lớn - ${seats.length}</b></div>
      <div class="info-row"><span>Ghế ngồi</span><b>${seats.join(', ')}</b></div>
      <div class="info-row"><span>Ngày chiếu</span><b>${formatDateVN(date)}</b></div>
      <div class="info-row"><span>Lịch chiếu phim</span><b>${time} ~ ${endLabel}</b></div>
      <div class="info-row"><span>Rạp chiếu</span><b>EVL Cinemas — Số 31 LK20B Khu đô thị Văn Phú, phường Phú La, quận Hà Đông</b></div>
      <div class="info-row"><span>Tổng tiền</span><b style="color:#d4a44c;font-size:1.1rem">${total.toLocaleString('vi-VN')}đ</b></div>
    `;
  }

  function updatePayBtn() {
    const form = document.getElementById('payForm');
    payBtn().disabled = !(form.checkValidity() && termsCheck().checked);
  }

  document.getElementById('termsLink').addEventListener('click', (e) => {
    e.preventDefault();
    const box = document.getElementById('termsBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  });

  document.querySelectorAll('#payForm input').forEach((inp) => inp.addEventListener('input', updatePayBtn));
  termsCheck().addEventListener('change', updatePayBtn);

  document.getElementById('payForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (payBtn().disabled) return;

    const customer = document.getElementById('customer').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    payBtn().disabled = true;
    payBtn().textContent = 'Đang xử lý…';

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId: Number(showtimeId), seats, customer, phone, email }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.conflictSeats) {
          alert('Đặt vé thất bại: ' + data.conflictSeats.join(', ') + ' vừa bị người khác đặt trước.');
        } else {
          alert('Đặt vé thất bại: ' + (data.error || 'Không rõ lỗi'));
        }
        payBtn().disabled = false;
        payBtn().textContent = 'Xác Nhận & Đặt Vé';
        return;
      }

      sessionStorage.setItem('email', email);
      sessionStorage.setItem('phone', phone);
      sessionStorage.setItem('justBooked', '1');
      window.open(`/HoaDon.html?bookingId=${data.bookingId}`, '_blank');
      window.location.href = '/History/LichSuDatVeNguoiDung.html';
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
      payBtn().disabled = false;
      payBtn().textContent = 'Xác Nhận & Đặt Vé';
    }
  });

  loadInfo();
})();
