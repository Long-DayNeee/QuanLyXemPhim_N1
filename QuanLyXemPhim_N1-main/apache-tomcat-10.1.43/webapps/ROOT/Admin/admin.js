console.log('✅ admin.js loaded');
/* admin.js – phiên bản đã fix lỗi */
let editingId = null;
const moviesTbody = document.getElementById('moviesTbody');
const movieForm = document.getElementById('movieForm');
const movieModal = document.getElementById('movieModal');
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ====== HẰNG KIỂM TRA ĐĂNG NHẬP ====== */
  const TEST_USER = 'admin';
  const TEST_PASS = '1';

  /* ====== CACHE PHẦN TỬ DOM ====== */
  // Modal đăng nhập
  const loginModal = document.getElementById('empLoginModal');
  const nameInp = document.getElementById('empName');
  const passInp = document.getElementById('empPass');
  const backBtn = document.getElementById('empBack');
  const okBtn = document.getElementById('empSubmit');

  // Khung quản trị
  const panel = document.getElementById('adminPanel');
  const sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');

  if (!document.getElementById('empLoginModal')) return;
  /* ====== KIỂM TRA ĐĂNG NHẬP NGAY KHI TẢI ====== */
  const logged = sessionStorage.getItem('isLoggedIn') === 'true';

  if (logged) {
    loginModal.style.display = 'none';
    panel.style.display = 'flex';
    initPanel();           // ← chỉ gọi 1 lần ở đây
  } else {
    loginModal.style.display = 'flex';
    panel.style.display = 'none';
  }

  /* --- PHIM --- */
  // const moviesTbody = document.getElementById('moviesTbody');
  const addMovieBtn = document.getElementById('addMovieBtn');
  const movieModal = document.getElementById('movieModal');
  const movieForm = document.getElementById('movieForm');
  const movieCancel = document.getElementById('movieCancel');

  /* ====== XỬ LÝ ĐĂNG NHẬP ====== */
  backBtn.addEventListener('click', () => location.href = '/Home/Phim.jsp');

  okBtn.addEventListener('click', () => {
    const user = nameInp.value.trim();
    const pass = passInp.value.trim();

    if (!user) { alert('Tên không được để trống'); nameInp.focus(); return; }
    if (!pass) { alert('Mật khẩu không được để trống'); passInp.focus(); return; }

    if (user === TEST_USER && pass === TEST_PASS) {
      sessionStorage.setItem('isLoggedIn', 'true');
      // thành công
      loginModal.style.display = 'none';
      panel.style.display = 'flex';
      initPanel();
    } else {
      alert('Sai tên đăng nhập hoặc mật khẩu!');
      nameInp.focus();
    }
  });

  /* ====== KHỞI TẠO DASHBOARD ====== */
  function initPanel() {
    activateSection('movies');
    loadMovies();
    loadMovieOptions();
  }

  /* ====== CHUYỂN SECTION ====== */
  sidebarLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      activateSection(link.dataset.section);
    });
  });

  function activateSection(section) {
    // link
    sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.section === section));
    // nội dung
    document.querySelectorAll('.section').forEach(sec => {
      sec.toggleAttribute('data-active', sec.id === ('section-' + section));
    });
    if (section === 'showtimes') {
      loadMovieOptions();
      loadBookingHistory();
    }
  }

  /* ====== CRUD PHIM ====== */
  addMovieBtn.addEventListener('click', () => {
    movieForm.reset();
    movieForm.removeAttribute('data-editing');
    preview.style.display = 'none';        // ẩn preview poster
    movieModal.style.display = 'flex';
  });

  movieCancel.addEventListener('click', () => movieModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === movieModal) movieModal.style.display = 'none';
  });

  document.getElementById('openAddShowtime')
    .addEventListener('click', () => {
      document.getElementById('addShowtimeModal').style.display = 'flex';
      loadMovieOptionsAdd(); // nạp <select id="movieSelectAdd">
    });

  const premiereInp = document.querySelector('input[name="premiere"]');
  if (premiereInp) {
    //   // Ngăn chọn tương lai, nhưng cho phép quá khứ
    //   // premiereInp.removeAttribute('min');
    //   // premiereInp.max = new Date().toISOString().slice(0, 10);
    //   const raw = m.premiere ?? m.NgayChieu;
    //   premiereInp.value = raw ? raw.split('T')[0] : '';
  }

  const dateInp = document.getElementById('dateInp');
  const openModal = document.getElementById('openAddShowtime');
  const addModal = document.getElementById('addShowtimeModal');

  openModal.addEventListener('click', () => {
    // Mỗi lần mở modal, gán min = hôm nay
    dateInp.min = new Date().toISOString().slice(0, 10);
    addModal.style.display = 'flex';
  });

  // movieForm.addEventListener('submit', async (e) => {
  //   e.preventDefault();
  //   // gom dữ liệu từ form
  //   const data = Object.fromEntries(new FormData(movieForm));
  //   // xác định thêm mới hay cập nhật
  //   const isEdit = !!movieForm.dataset.editing;
  //   const url = '/DuAnWeb/api/movies.php' + (isEdit ? '?id=' + movieForm.dataset.editing : '');
  //   const method = isEdit ? 'PUT' : 'POST';
  //   // gọi backend
  //   const res = await fetch(url, {
  //     method,
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(data)
  //   });
  //   if (!res.ok) {
  //     alert('Lỗi: ' + await res.text());
  //     return;
  //   }
  //   // sau khi thành công, load lại danh sách và đóng modal
  //   await loadMovies();
  //   movieModal.style.display = 'none';
  // });

  async function loadMovieOptionsAdd() {
    const sel = document.getElementById('movieSelectAdd');
    sel.innerHTML = '<option value="">--Chọn phim--</option>';
    try {
      const res = await fetch('http://localhost:8080/duanweb/api/movies');
      const movies = await res.json();
      movies.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.MovieID;
        opt.textContent = m.TieuDe;
        sel.appendChild(opt);
      });
    } catch (e) {
      console.error('Không load được danh sách phim', e);
    }
  }

  async function loadMovies() {
    const moviesTbody = document.getElementById('moviesTbody');
    moviesTbody.innerHTML = '';
    try {
      const res = await fetch('http://localhost:8080/duanweb/api/movies');
      if (!res.ok) throw new Error('Lỗi API');
      (await res.json()).forEach(renderMovieRow);
    } catch (err) {
      console.warn('Không load được phim thật, demo danh sách cứng.');
      [{ id: 1, title: 'Demo Movie', language: 'Tiếng Việt' }].forEach(renderMovieRow);
    }
  }

  function renderMovieRow(m) {
    const tr = document.createElement('tr');
    tr.dataset.id = m.MovieID;
    tr.innerHTML = `
      <td>${m.MovieID}</td>
      <td>${m.TieuDe}</td>
      <td>${m.TheLoai ?? ''}</td>
      <td>${m.GiaVe?.toLocaleString() ?? ''} ₫</td>
      <td>
        <button class="btn-secondary" onclick="editMovie(${m.MovieID})">Sửa</button>
        <button class="btn-secondary" onclick="deleteMovie(${m.MovieID})">Xoá</button>
      </td>
    `;
    moviesTbody.appendChild(tr);
  }



  /* -- Gán global để inline onclick gọi được -- */
  window.editMovie = async id => {
    const row = moviesTbody.querySelector(`tr[data-id="${id}"]`);
    const res = await fetch(`http://localhost:8080/duanweb/api/movies?movieId=${id}`);
    if (!res.ok) return alert('Không lấy được phim');
    const m = await res.json();
    const premiereInp = document.querySelector('input[name="premiere"]');
    if (premiereInp) {
      // Ngăn chọn tương lai, nhưng cho phép quá khứ
      // premiereInp.removeAttribute('min');
      // premiereInp.max = new Date().toISOString().slice(0, 10);
      const raw = m.premiere ?? m.NgayChieu;
      premiereInp.value = raw ? raw.split('T')[0] : '';
    }
    movieForm.title.value = m.TieuDe;
    movieForm.duration.value = m.ThoiLuong;
    movieModal.style.display = 'flex';
    if (!row) return;
    movieForm.title.value = row.children[1].textContent; // Tiêu đề
    movieForm.TheLoai.value = row.children[2].textContent;   // Thể loại
    movieForm.price.value = row.children[3].textContent.replace(/[^\d.]/g, '').replace(/\.00$/, '');
    movieForm.language.value = '';
    movieForm.description.value = row.children[4].textContent;
    movieForm.dataset.editing = id;
    movieModal.style.display = 'flex';
  };

  window.editMovie = async id => {
    // 1) gọi API lấy chi tiết phim
    const res = await fetch(`http://localhost:8080/duanweb/api/movies?movieId=${id}`);
    if (!res.ok) { alert('Không lấy được dữ liệu phim'); return; }
    const m = await res.json();

    // 2) gán đầy đủ vào form
    movieForm.title.value = m.TieuDe;
    movieForm.duration.value = m.ThoiLuong;
    movieForm.ageRate.value = m.DoTuoi;
    premiereInp.value = m.NgayChieu ? m.NgayChieu.split('T')[0] : '';
    // premiere.min = new Date().toISOString().split('T')[0];
    movieForm.TheLoai.value = m.TheLoai;
    movieForm.price.value = m.GiaVe;
    movieForm.language.value = m.NgonNgu;
    movieForm.director.value = m.DaoDien;
    movieForm.cast.value = m.DienVien;
    movieForm.description.value = m.MieuTa;

    // 3) preview poster nếu có
    if (m.PosterUrl) {
      preview.src = m.PosterUrl;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
    posterInp.value = '';
    movieForm.dataset.oldPoster = m.PosterUrl || '';

    // 4) đánh dấu sửa và mở modal
    movieForm.dataset.editing = m.MovieID;
    movieModal.style.display = 'flex';
  };

  window.deleteMovie = async (id) => {
    const row = moviesTbody.querySelector(`tr[data-id="${id}"]`);
    const title = row?.children[1].textContent.trim() || '';
    if (!confirm(`Bạn muốn xóa "${title}"? 
*Sau khi xóa sẽ không khôi phục được thông tin*`)) return;
    // gọi API xóa
    const res = await fetch('http://localhost:8080/duanweb/api/movies?movieId=' + id, {
      method: 'DELETE'
    });
    if (!res.ok) {
      alert('Xóa thất bại: ' + await res.text());
      return;
    }
    // nếu OK thì remove khỏi DOM
    document.querySelector(`tr[data-id="${id}"]`)?.remove();
  };

  /* ====== SUẤT CHIẾU ====== */
  window.deleteShowtime = async id => {
    if (!confirm('Xoá suất chiếu?')) return;
    const res = await fetch('http://localhost:8080/duanweb/api/showtimes?id=' + id, { method: 'DELETE' });
    if (!res.ok) return alert('Xoá thất bại');
    document.querySelector(`tr[data-id="${id}"]`)?.remove();
  };

  async function loadMovieOptions() {
    const sel = document.getElementById('movieSelect');
    sel.innerHTML = '<option value="">--Chọn phim--</option>';
    try {
      const res = await fetch('http://localhost:8080/duanweb/api/movies');
      const movies = await res.json();
      movies.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.MovieID;
        opt.textContent = m.TieuDe;
        sel.appendChild(opt);
      });
    } catch (e) {
      console.error('Không load được danh sách phim', e);
    }
  }

  /* Dùng sẵn mảng ngày admin nếu cần */
  window.ADMIN_DATES = ["2025-06-27", "2025-06-29"];

  /* ====== SUẤT CHIẾU ====== */
  const movieSelect = document.getElementById('movieSelect');
  const addShowtimeBtn = document.getElementById('addShowtimeBtn');
  const showtimeModal = document.getElementById('bookingModal');
  const showtimeForm = document.getElementById('showtimeForm');
  document.addEventListener('DOMContentLoaded', loadMovieOptionsAdd);
  if (showtimeForm) {
    showtimeForm.addEventListener('submit', async e => {
      e.preventDefault();
      // const mid  = +showtimeForm.movieId.value;
      // const date = showtimeForm.date.value;   // YYYY-MM-DD
      // const time = showtimeForm.time.value;   // HH:MM
      const mid = +document.getElementById('movieSelectAdd').value;
      const date = document.getElementById('dateInp').value;
      const time = document.getElementById('timeInp').value;
      if (!mid || !date || !time) return alert('Thiếu thông tin');

      const res = await fetch('http://localhost:8080/duanweb/api/add-showtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: mid, date, time })
      });
      const json = await res.json();
      if (json.ok) {
        alert('Thêm suất chiếu thành công');
        showtimeForm.reset();
      } else {
        alert('Lỗi: ' + (json.error || 'Không rõ'));
      }
    });
  }
  movieSelect.addEventListener('change', loadBookingHistory);

  addShowtimeBtn.textContent = 'Xem lịch sử';
  // if (typeof addShowtime === 'function') addShowtimeBtn.removeEventListener('click', addShowtime);
  addShowtimeBtn.addEventListener('click', loadBookingHistory);

  async function loadBookingHistory() {
    const tbody = document.getElementById('bookingsTbody');
    const movieId = document.getElementById('movieSelect').value;
    let url = '/DuAnWeb/api/get_bookings.php';
    if (movieId) url += '?movieId=' + movieId;

    tbody.innerHTML = '<tr><td colspan="6">Đang tải…</td></tr>';

    try {
      /* --------- danh sách vé (có thể đã lọc theo phim) --------- */
      const res = await fetch(url);
      const list = await res.json();          // mảng
      tbody.innerHTML = '';

      list.forEach(b => {
        tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${b.BookingID}</td>
          <td>${b.Phone}</td>
          <td>${b.MovieTitle}</td>
          <td>${new Date(b.ThoiGianBatDau).toLocaleString()}</td>
          <td>${b.Seats}</td>
          <td><button onclick="viewTickets(${b.BookingID})">Chi tiết</button></td>
        </tr>`);
      });

      /* --------- tính doanh thu 12 tháng + tổng năm --------- */
      const curY = new Date().getFullYear();
      const monthly = Array(12).fill(0);
      const seatCnt = b => b.Seats.split(',').length;

      // lấy toàn bộ vé của năm hiện tại (không lọc movieId)
      const allRes = await fetch('/DuAnWeb/api/get_bookings.php');
      const all = await allRes.json();

      all.forEach(b => {
        const d = new Date(b.ThoiGianBatDau);
        if (d.getFullYear() === curY) {
          monthly[d.getMonth()] += b.Price * seatCnt(b);
        }
      });

      // --- Gom doanh thu theo phim trong năm hiện tại ---
      const perMovie = {};
      all.forEach(b => {
        const d = new Date(b.ThoiGianBatDau);
        if (d.getFullYear() !== curY) return;
        const cnt = b.Seats.split(',').length;           // seatCnt()
        const price = b.Price;
        const rev = price * cnt;                       // giả sử API trả trường GiaVe
        const title = b.MovieTitle;
        perMovie[title] = (perMovie[title] || 0) + rev;
      });
      window.PER_MOVIE_REVENUE = perMovie;

      const yearTotal = monthly.reduce((s, v) => s + v, 0);
      /* --------- hiển thị --------- */
      const box = document.getElementById('revenue-box');
      let html = '<table class="revenue-table"><thead><tr>';
      monthly.forEach((_, i) => { html += `<th>${i + 1}/${curY}</th>`; });
      html += '<th>Tổng&nbsp;năm</th></tr></thead><tbody><tr>';
      monthly.forEach(v => { html += `<td>${v.toLocaleString()}</td>`; });
      html += `<td>${yearTotal.toLocaleString()}</td></tr></tbody></table>`;

      //Top5
      const entries = Object.entries(perMovie).sort((a, b) => b[1] - a[1]);
      if (entries.length) {
        const top5 = entries.slice(0, 5);
        html += '<h3 style="margin:15px 0 4px;">Top Phim Doanh Thu Cao Nhất</h3><ol>';
        top5.forEach(([t, r]) => html += `<li>${t}: ${r.toLocaleString()} đ</li>`);
        html += '</ol>';
      }

      document.getElementById('revenue-box').innerHTML = html;

    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="6">Không lấy được dữ liệu.</td></tr>';
      document.getElementById('revenue-box').textContent = 'Không tính được doanh thu';
    }
  }
  window.viewTickets = async function (bookingId) {
    try {
      const res = await fetch(`/DuAnWeb/api/invoice.php?bookingId=${bookingId}`);
      const data = await res.json();
      console.log(data);
      if (!data.bookingId) {
        return alert('Không lấy được chi tiết đặt vé.');
      }
      // Hiển thị dữ liệu – ví dụ trong alert hoặc modal
      const {
        bookingId: id,    // nhớ lowercase trùng với JSON trả về
        phone,
        title,        // JSON key "title"
        startTime,    // JSON key "startTime"
        price,
        seats         // JSON key "seats"
      } = data;

      // 1) Tạo seatList
      const seatList = Array.isArray(seats) ? seats : seats.split(',');
      // 2) Đếm ghế
      const seatCount = seatList.length;
      // 3) Tính revenue
      const revenue = price * seatCount;
      // 4) Định dạng time
      const timeStr = new Date(startTime).toLocaleString();
      // const revenue = price * seatCount;

      alert(`
      Mã đặt: ${id}
      SĐT: ${phone}
      Phim: ${title}
      Thời gian: ${new Date(startTime).toLocaleString()}
      Ghế: ${seats}
      Giá vé: ${price}
      Doanh thu:${revenue.toLocaleString()} đ`
      );
    } catch (e) {
      console.error(e);
      alert('Không lấy được chi tiết đặt vé.');
    }
  };

  async function viewByMovie() {
    const movieId = document.getElementById('movieSelect').value;
    const res = await fetch(
      `/DuAnWeb/api/get_bookings.php?movieId=${encodeURIComponent(movieId)}`
    );
    const list = await res.json();
    const tbody = document.querySelector('#history-table tbody');
    tbody.innerHTML = '';
    list.forEach(item => {
      tbody.innerHTML += `
      <tr>
        <td>${item.BookingID}</td>
        <td>${item.Phone}</td>
        <td>${item.MovieTitle}</td>
        <td>${new Date(item.ShowTime).toLocaleString()}</td>
        <td>${item.Seats}</td>
      </tr>`;
    });
  }

  // addShowtimeBtn.addEventListener('click', () => {
  //   showtimeForm.reset();
  //   showtimeModal.style.display = 'flex';
  // });

  const bookingForm = document.getElementById('bookingForm');
  const confirmBtn = document.getElementById('confirmBooking');

  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const isEdit = !!movieForm.dataset.editing;
    const fd = new FormData(movieForm);
    if (isEdit && posterInp.files.length === 0) {
      fd.delete('poster');
      fd.append('posterUrl', movieForm.dataset.oldPoster || '');
      fd.append('_method', 'PUT');
    }

    const url = isEdit
      ? `http://localhost:8080/duanweb/api/movies?movieId=${movieForm.dataset.editing}` : 'http://localhost:8080/duanweb/api/movies';
    const res = await fetch(url, { method: 'POST', body: fd });
    // const formData = new FormData(bookingForm);
    //  Gửi POST 1 lần, không lặp  
    // const res = await fetch('/DuAnWeb/api/book.php', {
    //   method: 'POST',
    //   body: formData
    // });
    const raw = await res.text();
    const json = safeJSON(raw);

    if (!res.ok) {
      alert('Đặt vé thất bại: ' + await res.text());
      return;
    }

    const result = await res.json(); // có thể chứa BookingID, QR,…
    alert('Đặt vé thành công! Mã đặt: ' + result.BookingID);
    bookingForm.reset();
    document.getElementById('bookingModal').style.display = 'none';
    // nếu cần: load lại lịch sử
    loadBookingHistory();
  });
  function safeJSON(s) { try { return JSON.parse(s); } catch { return {}; } }


  // movieForm.addEventListener('submit', async e => {
  //   e.preventDefault();
  //   // 1) Xác định: đang sửa hay thêm mới?
  //   const isEdit = !!movieForm.dataset.editing;
  //   let res;
  //   if (isEdit) {
  //     // —— SỬA PHIM —— dùng FormData để upload file + text
  //     const editingId = movieForm.dataset.editing;
  //     const fd = new FormData(movieForm);

  //     // Nếu không chọn file mới, giữ poster cũ
  //     if (editingId) {                         // === SỬA PHIM ===
  //       if (posterInp.files.length === 0) {    // không đổi poster
  //         fd.delete('poster');
  //         fd.append('posterUrl', movieForm.dataset.oldPoster || '');
  //       }
  //       fd.append('_method', 'PUT');           // giả PUT
  //       res = await fetch(`/DuAnWeb/api/movies.php?movieId=${editingId}`, {
  //         method: 'POST',
  //         body: fd
  //       });

  //     } else {                                // === THÊM PHIM MỚI ===
  //       res = await fetch('/DuAnWeb/api/movies.php', {   // ⬅️ KHÔNG gắn ?movieId
  //         method: 'POST',
  //         body: fd
  //       });
  //     }
  //   }

  //   // 2) Xử lý kết quả
  //   if (!res) throw new Error('fetch failed');
  //   const raw = await res.text();
  //   let result;
  //   try {
  //     result = JSON.parse(raw);
  //   } catch {
  //     result = {};
  //   }
  //   if (!res.ok) {
  //     console.error(raw);
  //     alert('Lỗi: ' + (result.error || raw));
  //     return;
  //   }

  //   await loadMovies();
  //   movieModal.style.display = 'none';
  // });

  movieForm.addEventListener('submit', async e => {
    e.preventDefault();
    const isEdit = !!movieForm.dataset.editing;
    const fd = new FormData(movieForm);

    // giữ poster cũ khi sửa mà không chọn file mới
    if (isEdit && posterInp.files.length === 0) {
      fd.delete('poster');
      fd.append('posterUrl', movieForm.dataset.oldPoster || '');
      fd.append('_method', 'PUT');
    }

    // chọn URL đúng cho Thêm hoặc Sửa
    const url = isEdit
      ? `http://localhost:8080/duanweb/api/movies?movieId=${movieForm.dataset.editing}`
      : 'http://localhost:8080/duanweb/api/movies';

    // gọi API
    const res = await fetch(url, { method: 'POST', body: fd });
    const raw = await res.text();
    let result;
    try { result = JSON.parse(raw); } catch { result = {}; }

    if (!res.ok) {
      console.error(raw);
      return alert('Lỗi: ' + (result.error || raw));
    }

    // thành công thì load lại danh sách và đóng modal
    await loadMovies();
    movieModal.style.display = 'none';
  });


  const posterInp = document.querySelector('input[name="poster"]');
  const preview = document.getElementById('posterPreview');
  if (posterInp && preview) {
    posterInp.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });
  }

  const desc = document.querySelector('textarea[name="description"]');
  if (desc) {
    // Mỗi khi gõ sẽ điều chỉnh chiều cao
    desc.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
    // Khởi tạo height ngay khi load form
    desc.dispatchEvent(new Event('input'));
  }
});

const revBtn = document.getElementById('revBtn');
const revSearch = document.getElementById('revSearch');

// Nếu tồn tại thì mới gắn sự kiện
if (revBtn && revSearch) {
  revBtn.addEventListener('click', () => {
    const kw = revSearch.value.trim().toLowerCase();
    if (!kw) {
      alert('Vui lòng nhập tên phim');
      return;
    }

    const list = Object.entries(window.PER_MOVIE_REVENUE || {})
      .filter(([title]) => title.toLowerCase().includes(kw));

    const html = list.length
      ? list.map(([t, r]) => `<p>${t}: <b>${r.toLocaleString()} đ</b></p>`).join('')
      : '<p>Không tìm thấy phim phù hợp.</p>';

    document.getElementById('revResult').innerHTML = html;
  });
}