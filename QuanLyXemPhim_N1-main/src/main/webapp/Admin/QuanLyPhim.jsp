<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quản lý Phim / Suất Chiếu / Tài Khoản</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/Admin/admin.css">

  <!-- Khai báo contextPath cho JS sử dụng linh hoạt -->
  <script>
    window.contextPath = "${pageContext.request.contextPath}";
  </script>
</head>

<body>
<!-- Modal đăng nhập Nhân viên -->
<div id="empLoginModal" class="modal">
  <div class="modal-content" style="max-width:420px;">
    <h3>Đăng nhập Nhân viên</h3>
    <label for="empName">Nhập tên:</label>
    <input id="empName" type="text" placeholder="Tên nhân viên" />

    <label for="empPass">Nhập mật khẩu:</label>
    <input id="empPass" type="password" placeholder="Mật khẩu" />

    <div class="modal-actions">
      <button id="empBack" type="button" class="btn-secondary">← Trở về</button>
      <button id="empSubmit" type="button" class="btn-primary">Xác nhận</button>
    </div>
  </div>
</div>

<!-- Admin Panel (hiển thị sau khi đăng nhập thành công) -->
<div id="adminPanel" class="admin-container" style="display:none;">
  <aside class="sidebar">
    <h2>Menu Quản Lý</h2>
    <ul>
      <li><a href="#" data-section="movies" class="active">Phim</a></li>
      <li><a href="#" data-section="showtimes">Doanh Thu & Suất Chiếu</a></li>
      <li><a href="#" data-section="accounts">Tài Khoản</a></li>
      <li><a href="${pageContext.request.contextPath}/Home/index.jsp" class="btn-secondary">↩ Trang Phim</a></li>
    </ul>
  </aside>

  <main class="main-content">
    <header>
      <h1 style="text-align: center;">Dashboard Quản Lý</h1>
    </header>

    <!-- 🎬 Section 1: Quản Lý Phim -->
    <section id="section-movies" class="section" data-active style="display:block;">
      <div class="section-header" style="display:flex; gap:10px; margin-bottom:15px;">
        <h3>Danh sách Phim</h3>
        <button id="addMovieBtn" class="btn-primary">+ Thêm Phim mới</button>
        <button id="openAddShowtime" class="btn-secondary">+ Thêm Suất Chiếu</button>
      </div>

      <!-- Inline Box Thêm Suất Chiếu -->
      <div id="addShowtimeModal" class="inline-add-showtime" style="display:none; background:#f4f4f4; padding:15px; border-radius:8px; margin-bottom:15px;">
        <form id="showtimeForm" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <label>Phim: <select id="movieSelectAdd" required><option value="">-- Chọn Phim --</option></select></label>
          <label>Ngày: <input type="date" id="dateInp" required></label>
          <label>Giờ: <input type="time" id="timeInp" required></label>
          <button type="submit" class="btn-primary save-showtime">Lưu Suất Chiếu</button>
          <button type="button" id="closeAddShowtime" class="btn-secondary">Hủy</button>
        </form>
      </div>

      <table class="admin-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Tiêu đề</th>
          <th>Thể loại</th>
          <th>Giá vé (₫)</th>
          <th>Hành động</th>
        </tr>
        </thead>
        <tbody id="moviesTbody">
        <!-- Dữ liệu JS load từ API -->
        </tbody>
      </table>
    </section>

    <!-- 👤 Section 2: Quản Lý Tài Khoản -->
    <section id="section-accounts" class="section" style="display:none;">
      <div class="section-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3>Quản lý Tài Khoản Admin / Nhân viên</h3>
        <button id="addAccountBtn" class="btn-primary">+ Thêm Tài Khoản Mới</button>
      </div>

      <table class="admin-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Tên tài khoản</th>
          <th>Họ và tên</th>
          <th>Email</th>
          <th>Quyền (Role)</th>
          <th>Hành động</th>
        </tr>
        </thead>
        <tbody id="accountsTbody">
        <!-- Dữ liệu JS load từ API -->
        </tbody>
      </table>
    </section>

    <!-- 📊 Section 3: Doanh Thu & Suất Chiếu -->
    <section id="section-showtimes" class="section" style="display:none;">
      <h3>Quản lý Suất Chiếu & Lịch Sử Đặt Vé</h3>
      <div style="margin-bottom:15px; display:flex; gap:10px; align-items:center;">
        <label for="movieSelect">Chọn Phim:</label>
        <select id="movieSelect" style="padding:6px;"></select>
        <button id="addShowtimeBtn" class="btn-primary">Xem Lịch Sử</button>
      </div>

      <div class="booking-wrapper">
        <table class="admin-table">
          <thead>
          <tr>
            <th>Mã Đặt</th>
            <th>SĐT</th>
            <th>Phim</th>
            <th>Ngày Giờ</th>
            <th>Ghế</th>
            <th>Chi tiết</th>
          </tr>
          </thead>
          <tbody id="bookingsTbody"></tbody>
        </table>
      </div>

      <h3 style="margin-top: 25px;">Tra Cứu Doanh Thu Phim</h3>
      <div style="display:flex; gap:8px; align-items:center; max-width:500px;">
        <input id="revSearch" placeholder="Nhập tên phim…" style="flex:1; padding:8px;">
        <button id="revBtn" class="btn-primary">Tìm</button>
      </div>
      <div id="revResult" style="margin-top:8px; font-weight:bold; color:#2e7d32;"></div>

      <h3 style="margin-top: 25px;">Tổng Doanh Thu Hệ Thống</h3>
      <div id="revenue-box" class="revenue-wrapper" style="padding:15px; background:#e8f5e9; border-radius:8px; font-size:18px; font-weight:bold;"></div>
    </section>

    <!-- 📝 MODAL 1: Thêm / Sửa Phim -->
    <div id="movieModal" class="modal" style="display:none;">
      <form id="movieForm" class="modal-content large" enctype="multipart/form-data">
        <h2>Thêm / Sửa Phim</h2>

        <div class="grid-2">
          <label>Tiêu đề:
            <input name="title" type="text" required>
          </label>

          <label>Thời lượng (phút):
            <input name="duration" type="number" min="1" required>
          </label>

          <label class="age-full">Độ tuổi:
            <select name="ageRate" required>
              <option value="">– Chọn độ tuổi –</option>
              <option value="0">Không giới hạn độ tuổi</option>
              <option value="16">16+</option>
              <option value="18">18+</option>
            </select>
          </label>

          <label>Ngày khởi chiếu:
            <input name="premiere" type="date" required>
          </label>

          <label>Giá vé (₫):
            <input name="price" type="number" min="0" value="200000" placeholder="200000">
          </label>

          <label>Thể loại:
            <input name="TheLoai" required>
          </label>

          <label>Ngôn ngữ:
            <input name="language" required>
          </label>

          <label>Đạo diễn:
            <input name="director" required>
          </label>

          <label>Diễn viên:
            <input name="cast" required>
          </label>
        </div>

        <div class="grid-2" style="margin-top:10px;">
          <label>Mô tả:
            <textarea name="description" placeholder="Nhập mô tả phim…"></textarea>
          </label>
          <label>Poster:
            <input name="poster" type="file" accept="image/*">
            <img id="posterPreview" src="" alt="Preview Poster" style="max-width:100px; display:none; margin-top:8px;" />
          </label>
          <label>Link Trailer (YouTube ID/URL):
            <input type="text" name="Trailer_ID" placeholder="N0-9988...">
          </label>
        </div>

        <div class="modal-actions right" style="margin-top:15px;">
          <button type="button" class="btn-secondary" id="movieCancel">Hủy</button>
          <button type="submit" class="btn-primary">Lưu thông tin</button>
        </div>
      </form>
    </div>

    <!-- 📝 MODAL 2: Thêm Tài Khoản -->
    <div id="accountModal" class="modal" style="display:none;">
      <form id="accountForm" class="modal-content">
        <h2>Thêm Tài Khoản Mới</h2>

        <label style="display:block; margin-top:10px;">Tên tài khoản (Username):
          <input name="username" type="text" required style="width:100%; padding:8px; margin-top:4px;">
        </label>

        <label style="display:block; margin-top:10px;">Mật khẩu:
          <input name="password" type="password" required style="width:100%; padding:8px; margin-top:4px;">
        </label>

        <label style="display:block; margin-top:10px;">Họ và Tên:
          <input name="fullName" type="text" required style="width:100%; padding:8px; margin-top:4px;">
        </label>

        <label style="display:block; margin-top:10px;">Email:
          <input name="email" type="email" required style="width:100%; padding:8px; margin-top:4px;">
        </label>

        <label style="display:block; margin-top:10px;">Phân quyền:
          <select name="role" required style="width:100%; padding:8px; margin-top:4px;">
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF (Nhân viên)</option>
            <option value="USER">USER</option>
          </select>
        </label>

        <div class="modal-actions right" style="margin-top:15px;">
          <button type="button" class="btn-secondary" id="accountCancel">Hủy</button>
          <button type="submit" class="btn-primary">Tạo Tài Khoản</button>
        </div>
      </form>
    </div>

    <!-- 🎟️ MODAL 3: Chi Tiết / Đặt Vé -->
    <div id="bookingModal" class="modal" style="display:none;">
      <form id="bookingForm" class="modal-content large">
        <button type="button" id="bookingClose" class="btn-close">&times;</button>

        <img id="modalPoster" src="" alt="Poster Phim" class="modal-poster" style="max-width:150px;">
        <h2 id="modalTitle"></h2>

        <p>Thể loại: <span id="modalGenre">—</span></p>
        <p>Ngôn ngữ: <span id="modalLang">—</span></p>
        <p>Ngày chiếu: <span id="modalDate">—</span></p>

        <label>Số vé:
          <input id="so_luong" type="number" min="1" value="1">
        </label>

        <button type="button" id="selectSeatsBtn" class="btn-secondary">Chọn Ghế</button>
        <input id="selectedSeats" name="Seats" type="text" readonly placeholder="Chưa chọn ghế">

        <p>Tổng tiền: <span id="totalAmount">0</span> ₫</p>
        <button type="submit" id="confirmBooking" class="btn-primary">Đặt Vé</button>

        <div id="qrContainer" style="display:none;"></div>
      </form>
    </div>

  </main>
</div>

<!-- Nạp JS xử lý -->
<script src="${pageContext.request.contextPath}/Admin/admin.js"></script>
</body>
</html>