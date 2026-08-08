// const TICKET_PRICE = 200000;
// const movieId = new URLSearchParams(window.location.search).get('movieId') || '';
// let selectedDate = '';
// let selectedShowtimeId = null;
// let selectedSeats = [];
//
//
// let currentMovie = null;
// async function openBookingModal(movieId) {
//   if (!movieId) return;
//   currentMovie = movieId;
//   // 1) Hiện popup
//   document.getElementById('bookingModal').style.display = 'flex';
//   // 2) Load tab ngày/giờ/ghế
//   // loadDateTabs(movieId);
//   // loadShowtimes(movieId);
//   const shows = await fetch(`/api/showtimes?movieId=${movieId}`).then(r => r.json());
//   // 3) Khởi tạo các tab ngày
//   initDateTabs(shows, movieId);  // gọi đúng hàm initDateTabs :contentReference[oaicite:0]{index=0}L9-L17
//   // 4) Load giờ chiếu của ngày đầu tiên
//   await loadShowtimes(movieId, shows[0].date);
// }
// document.addEventListener('DOMContentLoaded', async () => {
//   const params = new URLSearchParams(window.location.search);
//   const movieId = params.get('movieId');
//   const btn = document.getElementById('bookOnlineBtn');
//   if (btn) {
//     btn.addEventListener('click', () => openBookingModal(movieId));
//   }
// });
//
// // document.getElementById('bookingClose').addEventListener('click', () => {
// //   document.getElementById('bookingModal').style.display = 'none';
// // });
//
// const closeBtn = document.getElementById('bookingClose');
// if (closeBtn) {
//   closeBtn.addEventListener('click', () => {
//     document.getElementById('bookingModal').style.display = 'none';
//   });
// }
//
// function initDateTabs(showtimes = [], movieId) {
//   if (!showtimes.length) {
//     document.querySelector('.date-tabs').innerHTML = '<li>Chưa có lịch</li>';
//     return;
//   }
//   const tabsEl = document.querySelector('.date-tabs');
//   const raw = showtimes.map(s => {
//     // const dt = typeof s === 'string' ? s : (s.NgayChieu || s.dt || s.ThoiGianBatDau || '');
//     const dt = typeof s === 'string' ? s : (s.date || s.startTime || s.NgayChieu || s.dt || s.ThoiGianBatDau || '');
//     return dt.substr(0, 10);
//   });
//
//   // const dates = [...new Set(showtimes.map(s => s.substr(0, 10)))];
//   const dates = [...new Set(raw)];
//   tabsEl.innerHTML = dates.map((d, i) =>
//     `<li data-date="${d}"${i === 0 ? ' class="active"' : ''}>${d.split('-').reverse().join('/')}</li>`
//
//   ).join('');
//   selectedDate = dates[0];
//   document.getElementById('booking-date').innerText = dates[0].split('-').reverse().join('/');
//   document.getElementById('form-date').value = selectedDate;
//   tabsEl.querySelectorAll('li').forEach(li =>
//     li.addEventListener('click', () => {
//       document.querySelector('.date-tabs .active').classList.remove('active');
//       li.classList.add('active');
//       document.getElementById('booking-date').innerText = li.textContent;
//       document.getElementById('form-date').value = li.dataset.date;
//       loadShowtimes(movieId, li.dataset.date);
//     })
//   );
// }
//
// async function loadShowtimes(movieId, date) {
//   console.log('▶ Enter loadShowtimes:', { movieId, date });
//   const cont = document.getElementById('showtimes-container');
//   console.log('▶ showtimes-container:', cont);
//   // 1) Bảo vệ nếu không có movieId
//   if (!movieId) {
//     console.warn('loadShowtimes: thiếu movieId');
//     return;
//   }
//   // 2) Lấy date mặc định từ tab active nếu chưa truyền
//   if (!date) {
//     // const tab = document.querySelector('.date-tabs li.active');
//     // date = tab?.dataset.date;
//     date = document.querySelector('.date-tabs li.active')?.dataset.date;
//     if (!date) {
//       console.warn('loadShowtimes: thiếu date');
//       return;
//     }
//   }
//
//   try {
//     const res = await fetch(`/api/showtimes?movieId=${movieId}&date=${date}`);
//     if (!res.ok) throw new Error('API showtimes lỗi ' + res.status);
//     const shows = await res.json();
//     console.log('▶ shows[0] =', shows[0]);
//     if (!shows.length) throw new Error('Lỗi! Chưa có suất nào cho ngày này');
//
//     const cont = document.getElementById('showtimes-container');
//     console.log('showtimes-container:', cont);
//
//     cont.innerHTML = shows.map(st => {
//       const raw = st.time || '';              // ← dùng đúng khóa giờ
//       const hhmm = (raw.match(/\d{2}:\d{2}/) || ['–:–'])[0];
//       return `<button type="button" class="showtime-btn" data-id="${st.ShowTimeID}" data-time="${hhmm}"> ${hhmm}</button>`;
//     }).join('');
//
//     // cont.innerHTML = shows.map(st => {
//     //   // 1) Lấy chuỗi giờ gốc
//     //   let iso = st.startTime || st.ThoiGianBatDau || '';
//
//     //   // 2) Rút ra HH:mm (khớp 00-59:00-59)
//     //   const m = iso.match(/\d{2}:\d{2}/);          // "08:00:00.000" → ["08:00"]
//     //   const hour = m ? m[0] : '–:–';
//
//     //   return `<button type="button"
//     //               class="showtime-btn"
//     //               data-id="${st.ShowTimeID}"
//     //               data-time="${hour}">
//     //         ${hour}
//     //       </button>`;
//     // }).join('');
//
//     //     cont.innerHTML = shows.map(st => {
//     //       let iso = st.startTime || st.ThoiGianBatDau || '';
//     //       if (iso && !/[T\-]/.test(iso) && /^\d{2}:\d{2}(:\d{2})?$/.test(iso)) {
//     //   // API trả chỉ giờ → ghép thêm ngày đã chọn
//     //   iso = `${date}T${iso}`;
//     // } else if (iso.includes(' ')) {
//     //   iso = iso.replace(' ', 'T');
//     // }
//     //       // if (iso && iso.includes(' ')) iso = iso.replace(' ', 'T');
//     //       const d = new Date(iso);
//     //       // const hour = new Date(iso).toLocaleTimeString('vi-VN', {
//     //       const hour = isNaN(d) ? '–:–' : d.toLocaleTimeString('vi-VN', {
//     //         hour: '2-digit',
//     //         minute: '2-digit',
//     //         hour12: false          // 24 giờ: 07:30, 22:15…
//     //       });
//
//     //       return `<button type="button" class="showtime-btn" data-id="${st.ShowTimeID}"> ${hour} </button>`;
//     //     }).join('');
//
//     // cont.innerHTML = shows.map(s =>
//     //   `<button type="button" class="showtime-btn" data-id="${s.ShowTimeID}">
//     //      ${new Date(s.ThoiGianBatDau)
//     //     .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//     //    </button>`
//     // ).join('');
//
//     // document.querySelectorAll('.showtime-btn').forEach(btn => {
//     //   btn.addEventListener('click', () => {
//     //     // highlight
//     //     document.querySelectorAll('.showtime-btn.active')
//     //       .forEach(b => b.classList.remove('active'));
//     //     btn.classList.add('active');
//     //     // lưu lại ID và push vào form
//     //     selectedShowtimeId = btn.dataset.id;
//     //     document.getElementById('form-showtime-id').value = selectedShowtimeId;
//     //   });
//     // });
//
//     initShowtimeButtons();
//     // cont.firstElementChild?.click();
//     document.querySelector('#showtimes-container .showtime-btn')?.click();
//   } catch (err) {
//     console.error('loadShowtimes error:', err);
//     alert('Không tải được suất chiếu, vui lòng thử lại sau.');
//   }
// }
//
// // function initShowtimeButtons() {
// //   document.querySelectorAll('.showtime-btn').forEach(btn => {
// //     btn.addEventListener('click', () => {
// //       document.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('selected'));
// //       document.getElementById('form-date').value = document.querySelector('.date-tabs li.active').dataset.date;
// //       btn.classList.add('selected');
// //       document.getElementById('showtime_id').value = btn.dataset.id;
// //       // document.getElementById('booking-time').innerText = btn.textContent;
// //       document.getElementById('booking-time').textContent = btn.textContent.trim();
// //       loadSeatMap(btn.dataset.id);
// //     });
// //   });
// // }
//
// function initShowtimeButtons() {
//   document.querySelectorAll('.showtime-btn').forEach(btn => {
//     btn.addEventListener('click', () => {
//       // 1) In log để kiểm tra sự kiện có chạy không
//       console.log('▶ Chọn giờ: ', btn.textContent.trim());
//       // 2) Cập nhật text xuống thẻ <span id="booking-time">
//       const timeEl = document.getElementById('booking-time');
//       console.log('   → trước:', timeEl.textContent);
//       timeEl.textContent = btn.textContent.trim();
//       console.log('   → sau:', timeEl.textContent);
//       // 3) Highlight nút vừa chọn
//       document.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('selected'));
//       btn.classList.add('selected');
//       // 4) Lưu showtime_id và load sơ đồ ghế
//       document.getElementById('showtime_id').value = btn.dataset.id;
//       loadSeatMap(btn.dataset.id);
//     });
//   });
// }
//
// // function loadSeatMap(id) {
// //   fetch(`/api/get_booked_seats?showtime_id=${id}`)
// //     .then(r => r.json())
// //     .then(booked => {
// //       const map = document.getElementById('seat-map');
// //       map.innerHTML = '';
// //       const total = 50, perRow = 10;
// //       for (let r = 1; r <= Math.ceil(total / perRow); r++) {
// //         const row = document.createElement('div');
// //         row.className = 'seat-row';
// //         for (let c = 1; c <= perRow; c++) {
// //           const num = (r - 1) * perRow + c;
// //           const btn = document.createElement('button');
// //           btn.textContent = num;
// //           if (booked.includes(num)) btn.disabled = true, btn.className = 'seat free'; // btn.className = 'booked';
// //           else btn.className = 'free', btn.addEventListener('click', () => toggleSeat(btn, num));
// //           row.appendChild(btn);
// //         }
// //         map.appendChild(row);
// //       }
// //       updateTotal();
// //     });
// // }
//
// function toggleSeat(btn, num) {
//   btn.classList.toggle('selected');
//   updateSelectedSeats();
//   selectedSeats = Array.from(
//     document.querySelectorAll('#seat-map .selected')
//   ).map(el => el.dataset.seatId);
//   document.querySelector('input[name="seats"]').value = selectedSeats.join(',');
//   const total = selectedSeats.length * TICKET_PRICE;
//   document.getElementById('total_price').innerText = total.toLocaleString();
// }
//
// // function updateSelectedSeats() {
// //   const sels = [...document.querySelectorAll('#seat-map .selected')].map(b => b.textContent);
// //   document.getElementById('ghe_ngoi').value = sels.join(',');
// //   document.getElementById('so_luong').value = sels.length || 1;
// //   updateTotal();
// //   updateSelectedSeats();
// // }
//
// // function updateTotal() {
// //   const price = 200000;
// //   const qty = +document.getElementById('so_luong').value;
// //   document.getElementById('total_price').textContent = (qty * price).toLocaleString();
// // }
//
// function updateTotal() {
//   const qty = +document.getElementById('so_luong').value;
//   // Lấy giá thật của phim (API trả về window.currentMovie.GiaVe)
//   const price = Number(window.currentMovie?.GiaVe) || TICKET_PRICE;
//   document.getElementById('total_price').textContent = (qty * price).toLocaleString('vi-VN') + ' đ';
// }
//
// document.addEventListener("DOMContentLoaded", async () => {
//
//
//   // A. Chống BFCache (Khi bấm nút Back trên trình duyệt, ép trang phải tải lại từ Server)
// window.addEventListener("pageshow", function (event) {
//     if (event.persisted || (typeof performance !== "undefined" && performance.navigation.type === 2)) {
//         window.location.reload();
//     }
// });
//
// // B. Tự động kiểm tra trạng thái Đăng nhập để render nút Đăng Nhập / Đăng Xuất phù hợp
// async function checkAuthStatus() {
//     const navAuth = document.querySelector(".nav-auth");
//     if (!navAuth) return;
//
//     try {
//         const res = await fetch('/api/check-auth');
//         if (res.ok) {
//             const data = await res.json();
//             if (data.isLoggedIn) {
//                 // Lấy tên hiển thị
//                 const userName = data.ho_ten || data.email || data.username || 'Thành viên';
//
//                 // Kiểm tra role (chuyển về chữ thường để tránh lỗi hoa/thường)
//                 const userRole = (data.role || '').toLowerCase();
//                 const isAdmin = userRole === 'admin';
//
//                 // Trỏ đúng về đường dẫn /admin/QuanLyPhim.html
//                 const adminButtonHTML = isAdmin
//                     ? `<a href="/admin/QuanLyPhim.html" class="btn-admin-pill">Quản Lý</a>`
//                     : '';
//
//                 navAuth.innerHTML = `
//                     ${adminButtonHTML}
//                     <span class="user-name">👤 ${userName}</span>
//                     <a href="/logout" class="btn-login-pill">Đăng Xuất</a>
//                 `;
//             } else {
//                 navAuth.innerHTML = `<a href="/Login/login.html" class="btn-login-pill">Đăng Nhập</a>`;
//             }
//         } else {
//             navAuth.innerHTML = `<a href="/Login/login.html" class="btn-login-pill">Đăng Nhập</a>`;
//         }
//     } catch (e) {
//         navAuth.innerHTML = `<a href="/Login/login.html" class="btn-login-pill">Đăng Nhập</a>`;
//     }
// }
//
// // Gọi hàm kiểm tra ngay khi load trang
// checkAuthStatus();
//   // Dark Mode Toggle
//   function initTheme() {
//     // Kiểm tra xem người dùng đã chọn theme chưa
//     const savedTheme = localStorage.getItem("theme");
//
//     // Nếu đã chọn, áp dụng theme đó
//     if (savedTheme) {
//       document.documentElement.setAttribute("data-theme", savedTheme);
//       if (savedTheme === "dark") {
//         document.getElementById("theme-toggle").checked = true;
//       }
//     } else {
//       // Nếu chưa chọn, kiểm tra preference của hệ thống
//       const prefersDarkScheme = window.matchMedia(
//         "(prefers-color-scheme: dark)"
//       );
//       if (prefersDarkScheme.matches) {
//         document.documentElement.setAttribute("data-theme", "dark");
//         document.getElementById("theme-toggle").checked = true;
//         localStorage.setItem("theme", "dark");
//       }
//     }
//   }
//
//   // Thêm event listener cho toggle
//   const themeToggle = document.getElementById("theme-toggle");
//   if (themeToggle) {
//     themeToggle.addEventListener("change", function () {
//       if (this.checked) {
//         document.documentElement.setAttribute("data-theme", "dark");
//         localStorage.setItem("theme", "dark");
//       } else {
//         document.documentElement.setAttribute("data-theme", "light");
//         localStorage.setItem("theme", "light");
//       }
//     });
//   }
//
//   // selectedDate = li.dataset.date;
//   // document.getElementById('booking-date').innerText = li.textContent;
//   // document.getElementById('form-date').value = selectedDate;
//
//   // Khởi tạo theme khi trang được load
//   if (document.getElementById("theme-toggle")) {
//     initTheme();
//   }
//   // Mobile Menu Toggle
//   const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
//   const menu = document.querySelector(".menu");
//
//   if (mobileMenuBtn) {
//     mobileMenuBtn.addEventListener("click", function () {
//       this.classList.toggle("active");
//       menu.classList.toggle("active");
//     });
//   }
//
//   // Testimonial Slider
//   const testimonialSlides = document.querySelectorAll(".testimonial-slide");
//   const dots = document.querySelectorAll(".dot");
//   const prevBtn = document.querySelector(".prev-btn");
//   const nextBtn = document.querySelector(".next-btn");
//   let currentSlide = 0;
//
//   function showSlide(n) {
//     testimonialSlides.forEach((slide) => slide.classList.remove("active"));
//     dots.forEach((dot) => dot.classList.remove("active"));
//
//     currentSlide = (n + testimonialSlides.length) % testimonialSlides.length;
//
//     testimonialSlides[currentSlide].classList.add("active");
//     dots[currentSlide].classList.add("active");
//   }
//
//   if (prevBtn && nextBtn) {
//     prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
//     nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
//   }
//
//   dots.forEach((dot, index) => {
//     dot.addEventListener("click", () => showSlide(index));
//   });
//
//   // Auto slide testimonials
//   let testimonialInterval;
//
//   function startTestimonialInterval() {
//     testimonialInterval = setInterval(() => {
//       showSlide(currentSlide + 1);
//     }, 4000);
//   }
//
//   if (testimonialSlides.length > 0) {
//     startTestimonialInterval();
//
//     // Pause interval on hover
//     const testimonialSlider = document.querySelector(".testimonial-slider");
//     if (testimonialSlider) {
//       testimonialSlider.addEventListener("mouseenter", () => {
//         clearInterval(testimonialInterval);
//       });
//
//       testimonialSlider.addEventListener("mouseleave", () => {
//         startTestimonialInterval();
//       });
//     }
//   }
//
//   // FAQ Accordion
//   const faqItems = document.querySelectorAll(".faq-item");
//
//   faqItems.forEach((item) => {
//     const question = item.querySelector(".faq-question");
//
//     question.addEventListener("click", () => {
//       const isActive = item.classList.contains("active");
//
//       // Close all items
//       faqItems.forEach((faqItem) => {
//         faqItem.classList.remove("active");
//         const toggle = faqItem.querySelector(".faq-toggle i");
//         toggle.className = "fas fa-plus";
//       });
//
//       // Open clicked item if it wasn't active
//       if (!isActive) {
//         item.classList.add("active");
//         const toggle = item.querySelector(".faq-toggle i");
//         toggle.className = "fas fa-minus";
//       }
//     });
//   });
//
//   // Products Page
//   const productsContainer = document.getElementById("productsContainer");
//   const filterBtns = document.querySelectorAll(".filter-btn");
//
//   const products = [];
//   // Product data
//   // const products = [
//   //   {
//   //     id: 1,
//   //     name: "28 NĂM SAU: HẬU TẬN THẾ",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/28 Năm Sau Hậu Tận Thế/28NamSauHauTanThe.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 18+",
//   //     intro: `Cơn ác mộng chưa kết thúc. Virus trở lại, kéo theo bóng tối bao trùm nước Anh. Một hành trình sinh tử: cậu bé tìm kiếm bác sĩ để cứu mẹ mình, băng qua vùng đất chết chóc đầy xác sống tiến hóa và những kẻ nguy hiểm ẩn sau gương mặt tử tế. Liệu niềm hy vọng cuối cùng có đủ để cứu họ khỏi vực thẳm tuyệt vọng?`,
//   //     features: [
//   //       "Đạo diễn: Danny Boyle",
//   //       "Diễn viên: Aaron Taylor-Johnson, Ralph Fiennes, Jodie Comer, Cillian Murphy",
//   //       "Thể loại: Hồi hộp, Kinh Dị",
//   //       "Khởi chiếu: 20/06/2025",
//   //       "Thời lượng: 114 phút",
//   //       "Ngôn ngữ: Tiếng Anh - Phụ đề Tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/28 Năm Sau Hậu Tận Thế/videoplayback.mp4" },
//   //     ]
//   //   },
//   //   {
//   //     id: 2,
//   //     name: "BÍ KÍP LUYỆN RỒNG",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Bí Kíp Luyện Rồng/BiKipLuyenRong.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 16+",
//   //     intro: `Câu chuyện về một chàng trai trẻ với ước mơ trở thành thợ săn rồng, nhưng định mệnh lại đưa đẩy anh đến tình bạn bất ngờ với một chú rồng.`,
//   //     features: [
//   //       "Đạo diễn: Dean DeBlois",
//   //       "Diễn viên: Mason Thames, Nico Parker, Gerard Butler",
//   //       "Thể loại: Hài, Hành Động, Phiêu Lưu, Thần thoại",
//   //       "Khởi chiếu: 13/06/2025",
//   //       "Thời lượng: 126 phút",
//   //       "Ngôn ngữ: Tiếng Anh - Phụ đề Tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/Bí Kíp Luyện Rồng/videoplayback.mp4" },
//   //     ]
//   //   },
//   //   {
//   //     id: 3,
//   //     name: "BỘ 5 SIÊU ĐẲNG CẤP",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/BỘ 5 SIÊU ĐẲNG CẤP/Bo5SieuDangCap.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 16+",
//   //     intro: `Siêu Hài, Siêu Lòng, Siêu Hài Lòng HI.FIVE – bộ phim bom tấn siêu anh hùng châu Á, pha trộn hành động mãn nhãn và tiếng cười bùng nổ. Năm người bình thường bỗng dưng "trúng số" — bất ngờ sở hữu siêu năng lực bá đạo sau một ca ghép tạng... kỳ quặc! Bị đời đẩy đưa trở thành siêu anh hùng bất đắc dĩ, họ vừa "gánh team" cứu thế giới, phải học cách dùng năng lực đúng lúc để không phá banh mọi thứ xung quanh. Khi định mệnh ép bạn lên level – bạn có dám bung skill tới bến?`,
//   //     features: [
//   //       "Đạo Diễn: Kang Hyung Cheol",
//   //       "Diễn Viên: Yoo Ah In, Ahn Jae Hong, Park Jin Young, Ra Mi Ran",
//   //       "Thể Loại: Hài, Hành Động, Thần thoại",
//   //       "Khởi Chiếu: 13/06/2025",
//   //       "Thời Lượng: 119 phút",
//   //       "Ngôn Ngữ: Tiếng Hàn – Phụ đề Tiếng Việt và Lồng Tiếng"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/BỘ 5 SIÊU ĐẲNG CẤP/videolayback.mp4" },
//   //     ]
//   //   },
//   //   {
//   //     id: 4,
//   //     name: "Bóng ma cõi mạng",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Bóng ma cõi mạng/Bongmacoimang.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 16+",
//   //     intro: `Trong nỗ lực cứu vãn kênh Youtube tâm huyết, Jyujuring quyết định tổ chức livestream ngay tại một ngôi nhà hoang bí ẩn, nơi mà chưa ai từng dám đặt chân đến. Giây phút cánh cửa mở ra cũng là lúc trò "câu view" hóa thành cơn ác mộng tồi tệ nhất cho những kẻ phạm phải điều cấm kỵ.`,
//   //     features: [
//   //       "Đạo Diễn:   Vince Kim",
//   //       "Diễn Viên: Oh Ha-nee; Go I-gyoung; Joseph Kim",
//   //       "Thể Loại: Kinh Dị",
//   //       "Khởi Chiếu: 20/06/2025",
//   //       "Thời Lượng: 91 phút",
//   //       "Ngôn Ngữ: Tiếng Hàn - Phụ đề tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/Bóng ma cõi mạng/videolayback.mp4" },
//   //     ]
//   //   },
//   //   {
//   //     id: 5,
//   //     name: "DƯỚI ĐÁY HỒ",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Dưới Đáy Hồ/DuoiDayHo.png",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 18+",
//   //     intro: `Tú liên tục rơi vào vòng xoáy kỳ lạ khi những người cô quen biết dường như đã trở thành một người khác. Tình cờ một thế giới bí ẩn nằm sâu dưới đáy hồ mở ra, nơi bản sao tà ác của con người được hình thành và nuôi dưỡng bởi chấp niệm chưa được hóa giải của chính họ. Bản sao của Tú nổi dậy, khát khao điên cuồng để thay thế cô. Tú sẽ làm gì để chiến thắng bản sao của mình?`,
//   //     features: [
//   //       "Đạo Diễn:  Trần Hữu Tấn",
//   //       "Diễn Viên: Karen Nguyễn, Kay Trần, Thanh Duy, Nguyên Thảo, Lâm Hoàng Oanh, Mạc Trung Kiên, Nguyễn Hữu Tiến,...",
//   //       "Thể Loại: Kinh Dị",
//   //       "Khởi Chiếu: 06/06/2025",
//   //       "Thời Lượng: 98 phút",
//   //       "Ngôn Ngữ: Tiếng Việt - Phụ đề Tiếng Anh"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/DƯỚI ĐÁY HỒ/videolayback.mp4" },
//   //     ]
//   //   },
//   //   {
//   //     id: 6,
//   //     name: "NOBITA VÀ CUỘC PHIÊU LƯU VÀO THẾ GIỚI TRONG TRANH",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Doraemon Nobita Và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh/Doraemon.jpg",
//   //     category: ["KhongGioiHan", "DangChieu"],
//   //     description: "Độ tuổi: Mọi lứa tuổi",
//   //     intro: "Thông qua món bảo bối mới của Doraemon, cả nhóm bạn bước thế giới trong một bức tranh nổi tiếng và bắt gặp cô bạn bí ẩn tên Claire. Với lời mời của Claire, cả nhóm cùng đến thăm vương quốc Artoria, nơi ẩn giấu một viên ngọc quý mang tên Artoria Blue đang ngủ yên. Trên hành trình tìm kiếm viên ngọc, nhóm bạn Doraemon phát hiện một truyền thuyết về sự hủy diệt của thế giới, mà truyền thuyết đó dường như đang sống dậy! Liệu cả nhóm có thể phá hủy lời nguyền này và bảo vệ cả thế giới?",
//   //     features: ["Đạo Diễn: Yukiyo Teramoto",
//   //       "Diễn Viên: Wasabi Mizuta, Megumi Ôhara, Yumi Kakazu, Subaru Kimura, Tomokazu Seki,...",
//   //       "Thể Loại: Hoạt Hình, Phiêu Lưu",
//   //       "Khởi Chiếu: 23/05/2025",
//   //       "Thời Lượng: 105 phút",
//   //       "Ngôn Ngữ:  Tiếng Nhật – phụ đề Tiếng Việt; Lồng tiếng"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/NOBITA VÀ CUỘC PHIÊU LƯU VÀO THẾ GIỚI TRONG TRANH/videolayback.mp4" },
//   //     ]
//   //   },
//
//
//   //   {
//   //     id: 7,
//   //     name: "ELIO - CẬU BÉ ĐẾN TỪ TRÁI ĐẤT",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Elio Cậu Bé Đến Từ Trái Đất/Elio.png",
//   //     category: ["DangChieu", "KhongGioiHan"],
//   //     description: "Độ tuổi: Mọi lứa tuổi",
//   //     intro: "Điều gì sẽ xảy ra nếu chính thứ bạn đang tìm kiếm lại tìm đến bạn trước? Trong cuộc phiêu lưu dở khóc dở cười trên màn ảnh rộng của Pixar, Elio – cậu bé mê mẩn người ngoài hành tinh – bất ngờ bị cuốn vào Liên Hiệp Thiên Hà, một vũ trụ liên hành tinh đầy kỳ diệu, nơi quy tụ các loài sinh vật thông minh khắp thiên hà. Trớ trêu thay, Elio lại bị hiểu nhầm là người đứng đầu Trái Đất. Giờ đây, cậu phải vượt qua những rắc rối mang quy mô vũ trụ, kết nối với những người bạn không ngờ tới, và tìm cách biến giấc mơ lớn nhất đời mình thành hiện thực.",
//   //     features: [
//   //       "Đạo Diễn: Adrian Molina, Madeline Sharafian, Domee Shi",
//   //       "Diễn Viên: Yonas Kibreab, Zoe Saldaña, Brad Garrett",
//   //       "Thể Loại: Hoạt Hình, Phiêu Lưu",
//   //       "Khởi Chiếu: 27/06/2025",
//   //       "Thời Lượng: 97 phút",
//   //       "Ngôn Ngữ:  Tiếng Anh với phụ đề tiếng Việt; Lồng tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/ELIO - CẬU BÉ ĐẾN TỪ TRÁI ĐẤT/videolayback.mp4" },
//   //     ]
//   //   },
//
//
//   //   {
//   //     id: 8,
//   //     name: "MA KHÔNG ĐẦU",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Ma không đầu/MaKhongDau.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 18+",
//   //     intro: "Hai nhân viên nhà xác Tiến và Thành bất ngờ bị cuốn vào câu chuyện tìm đầu cho ma. Cả hai bất đắc dĩ phải đi phá án, điều tra, đối đầu với nhiều hiện tượng lạ xảy ra xung quanh. Người thường đối diện với cái job quá là thách thức của Ma Không Đầu, liệu họ có chạy kịp KPI tìm lại cái đầu bị mất? Chưa dừng lại ở đó, chính từ câu chuyện của Ma Không Đầu rợn người này lại dẫn đến một bí mật kinh khủng khác, khiến người xem đôi môi chia ly mà cặp chân mày thì skinship…",
//   //     features: [
//   //       "Đạo Diễn:  Bùi Văn Hải",
//   //       "Diễn Viên: Tiến Luật; Ngô Kiến Huy; NSND Hồng Vân; NSƯT Hữu Châu; NSƯT Đại Nghĩa, Thanh Hương, Hoàng Mèo, Nghệ sĩ Phi Phụng, Phan Vũ.",
//   //       "Thể Loại: Hài, Kinh Dị",
//   //       "Khởi Chiếu: 27/06/2025",
//   //       "Thời Lượng: 115 phút",
//   //       "Ngôn Ngữ: Tiếng Việt - Phụ đề Tiếng Anh"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/ELIO - MA KHÔNG ĐẦU/videolayback.mp4" },
//   //     ]
//   //   },
//
//
//   //   {
//   //     id: 9,
//   //     name: "ÚT LAN: OÁN LINH GIỮ CỦA",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/ÚT LAN/UTLAN.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 18+",
//   //     intro: "Sau sự ra đi của cha, Lan (Phương Thanh) về một vùng quê và ở đợ cho nhà ông Danh (Mạc Văn Khoa) - một người đàn ông góa vợ, không con cái. Ngay sau khi bước chân vào căn nhà, Lan phải đối mặt với hàng loạt hiện tượng kỳ dị và những cái chết bí ẩn liên tục xảy ra. Cùng với Sơn (Quốc Trường) - một nhà văn chuyên viết truyện kinh dị, Lan bắt đầu lật mở những bí mật kinh hoàng, khám phá lịch sử đen tối của căn nhà.",
//   //     features: [
//   //       "Đạo Diễn:  Trần Trọng Dần",
//   //       "Diễn Viên: Quốc Trường, Mạc Văn Khoa,...",
//   //       "Thể Loại: Kinh Dị",
//   //       "Khởi Chiếu:  20/06/2025",
//   //       "Thời Lượng: 111 phút",
//   //       "Ngôn Ngữ: Tiếng Việt và phụ đề tiếng Anh"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/ÚT LAN/videolayback.mp4" },
//   //     ]
//   //   },
//
//   //   {
//   //     id: 10,
//   //     name: "QUỶ RẠCH MẶT",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/QUỶ RẠCH MẶT/QUYRACHMAT.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 16+",
//   //     intro: "May quyết định chuyển về căn nhà ngoại ô cùng với bạn trai, Gun. Ở đây, May bất ngờ nhận được tin dữ, mẹ kế của cô, bà Po đã qua đời, bị nghi là sát hại. May dang tay cưu mang người em gái, Noon, thế nhưng nào ngờ cô ã dẫn quỷ về nhà. Liên tục trải qua những cú sốc, May hầu như không còn tin vào chính mình khi thực thể tà ác đang muốn nuốt chửng cô và gia đình. Liệu cái kết nào sẽ giành cho những bi kịch đẫm máu tiếp theo?",
//   //     features: ["Đạo Diễn:  Sueb Boonsong Nakphoo",
//   //       "Diễn Viên: Kwan Usamanee Vaithayanon, Topz Nathanon Narathanyawirun, Tong Archariya Sritha, Yasaka Chaisorn",
//   //       "Thể Loại: Kinh Dị",
//   //       "Khởi Chiếu:  13/06/2025",
//   //       "Thời Lượng: 89phút",
//   //       "Ngôn Ngữ: Tiếng Thái - Phụ đề tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/QUỶ RẠCH MẶT/videolayback.mp4" },
//   //     ]
//   //   },
//
//   //   {
//   //     id: 11,
//   //     name: "TRON: ARES",
//   //     price: "Sắp chiếu",
//   //     image: "PRO230/Phim/TRON ARES/tron_ares.jpg",
//   //     category: ["SapChieu"],
//   //     description: "Độ tuổi: Mọi lứa tuổi",
//   //     intro: " ",
//   //     features: [
//   //       "Đạo Diễn:  Joachim Rønning",
//   //       "Diễn Viên: Gillian Anderson, Jeff Bridges, Jared Leto",
//   //       "Thể Loại: Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu",
//   //       "Khởi Chiếu:  10/10/2025",
//   //       "Thời Lượng: None",
//   //       "Ngôn Ngữ: Tiếng Anh - Phụ đề Tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/TRON ARES/TRON： ARES trailer -  DKKC： tháng 10.2025.mp4" },
//   //     ]
//   //   },
//
//   //   {
//   //     id: 12,
//   //     name: "PHI VỤ ĐỘNG TRỜI 2",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Phi Vụ Động Trời 2/PhiVuDongTroi2.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: Mọi lứa tuổi",
//   //     intro: "ZOOTOPIA 2 trở lại sau 9 năm Đu OTP Nick & Judy",
//   //     features: [
//   //       "Đạo Diễn:  Jared Bush, Byron Howard",
//   //       "Diễn Viên: Jason Bateman, Quinta Brunson, Fortune Feimster",
//   //       "Thể Loại: Gia đình, Hành Động, Phiêu Lưu, Thần thoại",
//   //       "Khởi Chiếu:  28/11/2025",
//   //       "Thời Lượng: None",
//   //       "Ngôn Ngữ: None"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/Phi Vụ Động Trời 2/PHI VỤ ĐỘNG TRỜI 2 (ZOOTOPIA 2) - Dự kiến khởi chiếu 28.11.2025.mp4" },
//   //     ]
//   //   },
//
//   //   {
//   //     id: 13,
//   //     name: "MƯỢN RƯỢU ĐẨY KÈO",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Mượn Rượu Đẩy Kèo/Muon_Ruou_Day_Keo.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 18+",
//   //     intro: " ",
//   //     features: [
//   //       "Đạo Diễn:  Choi Yoon-jin",
//   //       "Diễn Viên: Yoo Hai-jin, Lee Je-hoon, Son Hyun-joo, Choi Young-jun, Byron Mann",
//   //       "Thể Loại: Kịch tính, Tâm Lý",
//   //       "Khởi Chiếu:  27/06/2025",
//   //       "Thời Lượng: 104 phút",
//   //       "Ngôn Ngữ: Tiếng Hàn - Phụ đề tiếng Việt, lồng tiếng Việt"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/Mượn Rượu Đẩy Kèo/videoplayback.mp4" },
//   //     ]
//   //   },
//
//   //   {
//   //     id: 14,
//   //     name: "HALABALA: RỪNG MA TẾ XÁC",
//   //     price: "200.000đ",
//   //     image: "PRO230/Phim/Halabala Rừng Ma Tế Xác/Halabala.jpg",
//   //     category: ["DangChieu"],
//   //     description: "Độ tuổi: 18+",
//   //     intro: "Thanh tra Dan – kẻ mang biệt danh rùng rợn “Dan Trăm Xác” – là một cảnh sát liều mạng, nổi tiếng với quá khứ đẫm máu và những phi vụ bất chấp luật lệ. Sau một sai lầm kinh hoàng trong lúc thực hiện nhiệm vụ, Dan bị giáng chức và chuyển công tác về vùng hẻo lánh. Với nổ lực để có cơ hội trở lại Bangkok – anh cần bắt được Tup Ta Fai: tên trùm tội phạm loạn trí vừa trốn khỏi ngục, hiện đang ẩn náu trong khu rừng cấm Halabala. Thế nhưng, Halabala không phải một khu rừng bình thường. Nơi đây bị nguyền rủa bởi truyền thuyết quỷ Bataya và Batow – tộc người ăn thịt từng sống trong rừng sâu và đang nuôi dưỡng con quỷ Bataya bằng hận thù và xác người. Trong cuộc truy đuổi đẫm máu giữa rừng thiêng, Dan không chỉ phải đối đầu với Ta Fai, mà còn bị ám ảnh bởi những tiếng gọi ma quái, những ám ảnh dị dạng và nỗi sợ sâu kín nhất của chính anh. Khi vợ anh – Vi – đang mang thai sắp sinh và lạc giữa rừng, Dan buộc phải chọn: công lý… hay sự an toàn của gia đình mình? Halabala không chỉ là cuộc săn đuổi, mà là hành trình trượt dài vào vực thẳm của tâm trí – nơi ranh giới giữa con người và quỷ dữ trở nên mờ dần...",
//   //     features: [
//   //       "Đạo Diễn:  Eakasit Thairaat",
//   //       "Diễn Viên: Chantavit Dhanasevi, Nuttanicha Dungwattanawanich, Anon Saisangchan, Yasaka Chaisorn",
//   //       "Thể Loại: Kinh dị",
//   //       "Khởi Chiếu:  27/06/2025",
//   //       "Thời Lượng: 90 phút",
//   //       "Ngôn Ngữ: Tiếng Thái - Phụ đề Tiếng Việt và Tiếng Anh"
//   //     ],
//   //     meta: {
//   //     },
//   //     nutrition: [
//   //       { videoSrc: "PRO230/Phim/Halabala Rừng Ma Tế Xác/videoplayback.mp4" },
//   //     ]
//   //   },
//   // ];
//
//
//   // Display products
//   // function displayProducts(items) {
//   //   if (!productsContainer) return;
//
//   //   productsContainer.innerHTML = "";
//
//   //   items.forEach((product) => {
//   //     const productElement = document.createElement("div");
//   //     productElement.classList.add("product-card");
//   //     productElement.setAttribute("data-aos", "fade-up");
//   //     productElement.setAttribute("data-category", product.category.join(" "));
//
//   //     productElement.innerHTML = `
//   //               <div class="product-image">
//   //                   <img src="${product.image}" alt="${product.name}">
//   //               </div>
//   //               <div class="product-info">
//   //                   <h3>${product.name}</h3>
//   //                   <p class="price">${product.price}</p>
//   //                   <p class="description">${product.description}</p>
//   //                   <a href="/ChiTietSanPham.html?movieId=${product.id}" class="btn-secondary">Xem Chi Tiết</a>
//   //               </div>
//   //           `;
//
//   //     productsContainer.appendChild(productElement);
//   //   });
//
//   //   observeVisibleCards();
//   // }
//
//   function displayProducts(items) {
//     const productsContainer = document.getElementById("productsContainer") || document.getElementById("homeProductsGrid");
//     if (!productsContainer) return;
//
//     productsContainer.innerHTML = "";
//
//     items.forEach((product) => {
//       const productElement = document.createElement("div");
//       productElement.classList.add("product-card");
//       productElement.setAttribute("data-aos", "fade-up");
//       productElement.setAttribute("data-category", product.category.join(" "));
//
//       productElement.innerHTML = `
//                 <div class="product-image">
//                     <img src="${product.image}" alt="${product.name}">
//                 </div>
//                 <div class="product-info">
//                     <h3>${product.name}</h3>
//                     <p class="price">${product.price}</p>
//                     <p class="description">${product.description}</p>
//                     <a href="/ChiTietSanPham.html?movieId=${product.id}" class="btn-secondary">Xem Chi Tiết</a>
//                 </div>
//             `;
//
//       productsContainer.appendChild(productElement);
//     });
//
//     observeVisibleCards();
//   }
//
//   async function fetchMovies() {
//   try {
//     const res = await fetch('/api/movies');
//     if (!res.ok) throw new Error('Không thể kết nối API phim');
//
//     const list = await res.json();
//
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Đưa về mốc 00:00:00 hôm nay để so sánh chính xác ngày
//
//     products.length = 0; // Clear mảng cũ
//
//     list.forEach(m => {
//       const cats = [];
//
//       // 🟢 1. LOGIC PHÂN LOẠI NGÀY CHIẾU chuẩn rạp phim
//       if (m.NgayChieu) {
//         let premiere;
//
//         // Xử lý linh hoạt cả định dạng "DD/MM/YYYY" lẫn "YYYY-MM-DD"
//         if (typeof m.NgayChieu === 'string' && m.NgayChieu.includes('/')) {
//           const [dd, mm, yyyy] = m.NgayChieu.split('/');
//           premiere = new Date(`${yyyy}-${mm}-${dd}`);
//         } else {
//           premiere = new Date(m.NgayChieu);
//         }
//
//         premiere.setHours(0, 0, 0, 0);
//
//         // Phim đã hoặc đang khởi chiếu hôm nay -> Đang chiếu
//         if (premiere <= today) {
//           cats.push('DangChieu');
//         }
//         // Phim có ngày chiếu ở tương lai -> Sắp chiếu
//         else {
//           cats.push('SapChieu');
//         }
//       } else {
//         // Nếu không có ngày chiếu -> Mặc định là Sắp chiếu
//         cats.push('SapChieu');
//       }
//
//       // Phân loại độ tuổi không giới hạn
//       if (parseInt(m.DoTuoi, 10) === 0 || m.DoTuoi === 'P') {
//         cats.push('KhongGioiHan');
//       }
//
//       // 🟢 2. PUSH OBJECT ĐẦY ĐỦ THUỘC TÍNH (Bao gồm Trailer)
//       products.push({
//         id: m.MovieID || m.id,
//         name: m.TieuDe || m.name,
//         price: (+m.GiaVe || 0).toLocaleString('vi-VN') + 'đ',
//         image: m.PosterUrl || m.image || '/api/placeholder?width=300',
//
//         // QUAN TRỌNG: Gán Trailer_ID để phục vụ tính năng xem Trailer
//         Trailer_ID: m.Trailer_ID || m.trailerid || m.TrailerID || m.TrailerUrl || m.trailer || '',
//
//         description: '<b>Độ tuổi:</b> ' + (m.DoTuoi || '—'),
//         features: [
//           `Đạo diễn: ${m.DaoDien || 'Đang cập nhật'}`,
//           `Diễn viên: ${m.DienVien || 'Đang cập nhật'}`,
//           `Thể loại: ${m.TheLoai || 'Chưa phân loại'}`,
//           `Thời lượng: ${m.ThoiLuong || 0} phút`,
//           `Ngôn ngữ: ${m.NgonNgu || 'Phụ đề/Lồng tiếng'}`
//         ],
//         category: cats
//       });
//     });
//
//     if (typeof renderProducts === 'function') {
//       renderProducts(products);
//     }
//
//   } catch (e) {
//     console.error('fetchMovies lỗi:', e);
//   }
// }
//
//   await fetchMovies();
//   // Filter products
//   displayProducts(products);
//   if (filterBtns.length > 0) {
//     filterBtns.forEach((btn) => {
//       btn.addEventListener("click", () => {
//         filterBtns.forEach((b) => b.classList.remove("active"));
//         btn.classList.add("active");
//
//         const filter = btn.getAttribute("data-filter");
//
//         if (filter === "all") {
//           displayProducts(products);
//         } else {
//           //   const filteredProducts = currentMovie.filter(product => {
//           //   // nếu category là chuỗi, biến nó thành mảng tạm:
//           //   const cats = Array.isArray(currentMovie.category)            //phần bị thay thế bằng .filer
//           //     ? currentMovie.category
//           //     : [currentMovie.category];
//           //   return cats.includes(filter);
//           // });
//           const filtered = products         // ← 1) phải dùng mảng gốc
//             .filter(p => {
//               const cats = Array.isArray(p.category) ? p.category : [p.category];
//               return cats.includes(filter);  // currentFilter lấy từ UI
//             });
//           displayProducts(filtered);
//         }
//       });
//     });
//
//   }
//
//   // Product Detail Page
//   const productDetail = document.getElementById("productDetail");
//   const productDescription = document.getElementById("productDescription");
//   const productNutrition = document.getElementById("productNutrition");
//   const relatedProducts = document.getElementById("relatedProducts");
//
//   if (productDetail && productDescription && productNutrition && relatedProducts) {
//     /* 1. Lấy ID từ URL */
//     const params = new URLSearchParams(window.location.search);
//     const productId = Number(params.get("movieId") || params.get("id"));
//     /* 2. Tìm sản phẩm */
//     currentMovie = products.find(p => p.id === productId);
//     const product = currentMovie;
//
//     if (!product) {
//       /* --- Không tìm thấy --- */
//       productDetail.innerHTML = `
//       <div class="product-not-found">
//         <h2>Không tìm thấy Video</h2>
//         <p>Phim bạn đang tìm không tồn tại hoặc đã bị xoá.</p>
//         <a href="/ChiTietSanPham.html" class="btn">Quay lại</a>
//       </div>`;
//       productDescription.style.display = "none";
//       productNutrition.style.display = "none";
//       document.querySelector(".related-products").style.display = "none";
//       return;
//     }
//
//     /* 3. Title & breadcrumb */
//     document.title = `${currentMovie.name} - EVL`;
//     const productName = document.getElementById("productName");
//     if (productName) productName.textContent = currentMovie.name;
//
//     /* 4. Render phần chi tiết */
//     productDetail.innerHTML = `
//     <div class="product-detail-image">
//       <img src="${currentMovie.image}" alt="${currentMovie.name}">
//     </div>
//     <div class="product-detail-info">
//       <h1>${currentMovie.name}</h1>
//       <p class="product-detail-price">${currentMovie.price}</p>
//
//       <div class="product-detail-desc">
//         <p>${currentMovie.description}</p>
//         <ul>${(currentMovie.features || []).filter(f => !!f).map(f => `<li>${f}</li>`).join('')}</ul>
//       </div>
//
//       <div class="product-detail-meta">
//         ${Object.entries(currentMovie.meta || {}).map(([k, v]) => `
//             <div class="meta-item">
//               <span class="meta-label">${k}:</span>
//               <span>${v}</span>
//             </div>`
//     ).join("")}
//       </div>
//
//       <div class="contact-buttons">
//         <a href="tel:0911404053" class="btn-phone">
//           <i class="fas fa-phone-alt"></i> Liên hệ: 0911404053
//         </a>
//
//         <a href="https://zalo.me/0911404053" class="btn-zalo" target="_blank">
//           <i class="fas fa-comment"></i> Zalo
//         </a>
//
//         <button id="bookOnlineBtn" class="btn-pay">Đặt vé</button>
//       </div>
//     </div>
//   `;
//     attachBookingEvents();
//
//     /* 6. Trailer video */
//     // Lấy linh hoạt các tên thuộc tính trailer có thể có từ Database/API
//     const trailerUrl = currentMovie.Trailer_ID || currentMovie.trailerUrl || currentMovie.TrailerUrl || '';
//
//     productNutrition.innerHTML = trailerUrl
//       ? `
//         <h2>Trailer Phim</h2>
//         <div class="video-container" style="margin-top: 15px;">
//           ${renderTrailerHTML(trailerUrl)}
//         </div>`
//       : `<p style="padding: 10px 0; color: #888;">Chưa có trailer cho phim này.</p>`;
//
//
//     /* 7. Sản phẩm liên quan */
//     const related = products
//       .filter(p => p.category === currentMovie.category && p.id !== currentMovie.id)
//       .slice(0, 4);
//
//     related.forEach(rp => {
//       const card = document.createElement("div");
//       card.classList.add("product-card");
//       card.innerHTML = `
//       <div class="product-image">
//         <img src="${rp.image}" alt="${rp.name}">
//       </div>
//       <div class="product-info">
//         <h3>${rp.name}</h3>
//         <p class="price">${rp.price}</p>
//         <a href="/ChiTietSanPham.html?movieId=${rp.id}" class="btn-secondary">Xem Chi Tiết</a>
//       </div>`;
//       relatedProducts.appendChild(card);
//     });
//   }
// });
//
//
// //thong tin san pham noi bat
// document.addEventListener('DOMContentLoaded', function () {
//   const options = { threshold: 0.1 };
//   const callback = (entries, observer) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add('animate');
//         observer.unobserve(entry.target);
//       }
//     });
//   };
//   const observer = new IntersectionObserver(callback, options);
//   const textEl = document.querySelector('.SanPhamNoiBat-text');
//   if (textEl) observer.observe(textEl);
//
//   const imgEl = document.querySelector('.SanPhamNoiBat-image');
//   if (imgEl) observer.observe(imgEl);
// });
//
// // fade hien thi san pham
// let cardObserver = null;
//
// function initCardObserver() {
//   if (cardObserver) return cardObserver;     // đã tạo thì dùng lại
//   cardObserver = new IntersectionObserver((entries, obs) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         // Tính thứ tự card trong DOM
//         const idx = [...document.querySelectorAll('.product-card')].indexOf(entry.target);
//         entry.target.style.transitionDelay = `${idx * 0.05}s`;
//         entry.target.classList.add('visible');
//         obs.unobserve(entry.target);         // bỏ quan sát
//       }
//     });
//   }, { threshold: 0.05 });
//   return cardObserver;
// }
//
// /* =========  OBSERVER CHO CÁC CARD MỚI ========= */
// function observeVisibleCards() {
//   const obs = initCardObserver();
//   document.querySelectorAll('.product-card').forEach(card => {
//     if (!card.classList.contains('visible')) obs.observe(card);
//   });
// }
//
// /* ========= HOME PAGE ========= */
// document.addEventListener('DOMContentLoaded', () => {
//   // Nếu trang hiện tại có featured-products (home) thì run ngay
//   if (document.querySelector('.featured-products')) {
//     observeVisibleCards();
//   }
// });
//
//
// /*Trang quản lý*/
// const adminBtn = document.getElementById('adminBtn');
// const adminModal = document.getElementById('adminModal');
// if (adminBtn && adminModal) {
//   const closeAdmin = document.querySelector('.close-admin');
//   const exitBtn = document.getElementById('adminExitBtn');
//   const loginBtn = document.getElementById('adminLoginBtn');
//   const codeInput = document.getElementById('adminCodeInput');
//
//   // Mở modal khi click nút Quản lý
//   adminBtn.addEventListener('click', () => {
//     adminModal.classList.add('show');
//     codeInput.value = '';
//   });
//
//   // Đóng modal
//   closeAdmin.addEventListener('click', () => adminModal.style.display = 'none');
//   exitBtn.addEventListener('click', () => adminModal.style.display = 'none');
//   window.addEventListener('click', e => {
//     if (e.target === adminModal) adminModal.style.display = 'none';
//   });
//
//   // Xử lý Đăng nhập
//   // loginBtn.addEventListener('click', () => {
//   //   const code = codeInput.value.trim();
//   //   if (!code) {
//   //     return alert('Thông tin mã quản lý không được để trống!');
//   //   }
//   //   if (code !== 'EVL123') {  // thay 'ADMIN123' bằng mã thật của bạn
//   //     return alert('Mã của bạn không hợp lệ');
//   //   }
//   //   // thành công → điều hướng
//   //   window.location.href = '/Admin/QuanLyPhim.html';
//   // });
// }
//
// //Kết nối dữ liệu
// // document.addEventListener('DOMContentLoaded', () => {
// //   const bookBtn = document.getElementById('bookOnlineBtn');
// //   if (!bookBtn) return;
// //   const modal = document.getElementById('bookingModal');
// //   const closeBtn = document.getElementById('bookingClose');
// //   const qtyInput = document.getElementById('so_luong');
// //   qtyInput.value = 0;
//
// //   function pickFeature(label) {
// //     const line = (currentMovie.features || []).find(f => f.toLowerCase().startsWith(label.toLowerCase()));
// //     return line ? line.split(':').slice(1).join(':').trim() : '—';
// //   }
//
// //   // 1) Khi click "Đặt vé" → load showtimes rồi show modal
// //   bookBtn.addEventListener('click', async () => {
// //     const movieId = new URLSearchParams(window.location.search).get('movieId');
// //     const allShows = await fetch(`/api/showtimes?movieId=${movieId}`).then(r => r.json());
// //     const shows = Array.isArray(allShows) ? allShows : Array.isArray(allShows.data) ? allShows.data : Object.values(allShows || {});
// //     initDateTabs(shows, movieId);
// //     if (!movieId) return alert('Không tìm thấy movieId');
// //     await loadShowtimes(movieId);
// //     modal.style.display = 'flex';
// //     const { Thể_loại = '—', Ngôn_ngữ = '—' } = currentMovie.features || {};
// //     document.getElementById('booking-form').style.display = 'block';
// //     document.getElementById('qrContainer').style.display = 'none';
// //     document.getElementById('modalPoster').src = currentMovie.image;
// //     document.getElementById('modalTitle').textContent = currentMovie.name;
// //     document.getElementById('modalGenre').textContent = pickFeature('Thể Loại');
// //     document.getElementById('modalLang').textContent = pickFeature('Ngôn Ngữ');
// //     modal.style.display = 'flex';
// //   });
//
// //   // 2) Đóng modal
// //   closeBtn.addEventListener('click', () => {
// //     modal.style.display = 'none';
// //   });
//
// //   // 3) Xác nhận thanh toán → gọi API book.php
// //   const payBtn = document.getElementById('confirmBooking');
// //   payBtn.addEventListener('click', () => {
// //     // Chỉ requestSubmit khi thật sự click nút trong modal
// //     document.getElementById('booking-form').requestSubmit();
// //   });
// //   if (!payBtn) console.error('Không tìm thấy nút confirmBooking');
//
// //   // Hàm tạo QR: dùng QRCode.js (include thư viện vào <head>)
// //   function generateQRCode(text) {
// //     const container = document.getElementById('qrContainer');
// //     container.innerHTML = '';
// //     new QRCode(container, {
// //       text: text,
// //       width: 200,
// //       height: 200
// //     });
// //   }
// // });
//
// // document.getElementById('booking-form').addEventListener('submit', async e => {
// //   e.preventDefault();  // chặn reload
//
// //   const showtimeId = document.getElementById('showtime_id').value;
// //   const seats = document.getElementById('ghe_ngoi').value;
// //   const qty = Number(document.getElementById('so_luong').value);
//
// //   if (!seats) {
// //     return alert('Bạn chưa chọn ghế');
// //   }
//
// //   try {
// //     const res = await fetch('api/book.php', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ showtime_id: showtimeId, seats, qty })
// //     });
// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data.error || 'Đặt vé thất bại');
//
// //     // ẩn form, show QR
// //     document.getElementById('booking-form').style.display = 'none';
// //     const qrWrap = document.getElementById('qrContainer');
// //     qrWrap.style.display = 'flex';
// //     qrWrap.innerHTML = '';
// //     new QRCode(qrWrap, {
// //       text: JSON.stringify({
// //         bookingId: data.bookingId,
// //         seats,
// //         qty
// //       }),
// //       width: 200,
// //       height: 200
// //     });
//
// //   } catch (err) {
// //     alert(err.message);
// //   }
//
// const form = document.getElementById('booking-form');
// if (form) {
//   // document.getElementById('booking-form').addEventListener('submit', async e => {
//   form.addEventListener('submit', async e => {
//     e.preventDefault();
//     // 1) Lấy dữ liệu
//     const showtimeId = document.getElementById('showtime_id').value;
//     const seatStr = document.getElementById('ghe_ngoi').value.trim();
//     const customer = document.getElementById('customer').value.trim();
//     const email = document.getElementById('email').value.trim();
//     const phone = document.getElementById('phone').value.trim();
//     if (!seatStr) {
//       alert('Vui lòng chọn ghế');
//       return;
//     }
//     const seats = seatStr.split(',');
//     if (!customer) {
//       alert('Vui lòng nhập họ và tên');
//       return;
//     }
//     if (!phone) {
//       alert('Vui lòng nhập số điện thoại'); return;
//     }
//     // if (!email) {
//     //   alert('Vui lòng nhập email');
//     //   return;
//     // }
//     // (tuỳ chọn) kiểm tra format email
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (email && !emailPattern.test(email)) {
//       alert('Email không hợp lệ');
//       return;
//     }
//
//     const phonePattern = /^0\d{9}$/;
//     if (!phonePattern.test(phone)) {
//       alert('Số điện thoại không hợp lệ'); return;
//     }
//
//     // 2) Gửi JSON đúng key mà BookingController đọc (showtimeId, seats, customer, phone, email)
//     try {
//       const res = await fetch('/api/bookings', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ showtimeId: Number(showtimeId), seats, customer, phone, email })
//       });
//
//       let data;
//       try {
//         data = await res.json();
//       } catch {
//         return alert('Lỗi dữ liệu từ server, thử lại sau.');
//       }
//
//       if (!res.ok || !data.ok) {
//         if (data.conflictSeats) {
//           return alert('Đặt vé thất bại: ' + data.conflictSeats.join(', ') + ' vừa bị người khác đặt trước.');
//         }
//         return alert('Đặt vé thất bại: ' + (data.error || 'Không rõ lỗi'));
//       }
//
//       // thành công
//       sessionStorage.setItem('email', email);
//       sessionStorage.setItem('justBooked', '1');
//       sessionStorage.setItem('phone', phone);
//       alert('Đặt vé thành công! Mã Booking = ' + data.bookingId);
//       window.open(`/HoaDon.html?bookingId=${data.bookingId}`, '_blank');
//       document.getElementById('booking-form').reset();
//       window.location.href = '/History/LichSuDatVeNguoiDung.html';
//
//     } catch (err) {
//       console.error('Lỗi mạng hoặc khác:', err);
//       alert('Có lỗi xảy ra, vui lòng thử lại.');
//     }
//   });
// }
//
// /* ===== 1) Khi đã chọn giờ chiếu ===== */
// async function loadSeatMap(showtimeId) {
//   // 1. Lấy mảng ghế đã bán dạng ["A1","A2",...]
//   const booked = await fetch(`/api/bookings?showtimeId=${showtimeId}`).then(r => r.json());
//
//   // 2. Cấu hình sơ đồ (ví dụ 8 hàng x 12 cột)
//   const rows = 'ABCDEFGH'.split('');
//   const cols = 9;
//   const seatMapEl = document.getElementById('seat-map');
//   seatMapEl.style.display = 'grid';
//   seatMapEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
//   seatMapEl.innerHTML = '';             // clear cũ
//
//   rows.forEach(r => {
//     for (let c = 1; c <= cols; c++) {
//       const id = `${r}${c}`;
//       const btn = document.createElement('div');
//       btn.textContent = c;
//       btn.dataset.seatId = id;
//       btn.className = 'seat ' + (booked.includes(id) ? 'booked' : 'free');
//       // --- thêm sự kiện chọn ghế ---
//       btn.addEventListener('click', () => {
//         if (btn.classList.contains('booked')) return;      // không chọn ghế đã bán
//         btn.classList.toggle('selected');                   // bật/tắt chọn
//         // cập nhật input #ghe_ngoi
//         const selected = Array.from(
//           document.querySelectorAll('.seat.selected')
//         ).map(x => x.dataset.seatId);
//         // document.getElementById('selectedSeats').value = selected.join(',');
//         document.getElementById('ghe_ngoi').value = selected.join(',');
//         updateSelectedSeats();
//       });
//       seatMapEl.appendChild(btn);
//     }
//   });
//
// }
//
// /* ===== 2) Click chọn ===== */
// // document.getElementById('seat-map').addEventListener('click', e => {
// //   const seat = e.target.closest('.seat');
// //   if (!seat || seat.classList.contains('booked')) return;
//
// //   seat.classList.toggle('selected');
// //   updateSelectedSeats();
// // });
//
// function updateSelectedSeats() {
//   const sels = Array.from(document.querySelectorAll('#seat-map .selected')).map(s => s.dataset.seatId);
//   document.getElementById('ghe_ngoi').value = sels.join(',');
//   document.getElementById('so_luong').value = sels.length;
//   const price = Number(window.currentMovie?.GiaVe) || TICKET_PRICE;
//   const total = sels.length * price;
//   document.getElementById('total_price').textContent = total.toLocaleString('vi-VN') + ' đ';
// }
//
// async function loadMovieDetails(movieId) {
//   try {
//     const res = await fetch(`/api/movies?movieId=${movieId}`);
//     if (!res.ok) throw new Error('Movies API lỗi ' + res.status);
//
//     const movie = await res.json();
//     window.currentMovie = movie;
//
//     // 1. Gán mô tả phim
//     const descEl = document.getElementById('productDescription');
//     if (descEl) {
//       descEl.innerText = movie.MieuTa || 'Chưa có thông tin mô tả.';
//     }
//
//     // 2. Gán Poster (Nếu bạn có thẻ img hiển thị poster)
//     const posterEl = document.getElementById('productImage') || document.getElementById('moviePoster');
//     if (posterEl) {
//       posterEl.src = movie.PosterUrl || '/api/placeholder?width=1200&height=800';
//       posterEl.alt = movie.TieuDe || 'Poster phim';
//     }
//
//     // 3. Render Trailer (Hỗ trợ cả YouTube lẫn MP4)
//     const trailerBox = document.getElementById('productNutrition') || document.getElementById('trailerContainer');
//     if (trailerBox) {
//       const trailerUrl = movie.Trailer_ID || movie.TrailerUrl || movie.trailerUrl || '';
//       trailerBox.innerHTML = `
//         <h2>Trailer Phim</h2>
//         <div class="video-container" style="margin-top: 15px;">
//           ${renderTrailerHTML(trailerUrl)}
//         </div>
//       `;
//     }
//   } catch (err) {
//     console.error('Lỗi khi tải chi tiết phim:', err);
//   }
// }
//
// // document.addEventListener('DOMContentLoaded', () => {
// //   if (!document.getElementById('trailer')) return;  // chỉ chạy trên trang detail
// //   const movieId = new URLSearchParams(location.search).get('movieId');
// //   loadMovieDetails(movieId);
// // });
//
// function attachBookingEvents() {
//   const bookBtn = document.getElementById('bookOnlineBtn');
//   if (!bookBtn) return;
//
//   const modal = document.getElementById('bookingModal');
//   const closeBtn = document.getElementById('bookingClose');
//   const qtyInput = document.getElementById('so_luong');
//   qtyInput.value = 0;
//
//   // Hàm tách dòng đặc tính
//   function pickFeature(label) {
//     const line = (currentMovie.features || []).find(f =>
//       f.toLowerCase().startsWith(label.toLowerCase()));
//     return line ? line.split(':').slice(1).join(':').trim() : '—';
//   }
//
//   // 1) Khi click "Đặt vé"
//   bookBtn.addEventListener('click', async () => {
//     const movieId = new URLSearchParams(location.search).get('movieId');
//     if (!movieId) return alert('Không tìm thấy movieId');
//
//     // Lấy tất cả suất chiếu
//     const shows = await fetch(`/api/showtimes?movieId=${movieId}`)
//       .then(r => r.json());
//
//     initDateTabs(shows, movieId);       // render các tab ngày
//     await loadShowtimes(movieId);       // render suất + ghế mặc định
//
//     // Đổ thông tin phim vào modal
//     document.getElementById('modalPoster').src = currentMovie.PosterUrl || '';
//     document.getElementById('modalTitle').textContent = currentMovie.TieuDe || '';
//     const poster = currentMovie.PosterUrl || currentMovie.image || '/api/placeholder';
//     const title = currentMovie.TieuDe || currentMovie.name || '';
//
//     document.getElementById('modalPoster').src = poster;
//     document.getElementById('modalTitle').textContent = title;
//     document.getElementById('modalGenre').textContent = pickFeature('Thể Loại');
//     document.getElementById('modalLang').textContent = pickFeature('Ngôn Ngữ');
//
//     // Hiển thị modal
//     modal.style.display = 'flex';
//     document.getElementById('booking-form').style.display = 'block';
//     document.getElementById('qrContainer').style.display = 'none';
//   });
//
//   // 2) Đóng modal
//   closeBtn.addEventListener('click', () => modal.style.display = 'none');
//
//   // 3) Xác nhận thanh toán
//   document.getElementById('confirmBooking').addEventListener('click', () => {
//     document.getElementById('booking-form').requestSubmit();
//   });
// }
//
// document.addEventListener('DOMContentLoaded', () => {
//   const movieId = new URLSearchParams(location.search).get('movieId');
//   if (movieId) loadMovieDetails(movieId);
// });
//
// /**
//  * Trích xuất YouTube Video ID từ link YouTube bất kỳ.
//  * Trả về string ID nếu là link YouTube, hoặc null nếu không phải.
//  */
// function getYouTubeId(url) {
//     if (!url) return null;
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
// }
//
// /**
//  * Hàm nhúng Trailer an toàn (YouTube / MP4 / Link khác)
//  * @param {string} trailerUrl - Đường dẫn trailer từ Database
//  * @returns {string} Chuỗi HTML để chèn vào DOM
//  */
// function renderTrailerHTML(trailerUrl) {
//     // 1. Kiểm tra nếu không có URL hoặc không phải chuỗi -> Trả về thông báo nhẹ
//     if (!trailerUrl || typeof trailerUrl !== 'string' || trailerUrl.trim() === '') {
//         return `
//             <div class="no-trailer" style="padding: 30px; text-align: center; background: #1a1a1a; color: #888; border-radius: 8px;">
//                 <p>🎬 Hiện chưa có Trailer cho phim này.</p>
//             </div>`;
//     }
//
//     try {
//         let cleanUrl = trailerUrl.trim();
//
//         // 2. Trường hợp Link YOUTUBE (Tự động tách Video ID)
//         if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
//             let videoId = '';
//
//             if (cleanUrl.includes('youtu.be/')) {
//                 // Dạng: https://youtu.be/abcd123
//                 videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
//             } else if (cleanUrl.includes('watch?v=')) {
//                 // Dạng: https://www.youtube.com/watch?v=abcd123
//                 videoId = cleanUrl.split('watch?v=')[1]?.split('&')[0];
//             } else if (cleanUrl.includes('/embed/')) {
//                 // Dạng: https://www.youtube.com/embed/abcd123
//                 videoId = cleanUrl.split('/embed/')[1]?.split('?')[0];
//             } else if (cleanUrl.includes('/shorts/')) {
//                 // Dạng: https://www.youtube.com/shorts/abcd123
//                 videoId = cleanUrl.split('/shorts/')[1]?.split('?')[0];
//             }
//
//             if (videoId) {
//                 return `
//                     <iframe width="100%" height="360"
//                         src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0"
//                         title="YouTube video player" frameborder="0"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowfullscreen style="border-radius: 8px; width: 100%;">
//                     </iframe>`;
//             }
//         }
//
//         // 3. Trường hợp Video MP4 trực tiếp
//         if (cleanUrl.toLowerCase().endsWith('.mp4') || cleanUrl.toLowerCase().endsWith('.webm')) {
//             return `
//                 <video width="100%" height="360" controls style="border-radius: 8px; background: #000; width: 100%;">
//                     <source src="${cleanUrl}" type="video/mp4">
//                     Trình duyệt của bạn không hỗ trợ phát video.
//                 </video>`;
//         }
//
//         // 4. Trường hợp link Iframe có sẵn
//         return `
//             <iframe width="100%" height="360" src="${cleanUrl}"
//                 frameborder="0" allowfullscreen style="border-radius: 8px; width: 100%;">
//             </iframe>`;
//
//     } catch (error) {
//         console.error("Lỗi khi render Trailer:", error, "URL gốc:", trailerUrl);
//         return `
//             <div class="trailer-error" style="padding: 20px; text-align: center; color: #ff6b6b;">
//                 Không thể tải video trailer này.
//             </div>`;
//     }
// }
//
// // Ví dụ: Hàm mở Modal Trailer phim
// function openTrailerModal(movie) {
//     const trailerContainer = document.getElementById('trailerContainer'); // Thẻ div chứa trailer
//
//     if (trailerContainer) {
//         // Nhúng HTML trailer an toàn
//         trailerContainer.innerHTML = renderTrailerHTML(movie.Trailer_ID);
//     }
//
//     // Mở modal (Tùy theo thư viện hoặc JS modal bạn dùng)
//     const modal = document.getElementById('trailerModal');
//     if (modal) modal.style.display = 'block';
// }
//
// // Ví dụ: Đóng Modal thì dừng phát video (xóa iframe)
// function closeTrailerModal() {
//     const trailerContainer = document.getElementById('trailerContainer');
//     if (trailerContainer) {
//         trailerContainer.innerHTML = ''; // Clear để ngắt tiếng video đang chạy ngầm
//     }
//     const modal = document.getElementById('trailerModal');
//     if (modal) modal.style.display = 'none';
// }
//
// window.editMovie = async id => {
//   // 1) gọi API lấy chi tiết phim
//   const res = await fetch(`/api/movies?movieId=${id}`);
//   if (!res.ok) { alert('Không lấy được dữ liệu phim'); return; }
//   const m = await res.json();
//
//   // 2) gán đầy đủ vào form
//   movieForm.title.value = m.TieuDe || '';
//   movieForm.duration.value = m.ThoiLuong || '';
//   movieForm.ageRate.value = m.DoTuoi || '';
//   premiereInp.value = m.NgayKhoiChieu ? m.NgayKhoiChieu.split('T')[0] : '';
//   movieForm.TheLoai.value = m.TheLoai || '';
//   movieForm.price.value = m.GiaVe || 200000;
//   movieForm.language.value = m.NgonNgu || '';
//   movieForm.director.value = m.DaoDien || '';
//   movieForm.cast.value = m.DienVien || '';
//   movieForm.description.value = m.MieuTa || '';
//
//   // 👉 THÊM DÒNG NÀY: Nạp link trailer vào form sửa
//   if (movieForm.Trailer_ID) {
//     movieForm.Trailer_ID.value = m.Trailer_ID || m.TrailerUrl || '';
//   }
//
//   // 3) preview poster nếu có
//   if (m.PosterUrl) {
//     preview.src = m.PosterUrl;
//     preview.style.display = 'block';
//   } else {
//     preview.style.display = 'none';
//   }
//   posterInp.value = '';
//   movieForm.dataset.oldPoster = m.PosterUrl || '';
//
//   // 4) đánh dấu sửa và mở modal
//   movieForm.dataset.editing = m.MovieID;
//   movieModal.style.display = 'flex';
// };


const TICKET_PRICE = 200000;
const movieId = new URLSearchParams(window.location.search).get('movieId') || '';
let selectedDate = '';
let selectedShowtimeId = null;
let selectedSeats = [];


let currentMovie = null;
async function openBookingModal(movieId) {
  if (!movieId) return;
  currentMovie = movieId;
  // 1) Hiện popup
  document.getElementById('bookingModal').style.display = 'flex';
  // 2) Load tab ngày/giờ/ghế
  // loadDateTabs(movieId);
  // loadShowtimes(movieId);
  const shows = await fetch(`/api/showtimes?movieId=${movieId}`).then(r => r.json());
  // 3) Khởi tạo các tab ngày
  initDateTabs(shows, movieId);  // gọi đúng hàm initDateTabs :contentReference[oaicite:0]{index=0}L9-L17
  // 4) Load giờ chiếu của ngày đầu tiên
  await loadShowtimes(movieId, shows[0].date);
}
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movieId');
  const btn = document.getElementById('bookOnlineBtn');
  if (btn) {
    btn.addEventListener('click', () => openBookingModal(movieId));
  }
});

