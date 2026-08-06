console.log('✅ admin.js loaded');
/* admin.js – phiên bản đã fix lỗi + thêm Quản lý tài khoản */
let editingId = null;
const moviesTbody = document.getElementById('moviesTbody');
const movieModal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');

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
  const empError = document.getElementById('empError');

  function showEmpError(msg) {
    if (!empError) { alert(msg); return; }
    empError.textContent = msg;
    empError.style.display = 'flex';
  }
  function clearEmpError() {
    if (empError) empError.style.display = 'none';
  }
  if (nameInp) nameInp.addEventListener('input', clearEmpError);
  if (passInp) passInp.addEventListener('input', clearEmpError);

  // Khung quản trị
  const panel = document.getElementById('adminPanel');
  const sidebarLinks = document.querySelectorAll('.sidebar a[data-section]');

  // =====================================================
  // ✅ THÊM MENU QUẢN LÝ TÀI KHOẢN VÀO SIDEBAR
  // =====================================================
  const sidebarUl = document.querySelector('.sidebar ul');
  if (sidebarUl) {
    // Kiểm tra xem đã có menu "Quản lý tài khoản" chưa
    const existingLink = sidebarUl.querySelector('a[href="/Admin/QuanLyTaiKhoan.html"]');
    if (!existingLink) {
      const newLi = document.createElement('li');
      const newLink = document.createElement('a');
      newLink.href = '/Admin/QuanLyTaiKhoan.html';
      newLink.innerHTML = '👤 Quản lý tài khoản';
      newLi.appendChild(newLink);

      // Chèn vào trước "Trang Phim" (li cuối cùng)
      const trangPhimLi = sidebarUl.querySelector('li:last-child');
      if (trangPhimLi) {
        sidebarUl.insertBefore(newLi, trangPhimLi);
      } else {
        sidebarUl.appendChild(newLi);
      }
      console.log('✅ Đã thêm menu "Quản lý tài khoản" vào sidebar');
    }
  }
  // =====================================================

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
  const addMovieBtn = document.getElementById('addMovieBtn');
  const movieCancel = document.getElementById('movieCancel');

  /* ====== SUBMIT FORM PHIM (THÊM / SỬA) DUY NHẤT ====== */
  if (movieForm) {
    movieForm.addEventListener('submit', async e => {
      e.preventDefault();

      const isEdit = !!movieForm.dataset.editing;
      const fd = new FormData(movieForm);

      // Xác định URL và Method chuẩn
      let url = '/api/movies';
      let method = 'POST';

      if (isEdit) {
        const editId = movieForm.dataset.editing;
        url = `/api/movies?movieId=${editId}`;
        method = 'PUT';

        fd.append('movieId', editId);
        fd.append('MovieID', editId);

        if (posterInp && posterInp.files.length === 0) {
          fd.delete('poster');
          fd.append('posterUrl', movieForm.dataset.oldPoster || '');
        }
      }

      try {
        const res = await fetch(url, {
          method: method,
          body: fd
        });

        const raw = await res.text();
        let result = safeJSON(raw);

        if (!res.ok) {
          console.error('Server error response:', raw);
          return alert('Lỗi từ Server: ' + (result.error || result.message || raw));
        }

        alert(isEdit ? 'Cập nhật phim thành công!' : 'Thêm phim thành công!');

        await loadMovies();
        if (movieModal) movieModal.style.display = 'none';

      } catch (err) {
        console.error('Lỗi Submit:', err);
        alert('Không thể kết nối Server: ' + err.message);
      }
    });
  }

  /* ====== XỬ LÝ ĐĂNG NHẬP ====== */
  if (backBtn) {
    backBtn.addEventListener('click', () => location.href = '/Home/Phim.html');
  }

  if (okBtn) {
    okBtn.addEventListener('click', () => {
      const user = nameInp.value.trim();
      const pass = passInp.value.trim();

      if (!user) { showEmpError('Tên không được để trống'); nameInp.focus(); return; }
      if (!pass) { showEmpError('Mật khẩu không được để trống'); passInp.focus(); return; }

      if (user === TEST_USER && pass === TEST_PASS) {
        sessionStorage.setItem('isLoggedIn', 'true');
        clearEmpError();
        loginModal.style.display = 'none';
        panel.style.display = 'flex';
        initPanel();
      } else {
        showEmpError('Tên đăng nhập hoặc mật khẩu không đúng');
        passInp.focus();
      }
    });
  }

  /* ====== KHỞI TẠO DASHBOARD ====== */
  function initPanel() {
    activateSection('movies');
    loadMovies();
    loadMovieOptions();
    loadRoomsTable();
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

    // Load dữ liệu cho từng section
    if (section === 'showtimes') {
      loadMovieOptions();
      loadBookingHistory();
    } else if (section === 'accounts') {  // ✅ THÊM XỬ LÝ CHO ACCOUNTS
      loadUsersQuick();
      loadAdminsQuick();
    }
  }

  /* ====== CRUD PHIM ====== */
  if (addMovieBtn) {
    addMovieBtn.addEventListener('click', () => {
      movieForm.reset();
      movieForm.removeAttribute('data-editing');
      if (preview) preview.style.display = 'none';
      if (movieModal) movieModal.style.display = 'flex';
    });
  }

  if (movieCancel) {
    movieCancel.addEventListener('click', () => {
      if (movieModal) movieModal.style.display = 'none';
    });
  }

  window.addEventListener('click', e => {
    if (e.target === movieModal) movieModal.style.display = 'none';
  });

  const openAddShowtimeBtn = document.getElementById('openAddShowtime');
  if (openAddShowtimeBtn) {
    openAddShowtimeBtn.addEventListener('click', () => {
      document.getElementById('addShowtimeModal').style.display = 'flex';
      loadMovieOptionsAdd();
      loadRoomOptionsAdd();
    });
  }

  const premiereInp = document.querySelector('input[name="premiere"]');

  const dateInp = document.getElementById('dateInp');
  const openModalBtn = document.getElementById('openAddShowtime');
  const addModal = document.getElementById('addShowtimeModal');

  if (openModalBtn && addModal) {
    openModalBtn.addEventListener('click', () => {
      if (dateInp) {
        dateInp.min = new Date().toISOString().slice(0, 10);
      }
      addModal.style.display = 'flex';
    });
  }

  async function loadMovieOptionsAdd() {
    const sel = document.getElementById('movieSelectAdd');
    if (!sel) return;
    sel.innerHTML = '<option value="">--Chọn phim--</option>';
    try {
      const res = await fetch('/api/movies');
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

  async function loadRoomOptionsAdd() {
    const sel = document.getElementById('roomSelectAdd');
    if (!sel) return;
    sel.innerHTML = '<option value="">--Chọn phòng chiếu--</option>';
    try {
      const res = await fetch('/api/rooms');
      const rooms = await res.json();
      rooms.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.RoomID;
        const soCho = r.TongChoNgoi ? ` (${r.TongChoNgoi} chỗ)` : '';
        const trangThai = r.TrangThai ? ` - ${r.TrangThai}` : '';
        opt.textContent = `${r.TenPhong}${soCho}${trangThai}`;
        sel.appendChild(opt);
      });
    } catch (e) {
      console.error('Không load được danh sách phòng chiếu', e);
    }
  }

  async function loadMovies() {
    const moviesTbody = document.getElementById('moviesTbody');
    if (!moviesTbody) return;
    moviesTbody.innerHTML = '';
    try {
      const res = await fetch('/api/movies');
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
    if (moviesTbody) moviesTbody.appendChild(tr);
  }

  window.editMovie = async id => {
    const res = await fetch(`/api/movies?movieId=${id}`);
    if (!res.ok) { alert('Không lấy được dữ liệu phim'); return; }
    const m = await res.json();

    if (movieForm) {
      movieForm.title.value = m.TieuDe || '';
      movieForm.duration.value = m.ThoiLuong || '';
      movieForm.ageRate.value = m.DoTuoi || '';
      if (premiereInp) {
        premiereInp.value = m.NgayKhoiChieu ? m.NgayKhoiChieu.split('T')[0] : '';
      }
      movieForm.TheLoai.value = m.TheLoai || '';
      movieForm.price.value = m.GiaVe || '';
      movieForm.language.value = m.NgonNgu || '';
      movieForm.director.value = m.DaoDien || '';
      movieForm.cast.value = m.DienVien || '';
      movieForm.description.value = m.MieuTa || '';
      movieForm.Trailer_ID.value = m.Trailer_ID ?? m.TrailerID ?? m.trailerid ?? m.TrailerUrl ?? m.trailerUrl ?? m.trailer ?? '';
    }

    const preview = document.getElementById('posterPreview');
    const posterInp = document.querySelector('input[name="poster"]');
    if (preview) {
      if (m.PosterUrl) {
        preview.src = m.PosterUrl;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    }
    if (posterInp) posterInp.value = '';
    if (movieForm) {
      movieForm.dataset.oldPoster = m.PosterUrl || '';
      movieForm.dataset.editing = m.MovieID;
    }
    if (movieModal) movieModal.style.display = 'flex';
  };

  window.deleteMovie = async (id) => {
    const row = moviesTbody?.querySelector(`tr[data-id="${id}"]`);
    const title = row?.children[1]?.textContent?.trim() || '';
    if (!confirm(`Bạn muốn xóa "${title}"? \n*Sau khi xóa sẽ không khôi phục được thông tin*`)) return;

    const res = await fetch('/api/movies?id=' + id, { method: 'DELETE' });
    if (!res.ok) {
      alert('Xóa thất bại: ' + await res.text());
      return;
    }
    document.querySelector(`tr[data-id="${id}"]`)?.remove();
  };

  /* ====== SUẤT CHIẾU ====== */
  window.deleteShowtime = async id => {
    if (!confirm('Xoá suất chiếu?')) return;
    const res = await fetch('/api/showtimes?id=' + id, { method: 'DELETE' });
    if (!res.ok) return alert('Xoá thất bại');
    document.querySelector(`tr[data-id="${id}"]`)?.remove();
  };

  async function loadMovieOptions() {
    const sel = document.getElementById('movieSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">--Chọn phim--</option>';
    try {
      const res = await fetch('/api/movies');
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

  window.ADMIN_DATES = ["2025-06-27", "2025-06-29"];

  /* ====== SUẤT CHIẾU ====== */
  const movieSelect = document.getElementById('movieSelect');
  const addShowtimeBtn = document.getElementById('addShowtimeBtn');
  const showtimeForm = document.getElementById('showtimeForm');

  loadMovieOptionsAdd();
  loadRoomOptionsAdd();

  if (showtimeForm) {
    showtimeForm.addEventListener('submit', async e => {
      e.preventDefault();
      const mid = +document.getElementById('movieSelectAdd')?.value;
      const rid = +document.getElementById('roomSelectAdd')?.value;
      const date = document.getElementById('dateInp')?.value;
      const time = document.getElementById('timeInp')?.value;
      if (!mid || !rid || !date || !time) return alert('Thiếu thông tin (phim, phòng chiếu, ngày, giờ)');

      const res = await fetch('/api/add-showtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: mid, roomId: rid, date, time })
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

  /* ====== PHÒNG CHIẾU: THÊM / SỬA / XOÁ ====== */
  const openAddRoomBtn = document.getElementById('openAddRoom');
  const addRoomModal = document.getElementById('addRoomModal');
  const roomForm = document.getElementById('roomForm');

  if (openAddRoomBtn && addRoomModal) {
    openAddRoomBtn.addEventListener('click', () => {
      if (roomForm) roomForm.reset();
      if (roomForm) delete roomForm.dataset.editing;
      addRoomModal.style.display = addRoomModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  if (roomForm) {
    roomForm.addEventListener('submit', async e => {
      e.preventDefault();
      const tenPhong = document.getElementById('tenPhongInp')?.value.trim();
      const tongChoNgoi = +document.getElementById('tongChoNgoiInp')?.value;
      const trangThai = document.getElementById('trangThaiInp')?.value;

      if (!tenPhong || !tongChoNgoi) {
        alert('Vui lòng nhập đầy đủ tên phòng và tổng chỗ ngồi');
        return;
      }

      const isEdit = !!roomForm.dataset.editing;
      const url = isEdit ? `/api/rooms/${roomForm.dataset.editing}` : '/api/add-room';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenPhong, tongChoNgoi, trangThai })
        });
        const json = await res.json();
        if (json.ok) {
          alert(isEdit ? 'Cập nhật phòng chiếu thành công' : 'Thêm phòng chiếu thành công');
          roomForm.reset();
          delete roomForm.dataset.editing;
          if (addRoomModal) addRoomModal.style.display = 'none';
          loadRoomOptionsAdd();
          loadRoomsTable();
        } else {
          alert('Lỗi: ' + (json.error || 'Không rõ'));
        }
      } catch (err) {
        console.error(err);
        alert('Không thể lưu phòng chiếu, vui lòng thử lại.');
      }
    });
  }

  async function loadRoomsTable() {
    const tbody = document.getElementById('roomsTbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    try {
      const res = await fetch('/api/rooms');
      const rooms = await res.json();
      rooms.forEach(r => {
        const tr = document.createElement('tr');
        tr.dataset.id = r.RoomID;
        tr.innerHTML = `
          <td>${r.RoomID}</td>
          <td>${r.TenPhong}</td>
          <td>${r.TongChoNgoi ?? ''}</td>
          <td>${r.TrangThai ?? ''}</td>
          <td>
            <button class="btn-secondary" onclick="editRoom(${r.RoomID})">Sửa</button>
            <button class="btn-secondary" onclick="deleteRoomAdmin(${r.RoomID})">Xoá</button>
          </td>`;
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('Không load được danh sách phòng chiếu', e);
    }
  }

  window.editRoom = async id => {
    const res = await fetch('/api/rooms');
    const rooms = await res.json();
    const r = rooms.find(x => x.RoomID === id);
    if (!r) return alert('Không tìm thấy phòng');

    const tenPhongInp = document.getElementById('tenPhongInp');
    const tongChoNgoiInp = document.getElementById('tongChoNgoiInp');
    const trangThaiInp = document.getElementById('trangThaiInp');

    if (tenPhongInp) tenPhongInp.value = r.TenPhong;
    if (tongChoNgoiInp) tongChoNgoiInp.value = r.TongChoNgoi;
    if (trangThaiInp) trangThaiInp.value = r.TrangThai;
    if (roomForm) roomForm.dataset.editing = id;
    if (addRoomModal) addRoomModal.style.display = 'flex';
  };

  window.deleteRoomAdmin = async id => {
    if (!confirm('Bạn có chắc muốn xoá phòng chiếu này?')) return;
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) {
      loadRoomsTable();
      loadRoomOptionsAdd();
    } else {
      alert('Lỗi: ' + (json.error || 'Không rõ'));
    }
  };

  if (movieSelect) {
    movieSelect.addEventListener('change', loadBookingHistory);
  }

  if (addShowtimeBtn) {
    addShowtimeBtn.textContent = 'Xem lịch sử';
    addShowtimeBtn.addEventListener('click', loadBookingHistory);
  }

  async function loadBookingHistory() {
    const tbody = document.getElementById('bookingsTbody');
    const movieId = document.getElementById('movieSelect')?.value;
    let url = '/api/bookings/admin/bookings';
    if (movieId) url += '?movieId=' + movieId;

    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6">Đang tải…</td></tr>';

    try {
      const res = await fetch(url);
      const list = res.ok ? await res.json() : [];

      if (!Array.isArray(list) || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có đơn đặt nào</td></tr>';
        const revenueBox = document.getElementById('revenue-box');
        if (revenueBox) revenueBox.innerHTML = '<p style="padding:10px;">Chưa có dữ liệu doanh thu</p>';
        return;
      }

      tbody.innerHTML = '';

      list.forEach(b => {
        const id = b.bookingid ?? b.BookingID ?? b.bookingId;
        const phone = b.phone ?? b.Phone ?? '—';
        const movieTitle = b.movietitle ?? b.MovieTitle ?? b.movieTitle ?? '—';
        const time = b.thoigianbatdau ?? b.ThoiGianBatDau ?? b.thoiGianBatDau;
        const seats = b.seats ?? b.Seats ?? '—';

        let formattedTime = '—';
        if (time) {
          const d = new Date(time);
          if (!isNaN(d.getTime())) {
            formattedTime = d.toLocaleString('vi-VN');
          }
        }

        tbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${id ?? '—'}</td>
          <td>${phone}</td>
          <td>${movieTitle}</td>
          <td>${formattedTime}</td>
          <td>${seats}</td>
          <td><button class="btn-secondary" onclick="viewTickets(${id})">Chi tiết</button></td>
        </tr>`);
      });

      const curY = new Date().getFullYear();
      const monthly = Array(12).fill(0);

      const allRes = await fetch('/api/bookings/admin/bookings');
      const all = await allRes.json();

      const perMovie = {};
      if (Array.isArray(all)) {
        all.forEach(b => {
          const time = b.thoigianbatdau ?? b.ThoiGianBatDau ?? b.thoiGianBatDau;
          if (!time) return;

          const d = new Date(time);
          if (d.getFullYear() === curY) {
            const rev = Number(b.total ?? b.Total) || 0;
            monthly[d.getMonth()] += rev;

            const title = b.movietitle ?? b.MovieTitle ?? b.movieTitle ?? 'Khác';
            perMovie[title] = (perMovie[title] || 0) + rev;
          }
        });
      }

      window.PER_MOVIE_REVENUE = perMovie;

      const yearTotal = monthly.reduce((s, v) => s + v, 0);
      let html = '<table class="revenue-table"><thead><tr>';
      monthly.forEach((_, i) => { html += `<th>${i + 1}/${curY}</th>`; });
      html += '<th>Tổng&nbsp;năm</th></tr></thead><tbody><tr>';
      monthly.forEach(v => { html += `<td>${v.toLocaleString('vi-VN')} ₫</td>`; });
      html += `<td><b>${yearTotal.toLocaleString('vi-VN')} ₫</b></td></tr></tbody></table>`;

      const entries = Object.entries(perMovie).sort((a, b) => b[1] - a[1]);
      if (entries.length) {
        const top5 = entries.slice(0, 5);
        html += '<h3 style="margin:15px 0 4px;">Top Phim Doanh Thu Cao Nhất</h3><ol>';
        top5.forEach(([t, r]) => html += `<li>${t}: ${r.toLocaleString('vi-VN')} ₫</li>`);
        html += '</ol>';
      }

      const revenueBox = document.getElementById('revenue-box');
      if (revenueBox) revenueBox.innerHTML = html;

    } catch (err) {
      console.error(err);
      if (tbody) tbody.innerHTML = '<tr><td colspan="6">Không lấy được dữ liệu.</td></tr>';
      const revenueBox = document.getElementById('revenue-box');
      if (revenueBox) revenueBox.textContent = 'Không tính được doanh thu';
    }
  }

  window.viewTickets = async function (bookingId) {
    if (!bookingId || bookingId === 'undefined') {
      alert('Không tìm thấy mã đơn đặt hợp lệ!');
      return;
    }

    try {
      const res = await fetch(`/api/bookings?bookingId=${bookingId}`);
      if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

      const data = await res.json();

      const id = data.bookingid ?? data.BookingID ?? data.bookingId;
      const phone = data.phone ?? data.Phone ?? '—';
      const title = data.movietitle ?? data.MovieTitle ?? data.movieTitle ?? '—';
      const startTime = data.thoigianbatdau ?? data.ThoiGianBatDau ?? data.thoiGianBatDau;
      const seats = data.seats ?? data.Seats ?? [];
      const total = data.total ?? data.Total ?? 0;

      const formattedSeats = Array.isArray(seats) ? seats.join(', ') : seats;
      const formattedTime = startTime ? new Date(startTime).toLocaleString('vi-VN') : '—';

      alert(`
        Mã đặt: ${id}
        SĐT: ${phone}
        Phim: ${title}
        Thời gian: ${formattedTime}
        Ghế: ${formattedSeats}
        Tổng tiền: ${Number(total).toLocaleString('vi-VN')} ₫`
      );
    } catch (e) {
      console.error(e);
      alert('Không lấy được chi tiết đặt vé.');
    }
  };

  async function viewByMovie() {
    const movieId = document.getElementById('movieSelect')?.value;
    const res = await fetch(
        `/api/bookings/admin/bookings?movieId=${encodeURIComponent(movieId)}`
    );
    const list = await res.json();
    const tbody = document.querySelector('#history-table tbody');
    if (!tbody) return;
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

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async e => {
      e.preventDefault();
      const isEdit = !!movieForm?.dataset.editing;
      const fd = new FormData(movieForm);
      if (isEdit && posterInp && posterInp.files.length === 0) {
        fd.delete('poster');
        fd.append('posterUrl', movieForm.dataset.oldPoster || '');
        fd.append('_method', 'PUT');
      }

      const url = isEdit
          ? `/api/movies?movieId=${movieForm.dataset.editing}` : '/api/movies';
      const res = await fetch(url, { method: 'POST', body: fd });
      const raw = await res.text();
      const json = safeJSON(raw);

      if (!res.ok) {
        alert('Đặt vé thất bại: ' + await res.text());
        return;
      }

      const result = await res.json();
      alert('Đặt vé thành công! Mã đặt: ' + result.BookingID);
      bookingForm.reset();
      const bookingModal = document.getElementById('bookingModal');
      if (bookingModal) bookingModal.style.display = 'none';
      loadBookingHistory();
    });
  }

  function safeJSON(s) { try { return JSON.parse(s); } catch { return {}; } }

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
    desc.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
    desc.dispatchEvent(new Event('input'));
  }

  // ===================================================
  // ✅ THÊM MỚI: QUẢN LÝ TÀI KHOẢN (ACCOUNTS)
  // ===================================================

  async function loadUsersQuick() {
    try {
      const res = await fetch('/api/admin/account/customers');
      if (!res.ok) throw new Error('Lỗi HTTP: ' + res.status);
      const users = await res.json();

      const tbody = document.getElementById('userTableQuick');
      if (!tbody) return;

      tbody.innerHTML = '';
      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có tài khoản khách hàng</td></tr>';
      } else {
        users.slice(0, 5).forEach(u => {
          tbody.innerHTML += `
            <tr>
              <td>${u.id}</td>
              <td>${u.username || ''}</td>
              <td>${u.fullName || ''}</td>
              <td>${u.email || ''}</td>
              <td><span class="role-badge ${u.role || 'USER'}">${u.role || 'USER'}</span></td>
            </tr>
          `;
        });
        if (users.length > 5) {
          tbody.innerHTML += `<tr><td colspan="5" style="text-align:center;color:#888;">... và ${users.length - 5} tài khoản khác</td></tr>`;
        }
      }

      const userCountEl = document.getElementById('userCountQuick');
      if (userCountEl) userCountEl.innerHTML = users.length;

      const totalUserEl = document.getElementById('totalUserQuick');
      if (totalUserEl) totalUserEl.innerHTML = users.length;

      return users;
    } catch (e) {
      console.error('Lỗi loadUsersQuick:', e);
      const tbody = document.getElementById('userTableQuick');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">❌ Không thể tải danh sách</td></tr>';
      return [];
    }
  }

  async function loadAdminsQuick() {
    try {
      const res = await fetch('/api/admin/account/staff');
      if (!res.ok) throw new Error('Lỗi HTTP: ' + res.status);
      const admins = await res.json();

      const tbody = document.getElementById('adminTableQuick');
      if (!tbody) return;

      tbody.innerHTML = '';
      if (!admins || admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có tài khoản nhân viên</td></tr>';
      } else {
        admins.slice(0, 5).forEach(a => {
          tbody.innerHTML += `
            <tr>
              <td>${a.accountID}</td>
              <td>${a.username || ''}</td>
              <td>${a.fullName || ''}</td>
              <td>${a.email || ''}</td>
              <td><span class="role-badge ${a.role || 'STAFF'}">${a.role || 'STAFF'}</span></td>
            </tr>
          `;
        });
        if (admins.length > 5) {
          tbody.innerHTML += `<tr><td colspan="5" style="text-align:center;color:#888;">... và ${admins.length - 5} tài khoản khác</td></tr>`;
        }
      }

      const adminCountEl = document.getElementById('adminCountQuick');
      if (adminCountEl) adminCountEl.innerHTML = admins.length;

      const totalAdminEl = document.getElementById('totalAdminQuick');
      if (totalAdminEl) totalAdminEl.innerHTML = admins.length;

      // Cập nhật tổng
      const users = await loadUsersQuick();
      const totalAccountEl = document.getElementById('totalAccountQuick');
      if (totalAccountEl) {
        totalAccountEl.innerHTML = (users?.length || 0) + admins.length;
      }

      return admins;
    } catch (e) {
      console.error('Lỗi loadAdminsQuick:', e);
      const tbody = document.getElementById('adminTableQuick');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">❌ Không thể tải danh sách</td></tr>';
      return [];
    }
  }

  // Gọi load dữ liệu accounts khi trang load (nếu section accounts đang active)
  // Mặc định sẽ load khi chuyển sang section accounts qua activateSection
  console.log('✅ admin.js loaded - Đã thêm Quản lý tài khoản');
});

// ===== BIẾN TOÀN CỤ =====
const revBtn = document.getElementById('revBtn');
const revSearch = document.getElementById('revSearch');

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
        ? list.map(([t, r]) => `<p>${t}: <b>${r.toLocaleString()}</b></p>`).join('')
        : '<p>Không tìm thấy phim</p>';
  })
}