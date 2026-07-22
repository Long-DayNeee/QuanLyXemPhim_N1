<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EVL - Thông tin phim</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/styles.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
  <link rel="icon" type="image/x-icon" href="${pageContext.request.contextPath}/img/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap"
    rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playwrite+DK+Loopet:wght@100..400&display=swap" rel="stylesheet">
</head>

<body>
  <header>
    <div class="container">
      <div class="logo">
        <a href="${pageContext.request.contextPath}/Home/index.jsp">
          <img src="${pageContext.request.contextPath}/DuLieu/Logo/LogoEVL.png" alt="Logo" class="logo-img" />
          <h1>
            <span class="DanhHieu">EVL</span>
          </h1>
        </a>
      </div>
      <nav>
        <ul class="menu">
          <li><a href="${pageContext.request.contextPath}/Home/index.jsp">Trang Chủ</a></li>
          <li><a href="${pageContext.request.contextPath}/Home/GioiThieu.jsp">Trung Tâm Dịch Vụ</a></li>
          <li><a href="${pageContext.request.contextPath}/Home/Phim.jsp" class="active">Phim</a></li>
        </ul>
      </nav>
      <div class="theme-toggle">
        <span class="theme-toggle-icon"><i class="fas fa-sun"></i></span>
        <label class="theme-toggle-label">
          <input type="checkbox" class="theme-toggle-checkbox" id="theme-toggle" />
          <span class="theme-toggle-slider"></span>
        </label>
        <span class="theme-toggle-icon"><i class="fas fa-moon"></i></span>
      </div>

      <div class="mobile-menu-btn">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </header>

  <section class="page-banner">
    <div class="container">
      <h1 class="animate-text"> Danh Sách Phim </h1>
      <p class="animate-text"> Hàng loạt phim đang chờ đón! </p>

    </div>
  </section>

  <section class="products">
    <div class="container">
      <div class="product-filters">
        <button class="filter-btn active" data-filter="all">Tất Cả thể loại</button>
        <button class="filter-btn" data-filter="SapChieu">Sắp chiếu</button>
        <button class="filter-btn" data-filter="DangChieu">Đã chiếu</button>
        <button class="filter-btn" data-filter="KhongGioiHan">Không giới hạn độ tuổi</button>
        <button id="adminBtn" class="admin-btn"><i class="fas fa-lock"></i> Quản lý</button>
      </div>

      <div class="products-container" id="productsContainer">
        <!-- Sản phẩm sẽ được thêm vào đây bằng JavaScript -->
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <h2>
            <span class="DanhHieu">EVL</span>
          </h2>
          <p>EVL Cinemas Vietnam</p>
        </div>
        <div class="footer-links">
          <h3>Liên Kết</h3>
          <ul>
            <li><a href="${pageContext.request.contextPath}/Home/index.jsp">Trang Chủ</a></li>
            <li><a href="${pageContext.request.contextPath}/Home/GioiThieu.jsp">Trung Tâm Dịch Vụ</a></li>
            <li><a href="${pageContext.request.contextPath}/Home/Phim.jsp">Phim</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h3>Liên Hệ</h3>
          <p>
            <i class="fas fa-map-marker-alt"></i> Số 31 LK20B Khu đô thị Văn Phú, phường Phú La, quận Hà Đông
          </p>
          <p><i class="fas fa-phone"></i> 09114040453 </p>
          <p><i class="fas fa-envelope"></i> evle36165@gmail.com </p>
        </div>
        <div class="footer-social">
          <h3>Kết Nối</h3>
          <div class="social-icons">
            <a href="https://www.facebook.com/profile.php?id=61577270567933" target="_blank"> <i
                class="fab fa-facebook"></i></a>
            <a href="https://www.tiktok.com/@evl.cinemas.vietnam" target="_blank"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="https://www.youtube.com/channel/UCxYDAOCBTBvd7C0YyBPQ7sA " target="_blank"><i
                class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; Enjoy virtual life</p>
      </div>
    </div>
  </footer>
  <form id="booking-form" action="${pageContext.request.contextPath}/book.jsp" method="POST">
    <div id="bookingModal" class="modal" style="display:none;">
      <div class="modal-content">
        <span id="bookingClose" class="close">&times;</span>
        <h2>Đặt vé</h2>
        <div class="booking-widget">
          <!-- Date Tabs -->
          <ul class="date-tabs">
            <!-- danh sách ngày sẽ render JS -->
          </ul>

          <!-- Suất chiếu -->
          <div id="showtimes-container"></div>

          <!-- Seat map -->
          <div id="seat-map"></div>

          <!-- Form đặt vé -->

          <input type="hidden" name="showtime_id" id="showtime_id">

          <label>Số lượng vé:
            <input type="number" name="so_luong" id="so_luong" min="1" value="1">
          </label>

          <label>Ghế ngồi:
            <input type="text" name="ghe_ngoi" id="ghe_ngoi" readonly>
          </label>

          <p>Tổng tiền: <span id="total_price">0</span>₫</p>
          <button type="submit">Đặt vé</button>

          <div id="qrContainer" class="qr-container" style="display:none;"></div>
        </div>
      </div>
    </div>
  </form>

  <div id="adminModal" class="modal">
    <div class="modal-content">
      <span class="close-admin">&times;</span>
      <p style="font: weight 10px;; margin-bottom:12px; color: red;">
        *Trang này chỉ dành cho quản lý
      </p>
      <input type="password" id="adminCodeInput" placeholder="Nhập mã quản lý"
        style="width:100%; padding:8px; box-sizing:border-box;" />

      <div
        style="margin-top:16px; text-align:right; gap:10px; display:flex; justify-content:flex-end; align-items: center;">
        <button id="adminExitBtn" class="ThoatQuanLy">Thoát</button>
        <button id="adminLoginBtn" class="ThoatDangNhap">Đăng nhập</button>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="${pageContext.request.contextPath}/script.js"></script>
  <!-- Admin Login Modal -->

</body>

</html>


<!-- _______________________________________________________________________
|chọn ngày 1| chọn ngày 2|ngày...(nếu có)    |                        |
+ _____________                              |      Chọn ghế ngồi     |
+ |           |  Tên phim                    | _______________________|
+ |   ảnh     |  Thể loại:                   | |[][][][][][][][][][] ||
+ |  poster   |  Ngôn ngữ:                   | |[][][][][][][][][][] ||
+ |           |  (Số lượng vé)               | |[][][][][][][][][][] ||
+ |           |  (Số ghê ngồi)               | |[][][][][][][][][][] ||
+ |           |  Ngày chiếu:|phần chọn ngày| | |[][][][][][][][][][] ||
+ _____________  Tổng tiền:(***.***)đ        |       [nút đặt vé]     |
_______________________________________________________________________ -->