// document.getElementById('bookingClose').addEventListener('click', () => {
//   document.getElementById('bookingModal').style.display = 'none';
// });

const closeBtn = document.getElementById('bookingClose');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    document.getElementById('bookingModal').style.display = 'none';
  });
}

function initDateTabs(showtimes = [], movieId) {
  if (!showtimes.length) {
    document.querySelector('.date-tabs').innerHTML = '<li>Chưa có lịch</li>';
    return;
  }
  const tabsEl = document.querySelector('.date-tabs');
  const raw = showtimes.map(s => {
    // const dt = typeof s === 'string' ? s : (s.NgayChieu || s.dt || s.ThoiGianBatDau || '');
    const dt = typeof s === 'string' ? s : (s.date || s.startTime || s.NgayChieu || s.dt || s.ThoiGianBatDau || '');
    return dt.substr(0, 10);
  });

  // const dates = [...new Set(showtimes.map(s => s.substr(0, 10)))];
  const dates = [...new Set(raw)];
  tabsEl.innerHTML = dates.map((d, i) =>
      `<li data-date="${d}"${i === 0 ? ' class="active"' : ''}>${d.split('-').reverse().join('/')}</li>`

  ).join('');
  selectedDate = dates[0];
  document.getElementById('booking-date').innerText = dates[0].split('-').reverse().join('/');
  document.getElementById('form-date').value = selectedDate;
  tabsEl.querySelectorAll('li').forEach(li =>
      li.addEventListener('click', () => {
        document.querySelector('.date-tabs .active').classList.remove('active');
        li.classList.add('active');
        document.getElementById('booking-date').innerText = li.textContent;
        document.getElementById('form-date').value = li.dataset.date;
        loadShowtimes(movieId, li.dataset.date);
      })
  );
}

