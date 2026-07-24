console.log('✅ admin.js loaded');

/* ====== CÁC BIẾN TOÀN CỤC HOẶC CACHE ====== */
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Lấy ContextPath động (từ file JSP truyền sang) hoặc fallback
  const BASE_URL = window.contextPath || '/duanweb';

  /* ====== HẰNG KIỂM TRA ĐĂNG NHẬP ====== */
  const TEST_USER = 'admin';
  const TEST_PASS = '1';

  /* ====== CACHE PHẦN TỬ DOM ====== */
  const loginModal = document.getElementById('empLoginModal');
  const nameInp = document.getElementById('empName');
  const passInp = document.getElementById('empPass');
  const backBtn = document.getElementById('empBack');
  const okBtn = document.getElementById('empSubmit');

  const panel = document.getElementById('adminPanel');
  const sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');

  if (!loginModal) return;

  /* ====== KIỂM TRA ĐĂNG NHẬP NGAY KHI TẢI ====== */
  const logged = sessionStorage.getItem('isLoggedIn') === 'true';

  if (logged) {
    loginModal.style.display = 'none';
    panel.style.display = 'flex';
    initPanel();
  } else {
    loginModal.style.display = 'flex';
    panel.style.display = 'none';
  }

  /* ====== DOM CỦA SECTION PHIM ====== */
  const moviesTbody = document.getElementById('moviesTbody');
  const addMovieBtn = document.getElementById('addMovieBtn');
  const movieModal = document.getElementById('movieModal');
  const movieForm = document.getElementById('movieForm');
  const movieCancel = document.getElementById('movieCancel');
  const posterInp = document.querySelector('input[name="poster"]');
  const preview = document.getElementById('posterPreview');
  const premiereInp = document.querySelector('input[name="premiere"]');

  /* ====== XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT ====== */
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = `${BASE_URL}/Home/index.jsp`;
    });
  }

  if (okBtn) {
    okBtn.addEventListener('click', () => {
      const user = nameInp.value.trim();
      const pass = passInp.value.trim();

      if (!user) { alert('Tên không được để trống!'); nameInp.focus(); return; }
      if (!pass) { alert('Mật khẩu không được để trống!'); passInp.focus(); return; }

      if (user === TEST_USER && pass === TEST_PASS) {
        sessionStorage.setItem('isLoggedIn', 'true');
        loginModal.style.display = 'none';
        panel.style.display = 'flex';
        initPanel();
      } else {
        alert('Sai tên đăng nhập hoặc mật khẩu!');
        nameInp.focus();
      }
    });
  }

  /* ====== KHỞI TẠO DASHBOARD ====== */
  function initPanel() {
    activateSection('movies');
    loadMovies();
    loadMovieOptions();
  }

  /* ====== CHUYỂN SECTION TAB ====== */
  sidebarLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      activateSection(link.dataset.section);
    });
  });

  function activateSection(section) {
    sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.section === section));
    document.querySelectorAll('.section').forEach(sec => {
      const isMatch = sec.id === ('section-' + section);
      sec.style.display = isMatch ? 'block' : 'none';
      sec.toggleAttribute('data-active', isMatch);
    });

    if (section === 'showtimes') {
      loadMovieOptions();
      loadBookingHistory();
    } else if (section === 'accounts') {
      loadAccounts();
    }
  }

  /* ====== CRUD PHIM ====== */
  if (addMovieBtn) {
    addMovieBtn.addEventListener('click', () => {
      movieForm.reset();
      delete movieForm.dataset.editing;
      if (preview) preview.style.display = 'none';
      movieModal.style.display = 'flex';
    });
  }

  if (movieCancel) movieCancel.addEventListener('click', () => movieModal.style.display = 'none');

  window.addEventListener('click', e => {
    if (e.target === movieModal) movieModal.style.display = 'none';
  });

  // Load danh sách phim từ API
  async function loadMovies() {
    if (!moviesTbody) return;
    moviesTbody.innerHTML = '<tr><td colspan="5">Đang tải danh sách phim...</td></tr>';
    try {
      const res = await fetch(`${BASE_URL}/api/movies`);
      if (!res.ok) throw new Error('Lỗi lấy dữ liệu phim từ server');
      const movies = await res.json();
      moviesTbody.innerHTML = '';
      movies.forEach(renderMovieRow);
    } catch (err) {
      console.warn('Không load được phim thật:', err);
      moviesTbody.innerHTML = '<tr><td colspan="5">Không nạp được dữ liệu phim.</td></tr>';
    }
  }

  function renderMovieRow(m) {
    const tr = document.createElement('tr');
    tr.dataset.id = m.MovieID;
    tr.innerHTML = `
      <td>${m.MovieID}</td>
      <td><b>${m.TieuDe}</b></td>
      <td>${m.TheLoai ?? 'Chưa rõ'}</td>
      <td>${m.GiaVe ? m.GiaVe.toLocaleString() : '0'} ₫</td>
      <td>
        <button class="btn-secondary" onclick="editMovie(${m.MovieID})">Sửa</button>
        <button class="btn-secondary" onclick="deleteMovie(${m.MovieID})">Xoá</button>
      </td>
    `;
    moviesTbody.appendChild(tr);
  }

  // Sự kiện Submit Form Phim (Thêm mới / Cập nhật)
  if (movieForm) {
    movieForm.addEventListener('submit', async e => {
      e.preventDefault();
      const isEdit = !!movieForm.dataset.editing;
      const fd = new FormData(movieForm);

      if (isEdit && posterInp && posterInp.files.length === 0) {
        fd.delete('poster');
        fd.append('posterUrl', movieForm.dataset.oldPoster || '');
        fd.append('_method', 'PUT');
      }

      const url = isEdit
          ? `${BASE_URL}/api/movies?movieId=${movieForm.dataset.editing}`
          : `${BASE_URL}/api/movies`;

      try {
        const res = await fetch(url, { method: 'POST', body: fd });
        const raw = await res.text();
        let result;
        try { result = JSON.parse(raw); } catch { result = {}; }

        if (!res.ok) {
          return alert('Lỗi: ' + (result.error || raw));
        }

        alert(isEdit ? 'Cập nhật phim thành công!' : 'Thêm phim thành công!');
        await loadMovies();
        movieModal.style.display = 'none';
      } catch (err) {
        alert('Có lỗi xảy ra khi lưu phim: ' + err.message);
      }
    });
  }

  /* ====== GÁN HÀM GLOBAL CHO SỬA & XOÁ PHIM ====== */
  window.editMovie = async id => {
    try {
      const res = await fetch(`${BASE_URL}/api/movies?movieId=${id}`);
      if (!res.ok) return alert('Không lấy được dữ liệu chi tiết của phim');
      const m = await res.json();

      movieForm.title.value = m.TieuDe || '';
      movieForm.duration.value = m.ThoiLuong || '';
      movieForm.ageRate.value = m.DoTuoi || '0';
      if (premiereInp) premiereInp.value = m.NgayChieu ? m.NgayChieu.split('T')[0] : '';
      movieForm.TheLoai.value = m.TheLoai || '';
      movieForm.price.value = m.GiaVe || 0;
      movieForm.language.value = m.NgonNgu || '';
      movieForm.director.value = m.DaoDien || '';
      movieForm.cast.value = m.DienVien || '';
      movieForm.description.value = m.MieuTa || '';

      if (m.PosterUrl && preview) {
        preview.src = m.PosterUrl;
        preview.style.display = 'block';
      } else if (preview) {
        preview.style.display = 'none';
      }

      if (posterInp) posterInp.value = '';
      movieForm.dataset.oldPoster = m.PosterUrl || '';
      movieForm.dataset.editing = m.MovieID;
      movieModal.style.display = 'flex';
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối khi tải phim!');
    }
  };

  window.deleteMovie = async id => {
    const row = moviesTbody.querySelector(`tr[data-id="${id}"]`);
    const title = row?.children[1].textContent.trim() || '';
    if (!confirm(`Bạn có chắc muốn xóa phim "${title}"?\n*Thao tác này không thể khôi phục!*`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/movies?movieId=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Xóa thất bại: ' + await res.text());
        return;
      }
      row?.remove();
      alert('Đã xóa phim thành công!');
    } catch (e) {
      alert('Lỗi khi xóa phim: ' + e.message);
    }
  };

  /* ====== PREVIEW ANH POSTER ====== */
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

  /* ====== SUẤT CHIẾU & DOANH THU ====== */
  const openShowtimeBtn = document.getElementById('openAddShowtime');
  const addShowtimeModal = document.getElementById('addShowtimeModal');
  const closeAddShowtime = document.getElementById('closeAddShowtime');
  const showtimeForm = document.getElementById('showtimeForm');
  const dateInp = document.getElementById('dateInp');

  if (openShowtimeBtn && addShowtimeModal) {
    openShowtimeBtn.addEventListener('click', () => {
      if (dateInp) dateInp.min = new Date().toISOString().slice(0, 10);
      addShowtimeModal.style.display = 'block';
      loadMovieOptionsAdd();
    });
  }

  if (closeAddShowtime) {
    closeAddShowtime.addEventListener('click', () => {
      addShowtimeModal.style.display = 'none';
    });
  }

  if (showtimeForm) {
    showtimeForm.addEventListener('submit', async e => {
      e.preventDefault();
      const mid = +document.getElementById('movieSelectAdd').value;
      const date = document.getElementById('dateInp').value;
      const time = document.getElementById('timeInp').value;

      if (!mid || !date || !time) return alert('Vui lòng nhập đầy đủ thông tin suất chiếu!');

      try {
        const res = await fetch(`${BASE_URL}/api/add-showtime`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId: mid, date, time })
        });
        const json = await res.json();
        if (json.ok) {
          alert('Thêm suất chiếu thành công!');
          showtimeForm.reset();
          addShowtimeModal.style.display = 'none';
        } else {
          alert('Lỗi: ' + (json.error || 'Không thêm được'));
        }
      } catch (err) {
        alert('Lỗi kết nối server!');
      }
    });
  }

  async function loadMovieOptionsAdd() {
    const sel = document.getElementById('movieSelectAdd');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Chọn Phim --</option>';
    try {
      const res = await fetch(`${BASE_URL}/api/movies`);
      const movies = await res.json();
      movies.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.MovieID;
        opt.textContent = m.TieuDe;
        sel.appendChild(opt);
      });
    } catch (e) {
      console.error('Lỗi nạp danh sách phim:', e);
    }
  }

  async function loadMovieOptions() {
    const sel = document.getElementById('movieSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Chọn Phim xem lịch sử --</option>';
    try {
      const res = await fetch(`${BASE_URL}/api/movies`);
      const movies = await res.json();
      movies.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.MovieID;
        opt.textContent = m.TieuDe;
        sel.appendChild(opt);
      });
    } catch (e) {
      console.error('Không load được danh sách phim:', e);
    }
  }

  const movieSelect = document.getElementById('movieSelect');
  if (movieSelect) movieSelect.addEventListener('change', loadBookingHistory);

  async function loadBookingHistory() {
    const tbody = document.getElementById('bookingsTbody');
    const movieId = document.getElementById('movieSelect')?.value;
    let url = `${BASE_URL}/api/get_bookings.php`;
    if (movieId) url += '?movieId=' + movieId;

    if (tbody) tbody.innerHTML = '<tr><td colspan="6">Đang tải dữ liệu...</td></tr>';

    try {
      const res = await fetch(url);
      const list = await res.json();
      if (tbody) tbody.innerHTML = '';

      list.forEach(b => {
        tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${b.BookingID}</td>
          <td>${b.Phone}</td>
          <td>${b.MovieTitle}</td>
          <td>${new Date(b.ThoiGianBatDau).toLocaleString()}</td>
          <td>${b.Seats}</td>
          <td><button class="btn-secondary" onclick="viewTickets(${b.BookingID})">Chi tiết</button></td>
        </tr>`);
      });

      // Doanh thu
      const curY = new Date().getFullYear();
      const monthly = Array(12).fill(0);
      const perMovie = {};

      list.forEach(b => {
        const d = new Date(b.ThoiGianBatDau);
        const cnt = b.Seats ? b.Seats.split(',').length : 0;
        const rev = (b.Price || 0) * cnt;

        if (d.getFullYear() === curY) {
          monthly[d.getMonth()] += rev;
          perMovie[b.MovieTitle] = (perMovie[b.MovieTitle] || 0) + rev;
        }
      });
      window.PER_MOVIE_REVENUE = perMovie;

      const yearTotal = monthly.reduce((s, v) => s + v, 0);
      const box = document.getElementById('revenue-box');
      if (box) {
        let html = `<div>Tổng Doanh Thu Năm ${curY}: <b>${yearTotal.toLocaleString()} ₫</b></div>`;
        box.innerHTML = html;
      }
    } catch (err) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6">Không lấy được dữ liệu lịch sử đặt vé.</td></tr>';
    }
  }

  window.viewTickets = async function (bookingId) {
    try {
      const res = await fetch(`${BASE_URL}/api/invoice.php?bookingId=${bookingId}`);
      const data = await res.json();
      if (!data.bookingId) return alert('Không lấy được chi tiết đặt vé.');

      const seatList = Array.isArray(data.seats) ? data.seats : data.seats.split(',');
      const revenue = (data.price || 0) * seatList.length;

      alert(`
      Mã đặt: ${data.bookingId}
      SĐT: ${data.phone}
      Phim: ${data.title}
      Thời gian: ${new Date(data.startTime).toLocaleString()}
      Ghế: ${data.seats}
      Doanh thu: ${revenue.toLocaleString()} đ`
      );
    } catch (e) {
      alert('Không lấy được chi tiết đặt vé.');
    }
  };

  /* ====== TAB QUẢN LÝ TÀI KHOẢN ====== */
  const addAccountBtn = document.getElementById('addAccountBtn');
  const accountModal = document.getElementById('accountModal');
  const accountForm = document.getElementById('accountForm');
  const accountCancel = document.getElementById('accountCancel');

  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', () => {
      if (accountForm) accountForm.reset();
      if (accountModal) accountModal.style.display = 'flex';
    });
  }

  if (accountCancel) {
    accountCancel.addEventListener('click', () => {
      if (accountModal) accountModal.style.display = 'none';
    });
  }

  async function loadAccounts() {
    const tbody = document.getElementById('accountsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6">Đang tải danh sách tài khoản...</td></tr>';

    try {
      const res = await fetch(`${BASE_URL}/api/admin/users`);
      if (!res.ok) throw new Error();
      const users = await res.json();
      tbody.innerHTML = '';
      users.forEach(u => {
        tbody.innerHTML += `
          <tr>
            <td>${u.id || u.UserID}</td>
            <td><b>${u.username || u.TenDangNhap}</b></td>
            <td>${u.fullName || u.HoTen || '---'}</td>
            <td>${u.email || u.Email || '---'}</td>
            <td><span class="badge">${u.role || u.Quyen}</span></td>
            <td>
              <button class="btn-secondary" onclick="deleteAccount(${u.id || u.UserID})">Xóa</button>
            </td>
          </tr>
        `;
      });
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="6">Không thể nạp danh sách tài khoản.</td></tr>';
    }
  }

  if (accountForm) {
    accountForm.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(accountForm));

      try {
        const res = await fetch(`${BASE_URL}/api/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          alert('Tạo tài khoản thành công!');
          accountModal.style.display = 'none';
          loadAccounts();
        } else {
          alert('Thêm tài khoản thất bại: ' + await res.text());
        }
      } catch (err) {
        alert('Lỗi kết nối tới server!');
      }
    });
  }

  /* ====== TÌM KIẾM DOANH THU PHIM ====== */
  const revBtn = document.getElementById('revBtn');
  const revSearch = document.getElementById('revSearch');

  if (revBtn && revSearch) {
    revBtn.addEventListener('click', () => {
      const kw = revSearch.value.trim().toLowerCase();
      if (!kw) return alert('Vui lòng nhập tên phim!');

      const list = Object.entries(window.PER_MOVIE_REVENUE || {})
          .filter(([title]) => title.toLowerCase().includes(kw));

      const html = list.length
          ? list.map(([t, r]) => `<p>${t}: <b>${r.toLocaleString()} đ</b></p>`).join('')
          : '<p>Không tìm thấy phim phù hợp.</p>';

      document.getElementById('revResult').innerHTML = html;
    });
  }
});