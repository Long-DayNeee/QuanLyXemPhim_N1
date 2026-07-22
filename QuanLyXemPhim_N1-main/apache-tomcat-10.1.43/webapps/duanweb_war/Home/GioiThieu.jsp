<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EVL - Giới Thiệu</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/styles.css" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&display=swap" rel="stylesheet"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playwrite+DK+Loopet:wght@100..400&display=swap"
      rel="stylesheet"/>
    <link rel="icon" type="image/x-icon" href="${pageContext.request.contextPath}/img/favicon.png" />
  </head>
  <body>
    <header>
      <div class="container">
        <div class="logo">
          <a href="${pageContext.request.contextPath}/Home/index.jsp">
            <img src="${pageContext.request.contextPath}/PRO230/LogoEVL.png" alt="Logo" class="logo-img" />
            <h1>
              <span class="DanhHieu">EVL</span>
            </h1>
          </a>
        </div>
        <nav>
          <ul class="menu">
            <li><a href="${pageContext.request.contextPath}/Home/index.jsp">Trang Chủ</a></li>
            <li><a href="${pageContext.request.contextPath}/Home/GioiThieu.jsp" class="active">Trung Tâm Dịch Vụ</a></li>
            <li><a href="${pageContext.request.contextPath}/Home/Phim.jsp">Phim</a></li>
          </ul>
        </nav>
        <div class="theme-toggle">
          <span class="theme-toggle-icon"><i class="fas fa-sun"></i></span>
          <label class="theme-toggle-label">
            <input
              type="checkbox"
              class="theme-toggle-checkbox"
              id="theme-toggle"
            />
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
        <h1 class="animate-text">Giới Thiệu</h1>
        <p class="animate-text">Enjoy virtual life - Trải nghiệm tuyệt vời trong thế giới điện ảnh</p>
      </div>
    </section>

    <section class="UuDaiVaKhuyenMai">
    <h2>Ưu Đãi & Khuyến Mãi</h2>
    <div class="KhuyenMai-grid">
      <div class="KhuyenMai-card">
        <div class="card-header">
          <h3>Đặt vé Trực tiếp</h3>
          <span class="material-icons-outlined">local_offer</span>
          <span class="KhuyenMai-badge">Sale off</span>
        </div>
        <div class="card-icon">
          <p>Miễn phí bắp - khi theo nhóm 6 người</p>
        </div>       
        <button class="btn-action">Ưu đãi đặc biệt!</button>
      </div>

      <div class="KhuyenMai-card">
        <div class="card-header">
          <h3>Combo Bắp & Nước</h3>
          <span class="material-icons-outlined">local_cafe</span>
          <span class="KhuyenMai-badge">Combo</span>
        </div>
        <div class="card-icon">
          <p>Tặng bắp & nước khi mua vé xem trực tiếp  các suất chiếu đặc biệt</p>    
        </div>      
        <button class="btn-action">Ưu đãi đặc biệt!</button>
      </div>

      <div class="KhuyenMai-card">
        <div class="card-header">
          <h3>Gói Gia Đình</h3>
          <span class="material-icons-outlined">family_restroom</span>
          <span class="KhuyenMai-badge">Family</span>
        </div>
        <div class="card-icon">
          <p>Giảm 10% bắp & nước cho nhóm 4 người trở lên.</p>    
        </div>       
        <button class="btn-action">Ưu đãi đặc biệt!</button>
      </div>
    </div>
  </section>

    <section class="about-story">
      <div class="container">
        <div class="about-content" data-aos="fade-up">
          <div class="about-image">
            <img src="${pageContext.request.contextPath}/PRO230/Phim/bóng ma cõi mạng/BongMaCoiMang.jpg" alt="khởi đầu của EVL" />
          </div>
          <div class="about-text">
            <h3>Suất Chiếu Đặc Biệt</h3>
            <h2 class="animate-text">Bóng Ma Cõi Mạng</h2>
            <p style="font-size: 20px" class="animate-text"> Độ tuổi: 16+ </p>
            <p style="font-size: 20px" class="animate-text"> Đạo diễn: Vince Kim</p>
            <p style="font-size: 20px" class="animate-text"> Thể loại: Kinh dị</p>
            <p style="font-size: 20px" class="animate-text"> Thời lượng: 91 phút</p>
            <p style="font-size: 20px" class="animate-text"> Ngôn ngữ: Tiếng Hàn</p>
            <p style="font-size: 20px" class="animate-text"> Ngày khởi chiếu: 20/06/2025</p>
          </div>
        </div>
      </div>
    </section>

    <section class="team">
      <div class="container">
        <h2 class="section-title">Đội Ngũ Hỗ Trợ Trải Nghiệm Khách Hàng Tại Rạp</h2>
        <div class="team-grid">
          <div class="team-member" data-aos="fade-up" data-aos-delay="100">
            <div class="member-image">
              <img
                src="${pageContext.request.contextPath}/PRO230/AnhThanhVien/KLong.png"
                alt="Nguyễn Vũ Kim Long"/>
            </div>
            <div class="member-info">
              <h3>Nguyễn Vũ Kim Long</h3>
              <p class="member-role">Xây dựng hệ thống</p>
              <p class="member-desc">Quản lý rạp & chỉnh sửa hệ thống</p>
              <p class="member-desc">Liên hệ: 0911 404 053</p>
            </div>
          </div>
          <div class="team-member" data-aos="fade-up" data-aos-delay="200">
            <div class="member-image">
              <img
                src="${pageContext.request.contextPath}/PRO230/AnhThanhVien/Phu.jpg"
                alt="Phú"/>
            </div>
            <div class="member-info">
              <h3>Trần Thiên Phú</h3>
              <p class="member-role">Xây dựng hệ thống</p>
              <p class="member-desc">Quản lý rạp & chỉnh sửa hệ thống</p>
              <p class="member-desc">Liên hệ: 0966 359 608</p>
            </div>
          </div>
          
          <div class="team-member" data-aos="fade-up" data-aos-delay="400">
            <div class="member-image">
              <img
                src="${pageContext.request.contextPath}/PRO230/AnhThanhVien/Hoang.jpg"
                alt="Hoàng"
              />
            </div>
            <div class="member-info">
              <h3>Lê Huy Hoàng</h3>
              <p class="member-role">Trực Ban</p>
              <p class="member-desc">Đảm bảo hoạt động liên tục và an toàn của đơn vị, kỹ thuật tại rạp</p>
              <p class="member-desc">Liên hệ: 0833 124 166</p>
            </div>
          </div>

          <div class="team-member" data-aos="fade-up" data-aos-delay="500">
            <div class="member-image">
              <img
                src="${pageContext.request.contextPath}/PRO230/AnhThanhVien/Khanh.jpg"
                alt="Q.Khánh"/>
            </div>
            <div class="member-info">
              <h3>Hàn Quốc Khánh</h3>
              <p class="member-role">Nhân Viên Soát vé</p>
              <p class="member-desc">Soát vé & Hỗ trợ khách hàng</p>
              <p class="member-desc">Liên hệ: 0328 196 973</p>
            </div>
          </div>
          <div class="team-member" data-aos="fade-up" data-aos-delay="600">
            <div class="member-image">
              <img src="${pageContext.request.contextPath}/PRO230/AnhThanhVien/Quy.jpg" alt="Quý" />
            </div>
            <div class="member-info">
              <h3>Nguyễn Xuân Quý</h3>
              <p class="member-role">Nhân Viên Soát vé</p>
              <p class="member-desc">Soát vé & Hỗ trợ khách hàng</p>
              <p class="member-desc">Liên hệ: 0345 970 083</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="values">
      <div class="container">
        <h2 class="section-title">Quy Định Chung</h2>
        <div class="values-grid">
          <div class="value-card" data-aos="flip-left">
            <div class="value-icon">
              <i class="fas fa-microphone-slash"></i>
            </div>
            <h3>Im lặng</h3>
            <p>
              Tuyệt đối không nói chuyện, la hét, gây ồn ào làm gián đoạn trải nghiệm của người khác.
            </p>
          </div>
          <div class="value-card" data-aos="flip-left" data-aos-delay="100">
            <div class="value-icon">
              <i class="fas fa-volume-mute"></i>
            </div>
            <h3>Tắt–Để im điện thoại</h3>
            <p>
              Chuyển sang chế độ im lặng hoặc tắt hẳn để không phát sáng, không làm phiền khán giả xung quanh.
            </p>
          </div>
          <div class="value-card" data-aos="flip-left" data-aos-delay="200">
            <div class="value-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            <h3>Giữ vệ sinh chung</h3>
            <p>
              Không vứt rác bừa bãi, không mang đồ ăn–uống bẩn vào rạp; sử dụng thùng rác, chuyển rác ra ngoài sau khi xem xong.
            </p>
          </div>
          <div class="value-card" data-aos="flip-left" data-aos-delay="300">
            <div class="value-icon">
              <i class="fas fa-users"></i>
            </div>
            <h3>Tôn trọng nội quy & cộng đồng</h3>
            <p>
              Tuân thủ quy định (không quay phim,chụp hình; Không hút thuốc và mang các chất dễ cháy nổ), lịch sự và quan tâm đến quyền thư giãn của mọi người.
            </p>
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
              <a href="https://www.facebook.com/profile.php?id=61577270567933" target="_blank"> <i class="fab fa-facebook"></i></a>
              <a href="https://www.tiktok.com/@evl.cinemas.vietnam" target="_blank"><i class="fab fa-tiktok"></i></a>
              <a href="https://www.instagram.com/" target="_blank"><i class="fab fa-instagram"></i></a>
              <a href="https://www.youtube.com/channel/UCxYDAOCBTBvd7C0YyBPQ7sA " target="_blank"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; Enjoy virtual life</p>
        </div>
      </div>
    </footer>

    <script src="${pageContext.request.contextPath}/script.js"></script>
  </body>
</html>