async function loadShowtimes(movieId, date) {
  console.log('▶ Enter loadShowtimes:', { movieId, date });
  const cont = document.getElementById('showtimes-container');
  console.log('▶ showtimes-container:', cont);
  // 1) Bảo vệ nếu không có movieId
  if (!movieId) {
    console.warn('loadShowtimes: thiếu movieId');
    return;
  }
  // 2) Lấy date mặc định từ tab active nếu chưa truyền
  if (!date) {
    // const tab = document.querySelector('.date-tabs li.active');
    // date = tab?.dataset.date;
    date = document.querySelector('.date-tabs li.active')?.dataset.date;
    if (!date) {
      console.warn('loadShowtimes: thiếu date');
      return;
    }
  }

  try {
    const res = await fetch(`/api/showtimes?movieId=${movieId}&date=${date}`);
    if (!res.ok) throw new Error('API showtimes lỗi ' + res.status);
    const shows = await res.json();
    console.log('▶ shows[0] =', shows[0]);
    if (!shows.length) throw new Error('Lỗi! Chưa có suất nào cho ngày này');

    const cont = document.getElementById('showtimes-container');
    console.log('showtimes-container:', cont);

    cont.innerHTML = shows.map(st => {
      const raw = st.time || '';              // ← dùng đúng khóa giờ
      const hhmm = (raw.match(/\d{2}:\d{2}/) || ['–:–'])[0];
      return `<button type="button" class="showtime-btn" data-id="${st.ShowTimeID}" data-time="${hhmm}"> ${hhmm}</button>`;
    }).join('');

    // cont.innerHTML = shows.map(st => {
    //   // 1) Lấy chuỗi giờ gốc
    //   let iso = st.startTime || st.ThoiGianBatDau || '';

    //   // 2) Rút ra HH:mm (khớp 00-59:00-59)
    //   const m = iso.match(/\d{2}:\d{2}/);          // "08:00:00.000" → ["08:00"]
    //   const hour = m ? m[0] : '–:–';

    //   return `<button type="button"
    //               class="showtime-btn"
    //               data-id="${st.ShowTimeID}"
    //               data-time="${hour}">
    //         ${hour}
    //       </button>`;
    // }).join('');

    //     cont.innerHTML = shows.map(st => {
    //       let iso = st.startTime || st.ThoiGianBatDau || '';
    //       if (iso && !/[T\-]/.test(iso) && /^\d{2}:\d{2}(:\d{2})?$/.test(iso)) {
    //   // API trả chỉ giờ → ghép thêm ngày đã chọn
    //   iso = `${date}T${iso}`;
    // } else if (iso.includes(' ')) {
    //   iso = iso.replace(' ', 'T');
    // }
    //       // if (iso && iso.includes(' ')) iso = iso.replace(' ', 'T');
    //       const d = new Date(iso);
    //       // const hour = new Date(iso).toLocaleTimeString('vi-VN', {
    //       const hour = isNaN(d) ? '–:–' : d.toLocaleTimeString('vi-VN', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: false          // 24 giờ: 07:30, 22:15…
    //       });

    //       return `<button type="button" class="showtime-btn" data-id="${st.ShowTimeID}"> ${hour} </button>`;
    //     }).join('');

    // cont.innerHTML = shows.map(s =>
    //   `<button type="button" class="showtime-btn" data-id="${s.ShowTimeID}">
    //      ${new Date(s.ThoiGianBatDau)
    //     .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    //    </button>`
    // ).join('');

    // document.querySelectorAll('.showtime-btn').forEach(btn => {
    //   btn.addEventListener('click', () => {
    //     // highlight
    //     document.querySelectorAll('.showtime-btn.active')
    //       .forEach(b => b.classList.remove('active'));
    //     btn.classList.add('active');
    //     // lưu lại ID và push vào form
    //     selectedShowtimeId = btn.dataset.id;
    //     document.getElementById('form-showtime-id').value = selectedShowtimeId;
    //   });
    // });

    initShowtimeButtons();
    // cont.firstElementChild?.click();
    document.querySelector('#showtimes-container .showtime-btn')?.click();
  } catch (err) {
    console.error('loadShowtimes error:', err);
    alert('Không tải được suất chiếu, vui lòng thử lại sau.');
  }
}

