<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EVL - Chi Tiết Phim</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="icon" type="image/x-icon" href="${pageContext.request.contextPath}/img/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playwrite+DK+Loopet:wght@100..400&display=swap" rel="stylesheet">
</head>

<body>
  <header>
    <div class="container">
      <div class="logo">
        <a href="${pageContext.request.contextPath}/Home/index.jsp">
          <img src="${pageContext.request.contextPath}/DuLieu/Logo/LogoEVL.png" alt="Logo" class="logo-img" />
          <h1><span class="DanhHieu">EVL</span></h1>
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
          <input type="checkbox" class="theme-toggle-checkbox" id="theme-toggle">
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
      <h1>Thông tin phim</h1>
      <p>
        <a href="${pageContext.request.contextPath}/Home/index.jsp">Trang Chủ</a> &gt;
        <a href="${pageContext.request.contextPath}/Home/Phim.jsp">Phim</a> &gt;
        <span id="productName">Thông tin phim</span>
      </p>
    </div>
  </section>

  <section class="product-detail">
    <div class="container">
      <div class="product-detail-content" id="productDetail">
        <!-- Chi tiết sản phẩm sẽ được thêm vào đây bằng JavaScript -->
      </div>

      <div class="product-description" id="productDescription">
        <!-- Mô tả Phim sẽ được thêm vào đây bằng JavaScript -->
      </div>

      <div class="product-nutrition" id="productNutrition">
        <!-- Thông tin trailer sẽ được thêm vào đây bằng JavaScript -->
        <video id="trailer" controls width="100%" height="auto">
          Trình duyệt của bạn không hỗ trợ video tag.
        </video>
      </div>

      <div class="related-products">
        <h2>Phim Liên Quan</h2>
        <div class="related-products-container" id="relatedProducts">
          <!-- Phim liên quan sẽ được thêm vào đây bằng JavaScript -->
        </div>
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

  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <div id="bookingModal" class="modal">
    <div class="modal-content">
      <span id="bookingClose" class="close">&times;</span>
      <h2>Đặt vé Online</h2>

      <div class="booking-widget">
        <ul class="date-tabs">
          <!-- danh sách ngày sẽ render JS -->
        </ul>

        <form id="booking-form" action="${pageContext.request.contextPath}/book.jsp" method="POST">
          <!-- B. Lưới 2 cột -->
          <div class="booking-grid">
            <!-- B1. Cột trái (poster + thông tin) -->
            <div class="booking-left">
              <img id="modalPoster" class="poster-img" src="" alt="poster">
              <h3 id="modalTitle"></h3>
              <p>Thể loại: <span id="modalGenre"></span></p>
              <p>Ngôn ngữ: <span id="modalLang"></span></p>

              <label>Số lượng vé:
                <input type="number" id="so_luong" name="so_luong" min="0" value="0" readonly>
              </label>
              <label>Ghế ngồi:
                <input type="text" id="ghe_ngoi" name="ghe_ngoi" readonly>
              </label>

              <input type="text" id="customer" placeholder="Họ và tên">

              <label for="email">Thông tin liên hệ:</label>
              <input type="email" id="email" placeholder="Email">

              <input type="tel" id="phone" name="phone" pattern="0[0-9]{9}" placeholder="Số điện thoại" required>
              <p>Ngày chiếu: <span id="booking-date">–/–/–</span></p>
              <p>Giờ chiếu: <span id="booking-time">--:--</span></p>
              <p class="total">Tổng tiền: <span id="total_price">0 đ</span></p>
              
              <input type="hidden" id="showtime_id" name="showtimeId">
              <input type="hidden" id="form-date" name="date">
            </div>

            <!-- B2. Cột phải (sơ đồ ghế + nút) -->
            <div class="booking-right">
              <h4>Chọn ghế ngồi</h4>
              <br>
              <div id="showtimes-container" class="showtimes"></div><br>
              <div id="seat-map-wrapper">
                <div id="seat-map"></div> <!-- JS sẽ đổ ghế vào đây -->

                <div class="legend">
                  <span class="seat free"></span> Trống
                  <span class="seat selected"></span> Đang chọn
                  <span class="seat booked"></span> Đã bán
                </div>
              </div>
              <button id="confirmBooking" type="button" class="btn-pay wide">Đặt vé</button>
              <button type="button" style="margin-top: 8px; background-color: rgb(252, 194, 3); color: rgb(255, 8, 0);">
                <a href="${pageContext.request.contextPath}/LichSuDatVeNguoiDung.jsp" style="color: inherit; text-decoration: none;">Xem lịch sử đặt vé</a>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div id="qrContainer" class="qr-container" style="display:none;"></div>
    </div>
  </div>

  <!-- Load các script hệ thống -->
  <script src="${pageContext.request.contextPath}/admin.js"></script>
  <script src="${pageContext.request.contextPath}/script.js"></script>
</body>

</html>