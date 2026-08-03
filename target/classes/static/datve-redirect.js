// 1. Ghi đè hàm openBookingModal của script.js trước khi bất kỳ ai gọi nó
window.openBookingModal = function (movieId) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = movieId || urlParams.get('movieId') || urlParams.get('id');
  if (id) {
    window.location.href = `/DatVe/ChonSuatChieu.html?movieId=${id}`;
  } else {
    alert('Không tìm thấy ID phim!');
  }
};

// 2. Liên tục theo dõi và XÓA sạch modal đen nếu bị script.js append vào DOM
const removeModalObserver = new MutationObserver(() => {
  const oldModal = document.getElementById('bookingModal');
  if (oldModal) {
    oldModal.remove(); // Xóa thẳng khỏi DOM
  }
});

document.addEventListener('DOMContentLoaded', () => {
  removeModalObserver.observe(document.body, { childList: true, subtree: true });
});

// 3. Chặn mọi click vào nút "Đặt vé"
document.addEventListener('click', function (e) {
  const btn = e.target.closest('button, a, .btn');
  if (!btn) return;

  const text = (btn.innerText || btn.textContent || '').trim().toLowerCase();

  if (text.includes('đặt vé') || btn.classList.contains('btn-booking') || btn.id === 'bookingBtn') {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // Chặn đứng script.js kích hoạt modal

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId') || urlParams.get('id');

    window.openBookingModal(movieId);
  }
}, true); // Capture phase: chạy trước toàn bộ listener khác