// function initShowtimeButtons() {
//   document.querySelectorAll('.showtime-btn').forEach(btn => {
//     btn.addEventListener('click', () => {
//       document.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('selected'));
//       document.getElementById('form-date').value = document.querySelector('.date-tabs li.active').dataset.date;
//       btn.classList.add('selected');
//       document.getElementById('showtime_id').value = btn.dataset.id;
//       // document.getElementById('booking-time').innerText = btn.textContent;
//       document.getElementById('booking-time').textContent = btn.textContent.trim();
//       loadSeatMap(btn.dataset.id);
//     });
//   });
// }

function initShowtimeButtons() {
  document.querySelectorAll('.showtime-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // 1) In log để kiểm tra sự kiện có chạy không
      console.log('▶ Chọn giờ: ', btn.textContent.trim());
      // 2) Cập nhật text xuống thẻ <span id="booking-time">
      const timeEl = document.getElementById('booking-time');
      console.log('   → trước:', timeEl.textContent);
      timeEl.textContent = btn.textContent.trim();
      console.log('   → sau:', timeEl.textContent);
      // 3) Highlight nút vừa chọn
      document.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // 4) Lưu showtime_id và load sơ đồ ghế
      document.getElementById('showtime_id').value = btn.dataset.id;
      loadSeatMap(btn.dataset.id);
    });
  });
}

// function loadSeatMap(id) {
//   fetch(`/api/get_booked_seats?showtime_id=${id}`)
//     .then(r => r.json())
//     .then(booked => {
//       const map = document.getElementById('seat-map');
//       map.innerHTML = '';
//       const total = 50, perRow = 10;
//       for (let r = 1; r <= Math.ceil(total / perRow); r++) {
//         const row = document.createElement('div');
//         row.className = 'seat-row';
//         for (let c = 1; c <= perRow; c++) {
//           const num = (r - 1) * perRow + c;
//           const btn = document.createElement('button');
//           btn.textContent = num;
//           if (booked.includes(num)) btn.disabled = true, btn.className = 'seat free'; // btn.className = 'booked';
//           else btn.className = 'free', btn.addEventListener('click', () => toggleSeat(btn, num));
//           row.appendChild(btn);
//         }
//         map.appendChild(row);
//       }
//       updateTotal();
//     });
// }

function toggleSeat(btn, num) {
  btn.classList.toggle('selected');
  updateSelectedSeats();
  selectedSeats = Array.from(
      document.querySelectorAll('#seat-map .selected')
  ).map(el => el.dataset.seatId);
  document.querySelector('input[name="seats"]').value = selectedSeats.join(',');
  const total = selectedSeats.length * TICKET_PRICE;
  document.getElementById('total_price').innerText = total.toLocaleString();
}

// function updateSelectedSeats() {
//   const sels = [...document.querySelectorAll('#seat-map .selected')].map(b => b.textContent);
//   document.getElementById('ghe_ngoi').value = sels.join(',');
//   document.getElementById('so_luong').value = sels.length || 1;
//   updateTotal();
//   updateSelectedSeats();
// }

// function updateTotal() {
//   const price = 200000;
//   const qty = +document.getElementById('so_luong').value;
//   document.getElementById('total_price').textContent = (qty * price).toLocaleString();
// }

function updateTotal() {
  const qty = +document.getElementById('so_luong').value;
  // Lấy giá thật của phim (API trả về window.currentMovie.GiaVe)
  const price = Number(window.currentMovie?.GiaVe) || TICKET_PRICE;
  document.getElementById('total_price').textContent = (qty * price).toLocaleString('vi-VN') + ' đ';
}

document.addEventListener("DOMContentLoaded", async () => {


  // A. Chống BFCache (Khi bấm nút Back trên trình duyệt, ép trang phải tải lại từ Server)
  window.addEventListener("pageshow", function (event) {
    if (event.persisted || (typeof performance !== "undefined" && performance.navigation.type === 2)) {
      window.location.reload();
    }
  });

// B. Tự động kiểm tra trạng thái Đăng nhập để render nút Đăng Nhập / Đăng Xuất phù hợp
  async function checkAuthStatus() {
    const navAuth = document.querySelector(".nav-auth");
    if (!navAuth) return;

    try {
      // Gọi API kiểm tra session phía Server (Cần đảm bảo backend có endpoint check auth)
      const res = await fetch('/api/check-auth');
      if (res.ok) {
        const data = await res.json();
        if (data.isLoggedIn) {
          navAuth.innerHTML = `
                    <a href="/History/LichSuDatVeNguoiDung.html" class="btn-history-pill">
                        <i class="fas fa-clock-rotate-left"></i> Lịch Sử
                    </a>
                    <a href="/logout" class="btn-login-pill">Đăng Xuất</a>
                `;
        } else {
          navAuth.innerHTML = `<a href="/Login/login.html" class="btn-login-pill">Đăng Nhập</a>`;
        }
      } else {
        navAuth.innerHTML = `<a href="/Login/login.html" class="btn-login-pill">Đăng Nhập</a>`;
      }
    } catch (e) {
      // Mặc định hiện nút Đăng nhập nếu không gọi được API
      navAuth.innerHTML = `<a href="/Login/login.html" class="btn-login-pill">Đăng Nhập</a>`;
    }
  }

// Gọi hàm kiểm tra ngay khi load trang
  checkAuthStatus();
  // Dark Mode Toggle
  function initTheme() {
    // Kiểm tra xem người dùng đã chọn theme chưa
    const savedTheme = localStorage.getItem("theme");

    // Nếu đã chọn, áp dụng theme đó
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      if (savedTheme === "dark") {
        document.getElementById("theme-toggle").checked = true;
      }
    } else {
      // Nếu chưa chọn, kiểm tra preference của hệ thống
      const prefersDarkScheme = window.matchMedia(
          "(prefers-color-scheme: dark)"
      );
      if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("theme-toggle").checked = true;
        localStorage.setItem("theme", "dark");
      }
    }
  }

  // Thêm event listener cho toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("change", function () {
      if (this.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // selectedDate = li.dataset.date;
  // document.getElementById('booking-date').innerText = li.textContent;
  // document.getElementById('form-date').value = selectedDate;

  // Khởi tạo theme khi trang được load
  if (document.getElementById("theme-toggle")) {
    initTheme();
  }
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const menu = document.querySelector(".menu");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function () {
      this.classList.toggle("active");
      menu.classList.toggle("active");
    });
  }

  // Testimonial Slider
  const testimonialSlides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  let currentSlide = 0;

  function showSlide(n) {
    testimonialSlides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    currentSlide = (n + testimonialSlides.length) % testimonialSlides.length;

    testimonialSlides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  // Auto slide testimonials
  let testimonialInterval;

  function startTestimonialInterval() {
    testimonialInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4000);
  }

  if (testimonialSlides.length > 0) {
    startTestimonialInterval();

    // Pause interval on hover
    const testimonialSlider = document.querySelector(".testimonial-slider");
    if (testimonialSlider) {
      testimonialSlider.addEventListener("mouseenter", () => {
        clearInterval(testimonialInterval);
      });

      testimonialSlider.addEventListener("mouseleave", () => {
        startTestimonialInterval();
      });
    }
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all items
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("active");
        const toggle = faqItem.querySelector(".faq-toggle i");
        toggle.className = "fas fa-plus";
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active");
        const toggle = item.querySelector(".faq-toggle i");
        toggle.className = "fas fa-minus";
      }
    });
  });

  // Products Page
  const productsContainer = document.getElementById("productsContainer");
  const filterBtns = document.querySelectorAll(".filter-btn");

  const products = [];
  // Product data
  // const products = [
  //   {
  //     id: 1,
  //     name: "28 NĂM SAU: HẬU TẬN THẾ",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/28 Năm Sau Hậu Tận Thế/28NamSauHauTanThe.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 18+",
  //     intro: `Cơn ác mộng chưa kết thúc. Virus trở lại, kéo theo bóng tối bao trùm nước Anh. Một hành trình sinh tử: cậu bé tìm kiếm bác sĩ để cứu mẹ mình, băng qua vùng đất chết chóc đầy xác sống tiến hóa và những kẻ nguy hiểm ẩn sau gương mặt tử tế. Liệu niềm hy vọng cuối cùng có đủ để cứu họ khỏi vực thẳm tuyệt vọng?`,
  //     features: [
  //       "Đạo diễn: Danny Boyle",
  //       "Diễn viên: Aaron Taylor-Johnson, Ralph Fiennes, Jodie Comer, Cillian Murphy",
  //       "Thể loại: Hồi hộp, Kinh Dị",
  //       "Khởi chiếu: 20/06/2025",
  //       "Thời lượng: 114 phút",
  //       "Ngôn ngữ: Tiếng Anh - Phụ đề Tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/28 Năm Sau Hậu Tận Thế/videoplayback.mp4" },
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: "BÍ KÍP LUYỆN RỒNG",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Bí Kíp Luyện Rồng/BiKipLuyenRong.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 16+",
  //     intro: `Câu chuyện về một chàng trai trẻ với ước mơ trở thành thợ săn rồng, nhưng định mệnh lại đưa đẩy anh đến tình bạn bất ngờ với một chú rồng.`,
  //     features: [
  //       "Đạo diễn: Dean DeBlois",
  //       "Diễn viên: Mason Thames, Nico Parker, Gerard Butler",
  //       "Thể loại: Hài, Hành Động, Phiêu Lưu, Thần thoại",
  //       "Khởi chiếu: 13/06/2025",
  //       "Thời lượng: 126 phút",
  //       "Ngôn ngữ: Tiếng Anh - Phụ đề Tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/Bí Kíp Luyện Rồng/videoplayback.mp4" },
  //     ]
  //   },
  //   {
  //     id: 3,
  //     name: "BỘ 5 SIÊU ĐẲNG CẤP",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/BỘ 5 SIÊU ĐẲNG CẤP/Bo5SieuDangCap.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 16+",
  //     intro: `Siêu Hài, Siêu Lòng, Siêu Hài Lòng HI.FIVE – bộ phim bom tấn siêu anh hùng châu Á, pha trộn hành động mãn nhãn và tiếng cười bùng nổ. Năm người bình thường bỗng dưng "trúng số" — bất ngờ sở hữu siêu năng lực bá đạo sau một ca ghép tạng... kỳ quặc! Bị đời đẩy đưa trở thành siêu anh hùng bất đắc dĩ, họ vừa "gánh team" cứu thế giới, phải học cách dùng năng lực đúng lúc để không phá banh mọi thứ xung quanh. Khi định mệnh ép bạn lên level – bạn có dám bung skill tới bến?`,
  //     features: [
  //       "Đạo Diễn: Kang Hyung Cheol",
  //       "Diễn Viên: Yoo Ah In, Ahn Jae Hong, Park Jin Young, Ra Mi Ran",
  //       "Thể Loại: Hài, Hành Động, Thần thoại",
  //       "Khởi Chiếu: 13/06/2025",
  //       "Thời Lượng: 119 phút",
  //       "Ngôn Ngữ: Tiếng Hàn – Phụ đề Tiếng Việt và Lồng Tiếng"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/BỘ 5 SIÊU ĐẲNG CẤP/videolayback.mp4" },
  //     ]
  //   },
  //   {
  //     id: 4,
  //     name: "Bóng ma cõi mạng",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Bóng ma cõi mạng/Bongmacoimang.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 16+",
  //     intro: `Trong nỗ lực cứu vãn kênh Youtube tâm huyết, Jyujuring quyết định tổ chức livestream ngay tại một ngôi nhà hoang bí ẩn, nơi mà chưa ai từng dám đặt chân đến. Giây phút cánh cửa mở ra cũng là lúc trò "câu view" hóa thành cơn ác mộng tồi tệ nhất cho những kẻ phạm phải điều cấm kỵ.`,
  //     features: [
  //       "Đạo Diễn:   Vince Kim",
  //       "Diễn Viên: Oh Ha-nee; Go I-gyoung; Joseph Kim",
  //       "Thể Loại: Kinh Dị",
  //       "Khởi Chiếu: 20/06/2025",
  //       "Thời Lượng: 91 phút",
  //       "Ngôn Ngữ: Tiếng Hàn - Phụ đề tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/Bóng ma cõi mạng/videolayback.mp4" },
  //     ]
  //   },
  //   {
  //     id: 5,
  //     name: "DƯỚI ĐÁY HỒ",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Dưới Đáy Hồ/DuoiDayHo.png",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 18+",
  //     intro: `Tú liên tục rơi vào vòng xoáy kỳ lạ khi những người cô quen biết dường như đã trở thành một người khác. Tình cờ một thế giới bí ẩn nằm sâu dưới đáy hồ mở ra, nơi bản sao tà ác của con người được hình thành và nuôi dưỡng bởi chấp niệm chưa được hóa giải của chính họ. Bản sao của Tú nổi dậy, khát khao điên cuồng để thay thế cô. Tú sẽ làm gì để chiến thắng bản sao của mình?`,
  //     features: [
  //       "Đạo Diễn:  Trần Hữu Tấn",
  //       "Diễn Viên: Karen Nguyễn, Kay Trần, Thanh Duy, Nguyên Thảo, Lâm Hoàng Oanh, Mạc Trung Kiên, Nguyễn Hữu Tiến,...",
  //       "Thể Loại: Kinh Dị",
  //       "Khởi Chiếu: 06/06/2025",
  //       "Thời Lượng: 98 phút",
  //       "Ngôn Ngữ: Tiếng Việt - Phụ đề Tiếng Anh"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/DƯỚI ĐÁY HỒ/videolayback.mp4" },
  //     ]
  //   },
  //   {
  //     id: 6,
  //     name: "NOBITA VÀ CUỘC PHIÊU LƯU VÀO THẾ GIỚI TRONG TRANH",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Doraemon Nobita Và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh/Doraemon.jpg",
  //     category: ["KhongGioiHan", "DangChieu"],
  //     description: "Độ tuổi: Mọi lứa tuổi",
  //     intro: "Thông qua món bảo bối mới của Doraemon, cả nhóm bạn bước thế giới trong một bức tranh nổi tiếng và bắt gặp cô bạn bí ẩn tên Claire. Với lời mời của Claire, cả nhóm cùng đến thăm vương quốc Artoria, nơi ẩn giấu một viên ngọc quý mang tên Artoria Blue đang ngủ yên. Trên hành trình tìm kiếm viên ngọc, nhóm bạn Doraemon phát hiện một truyền thuyết về sự hủy diệt của thế giới, mà truyền thuyết đó dường như đang sống dậy! Liệu cả nhóm có thể phá hủy lời nguyền này và bảo vệ cả thế giới?",
  //     features: ["Đạo Diễn: Yukiyo Teramoto",
  //       "Diễn Viên: Wasabi Mizuta, Megumi Ôhara, Yumi Kakazu, Subaru Kimura, Tomokazu Seki,...",
  //       "Thể Loại: Hoạt Hình, Phiêu Lưu",
  //       "Khởi Chiếu: 23/05/2025",
  //       "Thời Lượng: 105 phút",
  //       "Ngôn Ngữ:  Tiếng Nhật – phụ đề Tiếng Việt; Lồng tiếng"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/NOBITA VÀ CUỘC PHIÊU LƯU VÀO THẾ GIỚI TRONG TRANH/videolayback.mp4" },
  //     ]
  //   },


  //   {
  //     id: 7,
  //     name: "ELIO - CẬU BÉ ĐẾN TỪ TRÁI ĐẤT",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Elio Cậu Bé Đến Từ Trái Đất/Elio.png",
  //     category: ["DangChieu", "KhongGioiHan"],
  //     description: "Độ tuổi: Mọi lứa tuổi",
  //     intro: "Điều gì sẽ xảy ra nếu chính thứ bạn đang tìm kiếm lại tìm đến bạn trước? Trong cuộc phiêu lưu dở khóc dở cười trên màn ảnh rộng của Pixar, Elio – cậu bé mê mẩn người ngoài hành tinh – bất ngờ bị cuốn vào Liên Hiệp Thiên Hà, một vũ trụ liên hành tinh đầy kỳ diệu, nơi quy tụ các loài sinh vật thông minh khắp thiên hà. Trớ trêu thay, Elio lại bị hiểu nhầm là người đứng đầu Trái Đất. Giờ đây, cậu phải vượt qua những rắc rối mang quy mô vũ trụ, kết nối với những người bạn không ngờ tới, và tìm cách biến giấc mơ lớn nhất đời mình thành hiện thực.",
  //     features: [
  //       "Đạo Diễn: Adrian Molina, Madeline Sharafian, Domee Shi",
  //       "Diễn Viên: Yonas Kibreab, Zoe Saldaña, Brad Garrett",
  //       "Thể Loại: Hoạt Hình, Phiêu Lưu",
  //       "Khởi Chiếu: 27/06/2025",
  //       "Thời Lượng: 97 phút",
  //       "Ngôn Ngữ:  Tiếng Anh với phụ đề tiếng Việt; Lồng tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/ELIO - CẬU BÉ ĐẾN TỪ TRÁI ĐẤT/videolayback.mp4" },
  //     ]
  //   },


  //   {
  //     id: 8,
  //     name: "MA KHÔNG ĐẦU",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Ma không đầu/MaKhongDau.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 18+",
  //     intro: "Hai nhân viên nhà xác Tiến và Thành bất ngờ bị cuốn vào câu chuyện tìm đầu cho ma. Cả hai bất đắc dĩ phải đi phá án, điều tra, đối đầu với nhiều hiện tượng lạ xảy ra xung quanh. Người thường đối diện với cái job quá là thách thức của Ma Không Đầu, liệu họ có chạy kịp KPI tìm lại cái đầu bị mất? Chưa dừng lại ở đó, chính từ câu chuyện của Ma Không Đầu rợn người này lại dẫn đến một bí mật kinh khủng khác, khiến người xem đôi môi chia ly mà cặp chân mày thì skinship…",
  //     features: [
  //       "Đạo Diễn:  Bùi Văn Hải",
  //       "Diễn Viên: Tiến Luật; Ngô Kiến Huy; NSND Hồng Vân; NSƯT Hữu Châu; NSƯT Đại Nghĩa, Thanh Hương, Hoàng Mèo, Nghệ sĩ Phi Phụng, Phan Vũ.",
  //       "Thể Loại: Hài, Kinh Dị",
  //       "Khởi Chiếu: 27/06/2025",
  //       "Thời Lượng: 115 phút",
  //       "Ngôn Ngữ: Tiếng Việt - Phụ đề Tiếng Anh"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/ELIO - MA KHÔNG ĐẦU/videolayback.mp4" },
  //     ]
  //   },


  //   {
  //     id: 9,
  //     name: "ÚT LAN: OÁN LINH GIỮ CỦA",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/ÚT LAN/UTLAN.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 18+",
  //     intro: "Sau sự ra đi của cha, Lan (Phương Thanh) về một vùng quê và ở đợ cho nhà ông Danh (Mạc Văn Khoa) - một người đàn ông góa vợ, không con cái. Ngay sau khi bước chân vào căn nhà, Lan phải đối mặt với hàng loạt hiện tượng kỳ dị và những cái chết bí ẩn liên tục xảy ra. Cùng với Sơn (Quốc Trường) - một nhà văn chuyên viết truyện kinh dị, Lan bắt đầu lật mở những bí mật kinh hoàng, khám phá lịch sử đen tối của căn nhà.",
  //     features: [
  //       "Đạo Diễn:  Trần Trọng Dần",
  //       "Diễn Viên: Quốc Trường, Mạc Văn Khoa,...",
  //       "Thể Loại: Kinh Dị",
  //       "Khởi Chiếu:  20/06/2025",
  //       "Thời Lượng: 111 phút",
  //       "Ngôn Ngữ: Tiếng Việt và phụ đề tiếng Anh"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/ÚT LAN/videolayback.mp4" },
  //     ]
  //   },

  //   {
  //     id: 10,
  //     name: "QUỶ RẠCH MẶT",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/QUỶ RẠCH MẶT/QUYRACHMAT.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 16+",
  //     intro: "May quyết định chuyển về căn nhà ngoại ô cùng với bạn trai, Gun. Ở đây, May bất ngờ nhận được tin dữ, mẹ kế của cô, bà Po đã qua đời, bị nghi là sát hại. May dang tay cưu mang người em gái, Noon, thế nhưng nào ngờ cô ã dẫn quỷ về nhà. Liên tục trải qua những cú sốc, May hầu như không còn tin vào chính mình khi thực thể tà ác đang muốn nuốt chửng cô và gia đình. Liệu cái kết nào sẽ giành cho những bi kịch đẫm máu tiếp theo?",
  //     features: ["Đạo Diễn:  Sueb Boonsong Nakphoo",
  //       "Diễn Viên: Kwan Usamanee Vaithayanon, Topz Nathanon Narathanyawirun, Tong Archariya Sritha, Yasaka Chaisorn",
  //       "Thể Loại: Kinh Dị",
  //       "Khởi Chiếu:  13/06/2025",
  //       "Thời Lượng: 89phút",
  //       "Ngôn Ngữ: Tiếng Thái - Phụ đề tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/QUỶ RẠCH MẶT/videolayback.mp4" },
  //     ]
  //   },

  //   {
  //     id: 11,
  //     name: "TRON: ARES",
  //     price: "Sắp chiếu",
  //     image: "PRO230/Phim/TRON ARES/tron_ares.jpg",
  //     category: ["SapChieu"],
  //     description: "Độ tuổi: Mọi lứa tuổi",
  //     intro: " ",
  //     features: [
  //       "Đạo Diễn:  Joachim Rønning",
  //       "Diễn Viên: Gillian Anderson, Jeff Bridges, Jared Leto",
  //       "Thể Loại: Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu",
  //       "Khởi Chiếu:  10/10/2025",
  //       "Thời Lượng: None",
  //       "Ngôn Ngữ: Tiếng Anh - Phụ đề Tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/TRON ARES/TRON： ARES trailer -  DKKC： tháng 10.2025.mp4" },
  //     ]
  //   },

  //   {
  //     id: 12,
  //     name: "PHI VỤ ĐỘNG TRỜI 2",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Phi Vụ Động Trời 2/PhiVuDongTroi2.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: Mọi lứa tuổi",
  //     intro: "ZOOTOPIA 2 trở lại sau 9 năm Đu OTP Nick & Judy",
  //     features: [
  //       "Đạo Diễn:  Jared Bush, Byron Howard",
  //       "Diễn Viên: Jason Bateman, Quinta Brunson, Fortune Feimster",
  //       "Thể Loại: Gia đình, Hành Động, Phiêu Lưu, Thần thoại",
  //       "Khởi Chiếu:  28/11/2025",
  //       "Thời Lượng: None",
  //       "Ngôn Ngữ: None"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/Phi Vụ Động Trời 2/PHI VỤ ĐỘNG TRỜI 2 (ZOOTOPIA 2) - Dự kiến khởi chiếu 28.11.2025.mp4" },
  //     ]
  //   },

  //   {
  //     id: 13,
  //     name: "MƯỢN RƯỢU ĐẨY KÈO",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Mượn Rượu Đẩy Kèo/Muon_Ruou_Day_Keo.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 18+",
  //     intro: " ",
  //     features: [
  //       "Đạo Diễn:  Choi Yoon-jin",
  //       "Diễn Viên: Yoo Hai-jin, Lee Je-hoon, Son Hyun-joo, Choi Young-jun, Byron Mann",
  //       "Thể Loại: Kịch tính, Tâm Lý",
  //       "Khởi Chiếu:  27/06/2025",
  //       "Thời Lượng: 104 phút",
  //       "Ngôn Ngữ: Tiếng Hàn - Phụ đề tiếng Việt, lồng tiếng Việt"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/Mượn Rượu Đẩy Kèo/videoplayback.mp4" },
  //     ]
  //   },

  //   {
  //     id: 14,
  //     name: "HALABALA: RỪNG MA TẾ XÁC",
  //     price: "200.000đ",
  //     image: "PRO230/Phim/Halabala Rừng Ma Tế Xác/Halabala.jpg",
  //     category: ["DangChieu"],
  //     description: "Độ tuổi: 18+",
  //     intro: "Thanh tra Dan – kẻ mang biệt danh rùng rợn “Dan Trăm Xác” – là một cảnh sát liều mạng, nổi tiếng với quá khứ đẫm máu và những phi vụ bất chấp luật lệ. Sau một sai lầm kinh hoàng trong lúc thực hiện nhiệm vụ, Dan bị giáng chức và chuyển công tác về vùng hẻo lánh. Với nổ lực để có cơ hội trở lại Bangkok – anh cần bắt được Tup Ta Fai: tên trùm tội phạm loạn trí vừa trốn khỏi ngục, hiện đang ẩn náu trong khu rừng cấm Halabala. Thế nhưng, Halabala không phải một khu rừng bình thường. Nơi đây bị nguyền rủa bởi truyền thuyết quỷ Bataya và Batow – tộc người ăn thịt từng sống trong rừng sâu và đang nuôi dưỡng con quỷ Bataya bằng hận thù và xác người. Trong cuộc truy đuổi đẫm máu giữa rừng thiêng, Dan không chỉ phải đối đầu với Ta Fai, mà còn bị ám ảnh bởi những tiếng gọi ma quái, những ám ảnh dị dạng và nỗi sợ sâu kín nhất của chính anh. Khi vợ anh – Vi – đang mang thai sắp sinh và lạc giữa rừng, Dan buộc phải chọn: công lý… hay sự an toàn của gia đình mình? Halabala không chỉ là cuộc săn đuổi, mà là hành trình trượt dài vào vực thẳm của tâm trí – nơi ranh giới giữa con người và quỷ dữ trở nên mờ dần...",
  //     features: [
  //       "Đạo Diễn:  Eakasit Thairaat",
  //       "Diễn Viên: Chantavit Dhanasevi, Nuttanicha Dungwattanawanich, Anon Saisangchan, Yasaka Chaisorn",
  //       "Thể Loại: Kinh dị",
  //       "Khởi Chiếu:  27/06/2025",
  //       "Thời Lượng: 90 phút",
  //       "Ngôn Ngữ: Tiếng Thái - Phụ đề Tiếng Việt và Tiếng Anh"
  //     ],
  //     meta: {
  //     },
  //     nutrition: [
  //       { videoSrc: "PRO230/Phim/Halabala Rừng Ma Tế Xác/videoplayback.mp4" },
  //     ]
  //   },
  // ];


  // Display products
  // function displayProducts(items) {
  //   if (!productsContainer) return;

  //   productsContainer.innerHTML = "";

  //   items.forEach((product) => {
  //     const productElement = document.createElement("div");
  //     productElement.classList.add("product-card");
  //     productElement.setAttribute("data-aos", "fade-up");
  //     productElement.setAttribute("data-category", product.category.join(" "));

  //     productElement.innerHTML = `
  //               <div class="product-image">
  //                   <img src="${product.image}" alt="${product.name}">
  //               </div>
  //               <div class="product-info">
  //                   <h3>${product.name}</h3>
  //                   <p class="price">${product.price}</p>
  //                   <p class="description">${product.description}</p>
  //                   <a href="/ChiTietSanPham.html?movieId=${product.id}" class="btn-secondary">Xem Chi Tiết</a>
  //               </div>
  //           `;

  //     productsContainer.appendChild(productElement);
  //   });

  //   observeVisibleCards();
  // }

  function displayProducts(items) {
    const productsContainer = document.getElementById("productsContainer") || document.getElementById("homeProductsGrid");
    if (!productsContainer) return;

    productsContainer.innerHTML = "";

    items.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product-card");
      productElement.setAttribute("data-aos", "fade-up");
      productElement.setAttribute("data-category", product.category.join(" "));

      productElement.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">${product.price}</p>
                    <p class="description">${product.description}</p>
                    <a href="/ChiTietSanPham.html?movieId=${product.id}" class="btn-secondary">Xem Chi Tiết</a>
                </div>
            `;

      productsContainer.appendChild(productElement);
    });

    observeVisibleCards();
  }

  async function fetchMovies() {
    try {
      const res = await fetch('/api/movies');
      const list = await res.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      products.length = 0;
      list.forEach(m => {
        const cats = [];
        if (m.NgayChieu) {
          // const premiere = new Date(m.NgayChieu);
          const [dd, mm, yyyy] = m.NgayChieu.split('/');
          const premiere = new Date(`${yyyy}-${mm}-${dd}`);
          premiere.setHours(0, 0, 0, 0);

          cats.push(premiere <= today ? 'DangChieu' : 'SapChieu');
        } else {
          cats.push('SapChieu');  // hoặc không push gì
        }
        if (parseInt(m.DoTuoi, 10) === 0) cats.push('KhongGioiHan');

        products.push({
          id: m.MovieID,
          name: m.TieuDe,
          price: (+m.GiaVe).toLocaleString('vi-VN') + 'đ',
          image: m.PosterUrl || '/api/placeholder?width=300',
          description: '<b>Độ tuổi:</b> ' + (m.DoTuoi || '—'),
          features: [
            `Đạo diễn: ${m.DaoDien}`,
            `Diễn viên: ${m.DienVien}`,
            `Thể loại: ${m.TheLoai}`,
            `Thời lượng: ${m.ThoiLuong} phút`,
            `Ngôn ngữ: ${m.NgonNgu}`
          ],
          category: cats
        });
      });
    } catch (e) {
      console.error('fetchMovies lỗi:', e);
    }
  }

  await fetchMovies();
  // Filter products
  displayProducts(products);
  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.getAttribute("data-filter");

        if (filter === "all") {
          displayProducts(products);
        } else {
          //   const filteredProducts = currentMovie.filter(product => {
          //   // nếu category là chuỗi, biến nó thành mảng tạm:
          //   const cats = Array.isArray(currentMovie.category)            //phần bị thay thế bằng .filer
          //     ? currentMovie.category
          //     : [currentMovie.category];
          //   return cats.includes(filter);
          // });
          const filtered = products         // ← 1) phải dùng mảng gốc
              .filter(p => {
                const cats = Array.isArray(p.category) ? p.category : [p.category];
                return cats.includes(filter);  // currentFilter lấy từ UI
              });
          displayProducts(filtered);
        }
      });
    });

  }

  // Product Detail Page
  const productDetail = document.getElementById("productDetail");
  const productDescription = document.getElementById("productDescription");
  const productNutrition = document.getElementById("productNutrition");
  const relatedProducts = document.getElementById("relatedProducts");

  if (productDetail && productDescription && productNutrition && relatedProducts) {
    /* 1. Lấy ID từ URL */
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get("movieId") || params.get("id"));
    /* 2. Tìm sản phẩm */
    currentMovie = products.find(p => p.id === productId);
    const product = currentMovie;

    if (!product) {
      /* --- Không tìm thấy --- */
      productDetail.innerHTML = `
      <div class="product-not-found">
        <h2>Không tìm thấy Video</h2>
        <p>Phim bạn đang tìm không tồn tại hoặc đã bị xoá.</p>
        <a href="/ChiTietSanPham.html" class="btn">Quay lại</a>
      </div>`;
      productDescription.style.display = "none";
      productNutrition.style.display = "none";
      document.querySelector(".related-products").style.display = "none";
      return;
    }

    /* 3. Title & breadcrumb */
    document.title = `${currentMovie.name} - EVL`;
    const productName = document.getElementById("productName");
    if (productName) productName.textContent = currentMovie.name;

    /* 4. Render phần chi tiết */
    productDetail.innerHTML = `
    <div class="product-detail-image">
      <img src="${currentMovie.image}" alt="${currentMovie.name}">
    </div>
    <div class="product-detail-info">
      <h1>${currentMovie.name}</h1>
      <p class="product-detail-price">${currentMovie.price}</p>

      <div class="product-detail-desc">
        <p>${currentMovie.description}</p>
        <ul>${(currentMovie.features || []).filter(f => !!f).map(f => `<li>${f}</li>`).join('')}</ul>
      </div>

      <div class="product-detail-meta">
        ${Object.entries(currentMovie.meta || {}).map(([k, v]) => `
            <div class="meta-item">
              <span class="meta-label">${k}:</span>
              <span>${v}</span>
            </div>`
    ).join("")}
      </div>

      <div class="contact-buttons">
        <a href="tel:0911404053" class="btn-phone">
          <i class="fas fa-phone-alt"></i> Liên hệ: 0911404053
        </a>

        <a href="https://zalo.me/0911404053" class="btn-zalo" target="_blank">
          <i class="fas fa-comment"></i> Zalo
        </a>

        <button id="bookOnlineBtn" class="btn-pay">Đặt vé</button>
      </div>
    </div>
  `;
    attachBookingEvents();

    /* 6. Trailer video */
    const hasYoutube = !!currentMovie.trailerUrl;
    const fallbackSrc = currentMovie.nutrition?.[0]?.videoSrc;
    productNutrition.innerHTML = hasYoutube
        ? `…iframe…`
        : fallbackSrc
            ? `
      <h2>Trailer</h2>
      <div class="video-container">
        <video controls playsinline>
          <source src="${fallbackSrc}" type="video/mp4">
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      </div>`
            : `<p>Chưa có trailer.</p>`;
    // ? `
    // <h2>Trailer</h2>
    // <div class="video-container">
    //   <iframe
    //     src="${currentMovie.trailerUrl}"
    //     title="Trailer ${currentMovie.name}"
    //     frameborder="0"
    //     allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    //     allowfullscreen>
    //   </iframe>
    // </div>`
    // : `
    // <h2>Trailer</h2>
    // <div class="video-container">
    //   <video controls playsinline>
    //     <source src="${currentMovie.nutrition[0].videoSrc}" type="video/mp4">
    //     Trình duyệt của bạn không hỗ trợ thẻ video.
    //   </video>
    // </div>`;

    /* 7. Sản phẩm liên quan */
    const related = products
        .filter(p => p.category === currentMovie.category && p.id !== currentMovie.id)
        .slice(0, 4);

    related.forEach(rp => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
      <div class="product-image">
        <img src="${rp.image}" alt="${rp.name}">
      </div>
      <div class="product-info">
        <h3>${rp.name}</h3>
        <p class="price">${rp.price}</p>
        <a href="/ChiTietSanPham.html?movieId=${rp.id}" class="btn-secondary">Xem Chi Tiết</a>
      </div>`;
      relatedProducts.appendChild(card);
    });
  }
});


//thong tin san pham noi bat
document.addEventListener('DOMContentLoaded', function () {
  const options = { threshold: 0.1 };
  const callback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(callback, options);
  const textEl = document.querySelector('.SanPhamNoiBat-text');
  if (textEl) observer.observe(textEl);

  const imgEl = document.querySelector('.SanPhamNoiBat-image');
  if (imgEl) observer.observe(imgEl);
});

// fade hien thi san pham
let cardObserver = null;

function initCardObserver() {
  if (cardObserver) return cardObserver;     // đã tạo thì dùng lại
  cardObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Tính thứ tự card trong DOM
        const idx = [...document.querySelectorAll('.product-card')].indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.05}s`;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);         // bỏ quan sát
      }
    });
  }, { threshold: 0.05 });
  return cardObserver;
}

/* =========  OBSERVER CHO CÁC CARD MỚI ========= */
function observeVisibleCards() {
  const obs = initCardObserver();
  document.querySelectorAll('.product-card').forEach(card => {
    if (!card.classList.contains('visible')) obs.observe(card);
  });
}

/* ========= HOME PAGE ========= */
document.addEventListener('DOMContentLoaded', () => {
  // Nếu trang hiện tại có featured-products (home) thì run ngay
  if (document.querySelector('.featured-products')) {
    observeVisibleCards();
  }
});


/*Trang quản lý*/
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
if (adminBtn && adminModal) {
  const closeAdmin = document.querySelector('.close-admin');
  const exitBtn = document.getElementById('adminExitBtn');
  const loginBtn = document.getElementById('adminLoginBtn');
  const codeInput = document.getElementById('adminCodeInput');

  // Mở modal khi click nút Quản lý
  adminBtn.addEventListener('click', () => {
    adminModal.classList.add('show');
    codeInput.value = '';
  });

  // Đóng modal
  closeAdmin.addEventListener('click', () => adminModal.style.display = 'none');
  exitBtn.addEventListener('click', () => adminModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === adminModal) adminModal.style.display = 'none';
  });

  // Xử lý Đăng nhập
  loginBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (!code) {
      return alert('Thông tin mã quản lý không được để trống!');
    }
    if (code !== 'EVL123') {  // thay 'ADMIN123' bằng mã thật của bạn
      return alert('Mã của bạn không hợp lệ');
    }
    // thành công → điều hướng
    window.location.href = '/Admin/QuanLyPhim.html';
  });
}

//Kết nối dữ liệu
// document.addEventListener('DOMContentLoaded', () => {
//   const bookBtn = document.getElementById('bookOnlineBtn');
//   if (!bookBtn) return;
//   const modal = document.getElementById('bookingModal');
//   const closeBtn = document.getElementById('bookingClose');
//   const qtyInput = document.getElementById('so_luong');
//   qtyInput.value = 0;

//   function pickFeature(label) {
//     const line = (currentMovie.features || []).find(f => f.toLowerCase().startsWith(label.toLowerCase()));
//     return line ? line.split(':').slice(1).join(':').trim() : '—';
//   }

//   // 1) Khi click "Đặt vé" → load showtimes rồi show modal
//   bookBtn.addEventListener('click', async () => {
//     const movieId = new URLSearchParams(window.location.search).get('movieId');
//     const allShows = await fetch(`/api/showtimes?movieId=${movieId}`).then(r => r.json());
//     const shows = Array.isArray(allShows) ? allShows : Array.isArray(allShows.data) ? allShows.data : Object.values(allShows || {});
//     initDateTabs(shows, movieId);
//     if (!movieId) return alert('Không tìm thấy movieId');
//     await loadShowtimes(movieId);
//     modal.style.display = 'flex';
//     const { Thể_loại = '—', Ngôn_ngữ = '—' } = currentMovie.features || {};
//     document.getElementById('booking-form').style.display = 'block';
//     document.getElementById('qrContainer').style.display = 'none';
//     document.getElementById('modalPoster').src = currentMovie.image;
//     document.getElementById('modalTitle').textContent = currentMovie.name;
//     document.getElementById('modalGenre').textContent = pickFeature('Thể Loại');
//     document.getElementById('modalLang').textContent = pickFeature('Ngôn Ngữ');
//     modal.style.display = 'flex';
//   });

//   // 2) Đóng modal
//   closeBtn.addEventListener('click', () => {
//     modal.style.display = 'none';
//   });

//   // 3) Xác nhận thanh toán → gọi API book.php
//   const payBtn = document.getElementById('confirmBooking');
//   payBtn.addEventListener('click', () => {
//     // Chỉ requestSubmit khi thật sự click nút trong modal
//     document.getElementById('booking-form').requestSubmit();
//   });
//   if (!payBtn) console.error('Không tìm thấy nút confirmBooking');

//   // Hàm tạo QR: dùng QRCode.js (include thư viện vào <head>)
//   function generateQRCode(text) {
//     const container = document.getElementById('qrContainer');
//     container.innerHTML = '';
//     new QRCode(container, {
//       text: text,
//       width: 200,
//       height: 200
//     });
//   }
// });

// document.getElementById('booking-form').addEventListener('submit', async e => {
//   e.preventDefault();  // chặn reload

//   const showtimeId = document.getElementById('showtime_id').value;
//   const seats = document.getElementById('ghe_ngoi').value;
//   const qty = Number(document.getElementById('so_luong').value);

//   if (!seats) {
//     return alert('Bạn chưa chọn ghế');
//   }

//   try {
//     const res = await fetch('api/book.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ showtime_id: showtimeId, seats, qty })
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.error || 'Đặt vé thất bại');

//     // ẩn form, show QR
//     document.getElementById('booking-form').style.display = 'none';
//     const qrWrap = document.getElementById('qrContainer');
//     qrWrap.style.display = 'flex';
//     qrWrap.innerHTML = '';
//     new QRCode(qrWrap, {
//       text: JSON.stringify({
//         bookingId: data.bookingId,
//         seats,
//         qty
//       }),
//       width: 200,
//       height: 200
//     });

//   } catch (err) {
//     alert(err.message);
//   }

const form = document.getElementById('booking-form');
if (form) {
  // document.getElementById('booking-form').addEventListener('submit', async e => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    // 1) Lấy dữ liệu
    const showtimeId = document.getElementById('showtime_id').value;
    const seatStr = document.getElementById('ghe_ngoi').value.trim();
    const customer = document.getElementById('customer').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!seatStr) {
      alert('Vui lòng chọn ghế');
      return;
    }
    const seats = seatStr.split(',');
    if (!customer) {
      alert('Vui lòng nhập họ và tên');
      return;
    }
    if (!phone) {
      alert('Vui lòng nhập số điện thoại'); return;
    }
    // if (!email) {
    //   alert('Vui lòng nhập email');
    //   return;
    // }
    // (tuỳ chọn) kiểm tra format email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      alert('Email không hợp lệ');
      return;
    }

    const phonePattern = /^0\d{9}$/;
    if (!phonePattern.test(phone)) {
      alert('Số điện thoại không hợp lệ'); return;
    }

    // 2) Gửi JSON đúng key mà BookingController đọc (showtimeId, seats, customer, phone, email)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId: Number(showtimeId), seats, customer, phone, email })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        return alert('Lỗi dữ liệu từ server, thử lại sau.');
      }

      if (!res.ok || !data.ok) {
        if (data.conflictSeats) {
          return alert('Đặt vé thất bại: ' + data.conflictSeats.join(', ') + ' vừa bị người khác đặt trước.');
        }
        return alert('Đặt vé thất bại: ' + (data.error || 'Không rõ lỗi'));
      }

      // thành công
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('justBooked', '1');
      sessionStorage.setItem('phone', phone);
      alert('Đặt vé thành công! Mã Booking = ' + data.bookingId);
      window.open(`/HoaDon.html?bookingId=${data.bookingId}`, '_blank');
      document.getElementById('booking-form').reset();
      window.location.href = '/History/LichSuDatVeNguoiDung.html';

    } catch (err) {
      console.error('Lỗi mạng hoặc khác:', err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  });
}

/* ===== 1) Khi đã chọn giờ chiếu ===== */
async function loadSeatMap(showtimeId) {
  // 1. Lấy mảng ghế đã bán dạng ["A1","A2",...]
  const booked = await fetch(`/api/bookings?showtimeId=${showtimeId}`).then(r => r.json());

  // 2. Cấu hình sơ đồ (ví dụ 8 hàng x 12 cột)
  const rows = 'ABCDEFGH'.split('');
  const cols = 9;
  const seatMapEl = document.getElementById('seat-map');
  seatMapEl.style.display = 'grid';
  seatMapEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
  seatMapEl.innerHTML = '';             // clear cũ

  rows.forEach(r => {
    for (let c = 1; c <= cols; c++) {
      const id = `${r}${c}`;
      const btn = document.createElement('div');
      btn.textContent = c;
      btn.dataset.seatId = id;
      btn.className = 'seat ' + (booked.includes(id) ? 'booked' : 'free');
      // --- thêm sự kiện chọn ghế ---
      btn.addEventListener('click', () => {
        if (btn.classList.contains('booked')) return;      // không chọn ghế đã bán
        btn.classList.toggle('selected');                   // bật/tắt chọn
        // cập nhật input #ghe_ngoi
        const selected = Array.from(
            document.querySelectorAll('.seat.selected')
        ).map(x => x.dataset.seatId);
        // document.getElementById('selectedSeats').value = selected.join(',');
        document.getElementById('ghe_ngoi').value = selected.join(',');
        updateSelectedSeats();
      });
      seatMapEl.appendChild(btn);
    }
  });

}

/* ===== 2) Click chọn ===== */
// document.getElementById('seat-map').addEventListener('click', e => {
//   const seat = e.target.closest('.seat');
//   if (!seat || seat.classList.contains('booked')) return;

//   seat.classList.toggle('selected');
//   updateSelectedSeats();
// });

function updateSelectedSeats() {
  const sels = Array.from(document.querySelectorAll('#seat-map .selected')).map(s => s.dataset.seatId);
  document.getElementById('ghe_ngoi').value = sels.join(',');
  document.getElementById('so_luong').value = sels.length;
  const price = Number(window.currentMovie?.GiaVe) || TICKET_PRICE;
  const total = sels.length * price;
  document.getElementById('total_price').textContent = total.toLocaleString('vi-VN') + ' đ';
}

async function loadMovieDetails(movieId) {
  const res = await fetch(`/api/movies?movieId=${movieId}`);
  if (!res.ok) throw new Error('Movies API lỗi ' + res.status);
  const movie = await res.json();
  window.currentMovie = movie;

  // Gán mô tả
  document.getElementById('productDescription').innerText = movie.MieuTa;

  // Gán trailer & poster
  const vid = document.getElementById('trailer');
  if (vid) {
    vid.src = movie.Trailer_ID || '/api/placeholder?width=1200&height=800';
    vid.poster = movie.PosterUrl || '/api/placeholder?width=1200&height=800';
  }
}

// document.addEventListener('DOMContentLoaded', () => {
//   if (!document.getElementById('trailer')) return;  // chỉ chạy trên trang detail
//   const movieId = new URLSearchParams(location.search).get('movieId');
//   loadMovieDetails(movieId);
// });

function attachBookingEvents() {
  const bookBtn = document.getElementById('bookOnlineBtn');
  if (!bookBtn) return;

  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('bookingClose');
  const qtyInput = document.getElementById('so_luong');
  qtyInput.value = 0;

  // Hàm tách dòng đặc tính
  function pickFeature(label) {
    const line = (currentMovie.features || []).find(f =>
        f.toLowerCase().startsWith(label.toLowerCase()));
    return line ? line.split(':').slice(1).join(':').trim() : '—';
  }

  // 1) Khi click "Đặt vé"
  bookBtn.addEventListener('click', async () => {
    const movieId = new URLSearchParams(location.search).get('movieId');
    if (!movieId) return alert('Không tìm thấy movieId');

    // Lấy tất cả suất chiếu
    const shows = await fetch(`/api/showtimes?movieId=${movieId}`)
        .then(r => r.json());

    initDateTabs(shows, movieId);       // render các tab ngày
    await loadShowtimes(movieId);       // render suất + ghế mặc định

    // Đổ thông tin phim vào modal
    document.getElementById('modalPoster').src = currentMovie.PosterUrl || '';
    document.getElementById('modalTitle').textContent = currentMovie.TieuDe || '';
    const poster = currentMovie.PosterUrl || currentMovie.image || '/api/placeholder';
    const title = currentMovie.TieuDe || currentMovie.name || '';

    document.getElementById('modalPoster').src = poster;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalGenre').textContent = pickFeature('Thể Loại');
    document.getElementById('modalLang').textContent = pickFeature('Ngôn Ngữ');

    // Hiển thị modal
    modal.style.display = 'flex';
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('qrContainer').style.display = 'none';
  });

  // 2) Đóng modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');

  // 3) Xác nhận thanh toán
  document.getElementById('confirmBooking').addEventListener('click', () => {
    document.getElementById('booking-form').requestSubmit();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const movieId = new URLSearchParams(location.search).get('movieId');
  if (movieId) loadMovieDetails(movieId);
});