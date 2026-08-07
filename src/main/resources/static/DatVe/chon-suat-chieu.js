// // (function () {
// //   const params = new URLSearchParams(window.location.search);
// //   const movieId = params.get('movieId');
// //
// //   let selectedShowtimeId = null;
// //   let selectedTime = '';
// //   let selectedDate = '';
// //   let moviePrice = 200000;
// //
// //   if (!movieId) {
// //     document.querySelector('.flow-page').innerHTML =
// //       '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu movieId. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
// //     return;
// //   }
// //
// //   async function loadMovie() {
// //     const movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
// //     moviePrice = Number(movie.GiaVe) || moviePrice;
// //     document.getElementById('movieBar').innerHTML = `
// //       <img src="${movie.PosterUrl || ''}" alt="${movie.TieuDe || ''}" />
// //       <div>
// //         <h3>${movie.TieuDe || ''}</h3>
// //         <p>${movie.TheLoai || ''} · ${movie.ThoiLuong || '?'} phút</p>
// //       </div>
// //     `;
// //   }
// //
// //   async function loadDates() {
// //     const shows = await fetch(`/api/showtimes?movieId=${movieId}`).then((r) => r.json());
// //     const dates = [...new Set(shows.map((s) => (s.date || s.startTime || s.ThoiGianBatDau || '').substring(0, 10)))].filter(Boolean);
// //
// //     if (dates.length === 0) {
// //       document.getElementById('dateTabs').innerHTML = '<li>Chưa có lịch chiếu</li>';
// //       return;
// //     }
// //
// //     document.getElementById('dateTabs').innerHTML = dates.map((d, i) =>
// //       `<li data-date="${d}" class="${i === 0 ? 'active' : ''}">${d.split('-').reverse().join('/')}</li>`
// //     ).join('');
// //
// //     document.querySelectorAll('#dateTabs li[data-date]').forEach((li) => {
// //       li.addEventListener('click', () => {
// //         document.querySelectorAll('#dateTabs li').forEach((l) => l.classList.remove('active'));
// //         li.classList.add('active');
// //         loadShowtimesForDate(li.dataset.date);
// //       });
// //     });
// //
// //     loadShowtimesForDate(dates[0]);
// //   }
// //
// //   async function loadShowtimesForDate(date) {
// //     selectedDate = date;
// //     selectedShowtimeId = null;
// //     updateGotoBtn();
// //     const cont = document.getElementById('showtimesContainer');
// //     cont.innerHTML = '<p style="color:#7a7a90;padding:10px 0">Đang tải…</p>';
// //
// //     const shows = await fetch(`/api/showtimes?movieId=${movieId}&date=${date}`).then((r) => r.json());
// //     if (!shows.length) {
// //       cont.innerHTML = '<p style="color:#7a7a90;padding:10px 0">Không có suất chiếu ngày này.</p>';
// //       return;
// //     }
// //
// //     cont.innerHTML = shows.map((st) => {
// //       const hhmm = (String(st.time || '').match(/\d{2}:\d{2}/) || ['--:--'])[0];
// //       return `<button type="button" class="showtime-btn" data-id="${st.ShowTimeID}" data-time="${hhmm}">${hhmm}</button>`;
// //     }).join('');
// //
// //     cont.querySelectorAll('.showtime-btn').forEach((btn) => {
// //       btn.addEventListener('click', () => {
// //         cont.querySelectorAll('.showtime-btn').forEach((b) => b.classList.remove('selected'));
// //         btn.classList.add('selected');
// //         selectedShowtimeId = btn.dataset.id;
// //         selectedTime = btn.dataset.time;
// //         updateGotoBtn();
// //       });
// //     });
// //   }
// //
// //   function updateGotoBtn() {
// //     const btn = document.getElementById('gotoSeatsBtn');
// //     if (selectedShowtimeId) {
// //       btn.disabled = false;
// //       btn.textContent = `Chọn Ghế — ${moviePrice.toLocaleString('vi-VN')}đ/vé`;
// //     } else {
// //       btn.disabled = true;
// //       btn.textContent = 'Chọn Ghế';
// //     }
// //   }
// //
// //   document.getElementById('gotoSeatsBtn').addEventListener('click', () => {
// //     if (!selectedShowtimeId) return;
// //     const url = `/DatVe/ChonGhe.html?movieId=${movieId}&showtimeId=${selectedShowtimeId}`
// //       + `&time=${encodeURIComponent(selectedTime)}&date=${encodeURIComponent(selectedDate)}`;
// //     window.location.href = url;
// //   });
// //
// //   loadMovie();
// //   loadDates();
// // })();
//
//
//
// (function () {
//   const movieId = new URLSearchParams(location.search).get('movieId');
//   const el = (id) => document.getElementById(id);
//   const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';
//
//   if (!movieId) {
//     document.querySelector('.content').innerHTML =
//         '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu movieId. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
//     return;
//   }
//
//   function showToast(msg, type) {
//     const t = el('toast');
//     t.textContent = msg;
//     t.className = 'toast show ' + (type || '');
//     setTimeout(() => (t.className = 'toast'), 2800);
//   }
//
//   let movie = null;
//   let dates = [];
//   let selectedDateIdx = 0;
//   let showtimesOfDate = [];
//   let selectedShowtime = null;
//
//   async function load() {
//     try {
//       movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
//     } catch (e) {
//       showToast('Không tải được thông tin phim.', 'err');
//       return;
//     }
//
//     let allShows = [];
//     try {
//       allShows = await fetch(`/api/showtimes?movieId=${movieId}`).then((r) => r.json());
//     } catch (e) {
//       showToast('Không tải được lịch chiếu.', 'err');
//     }
//
//     dates = [...new Set(allShows.map((s) => (s.date || (s.time || '').substring(0, 10))))]
//         .filter(Boolean)
//         .sort();
//
//     renderMovie();
//     renderDates();
//     if (dates.length) await loadShowtimesForDate(dates[0]);
//     renderConfirm();
//   }
//
//   function renderMovie() {
//     el('backdropImg').src = movie.PosterUrl || '';
//     el('backdropImg').alt = movie.TieuDe || '';
//     el('posterImg').src = movie.PosterUrl || '';
//     el('posterImg').alt = movie.TieuDe || '';
//
//     const genres = String(movie.TheLoai || '').split(',').map((g) => g.trim()).filter(Boolean);
//     el('badges').innerHTML = genres.map((g) => `<span class="badge">${g}</span>`).join('')
//         + (movie.AgeRate != null ? `<span class="badge red">${movie.AgeRate}+</span>` : '');
//     el('movieTitle').textContent = movie.TieuDe || '';
//     el('duration').textContent = movie.ThoiLuong ? `${movie.ThoiLuong} phút` : '—';
//     el('synopsis').textContent = movie.MieuTa || '';
//     document.title = `${movie.TieuDe || ''} · Chọn Suất Chiếu`;
//   }
//
//   function fmtDateLabel(d, idx) {
//     const dt = new Date(d);
//     const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
//     const label = `${days[dt.getDay()]}, ${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
//     return idx === 0 ? `Hôm nay, ${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}` : label;
//   }
//
//   function renderDates() {
//     el('dateRow').innerHTML = '';
//     dates.forEach((d, i) => {
//       const btn = document.createElement('button');
//       btn.className = 'date-btn' + (selectedDateIdx === i ? ' active' : '');
//       btn.textContent = fmtDateLabel(d, i);
//       btn.onclick = async () => {
//         selectedDateIdx = i;
//         selectedShowtime = null;
//         renderDates();
//         await loadShowtimesForDate(d);
//         renderConfirm();
//       };
//       el('dateRow').appendChild(btn);
//     });
//   }
//
//   async function loadShowtimesForDate(date) {
//     el('showtimeGrid').innerHTML = '<p style="color:#7a7a90">Đang tải…</p>';
//     try {
//       showtimesOfDate = await fetch(`/api/showtimes?movieId=${movieId}&date=${date}`).then((r) => r.json());
//     } catch (e) {
//       showtimesOfDate = [];
//     }
//     renderShowtimes();
//   }
//
//   function renderShowtimes() {
//     const grid = el('showtimeGrid');
//     grid.innerHTML = '';
//     if (!showtimesOfDate.length) {
//       grid.innerHTML = '<p style="color:#7a7a90">Không có suất chiếu ngày này.</p>';
//       return;
//     }
//     showtimesOfDate.forEach((s) => {
//       const hhmm = (String(s.time || '').match(/\d{2}:\d{2}/) || ['--:--'])[0];
//       const sel = selectedShowtime && selectedShowtime.ShowTimeID === s.ShowTimeID;
//       const card = document.createElement('button');
//       card.className = 'showtime-card' + (sel ? ' active' : '');
//       card.innerHTML = `<div class="st-time">${hhmm}</div>
//         <div class="st-price">${fmt(Number(movie.GiaVe) || 0)}</div>`;
//       card.onclick = () => { selectedShowtime = { ...s, time: hhmm }; renderShowtimes(); renderConfirm(); };
//       grid.appendChild(card);
//     });
//   }
//
//   function renderConfirm() {
//     const btn = el('confirmBtn');
//     if (selectedShowtime) {
//       btn.className = 'confirm-btn ready';
//       btn.textContent = `Chọn Ghế — ${fmt(Number(movie.GiaVe) || 0)}/vé`;
//     } else {
//       btn.className = 'confirm-btn';
//       btn.textContent = 'Vui Lòng Chọn Suất Chiếu';
//     }
//   }
//
//   el('confirmBtn').onclick = () => {
//     if (!selectedShowtime) return;
//     const url = `/DatVe/ChonGhe.html?movieId=${movieId}&showtimeId=${selectedShowtime.ShowTimeID}`
//         + `&time=${encodeURIComponent(selectedShowtime.time)}&date=${encodeURIComponent(dates[selectedDateIdx])}`;
//     window.location.href = url;
//   };
//
//   load();
// })();



(function () {
  const movieId = new URLSearchParams(location.search).get('movieId');
  const el = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';

  if (!movieId) {
    document.querySelector('.content').innerHTML =
        '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu movieId. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
    return;
  }

  function showToast(msg, type) {
    const t = el('toast');
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    setTimeout(() => (t.className = 'toast'), 2800);
  }

  // API /api/showtimes trả field "ThoiGianBatDau" (ISO datetime, VD:
  // "2026-08-07T14:45:00") — KHÔNG có field "time"/"date" riêng.
  const dateOf = (s) => (s.ThoiGianBatDau || '').substring(0, 10);
  const timeOf = (s) => {
    const m = String(s.ThoiGianBatDau || '').match(/T(\d{2}:\d{2})/);
    return m ? m[1] : '--:--';
  };

  let movie = null;
  let allShows = [];
  let dates = [];
  let selectedDateIdx = 0;
  let selectedShowtime = null;

  async function load() {
    try {
      movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
    } catch (e) {
      showToast('Không tải được thông tin phim.', 'err');
      return;
    }

    try {
      allShows = await fetch(`/api/showtimes?movieId=${movieId}`).then((r) => r.json());
    } catch (e) {
      allShows = [];
      showToast('Không tải được lịch chiếu.', 'err');
    }

    dates = [...new Set(allShows.map(dateOf))].filter(Boolean).sort();

    renderMovie();
    renderDates();
    renderShowtimesForSelectedDate();
    renderConfirm();
  }

  function renderMovie() {
    el('backdropImg').src = movie.PosterUrl || '';
    el('backdropImg').alt = movie.TieuDe || '';
    el('posterImg').src = movie.PosterUrl || '';
    el('posterImg').alt = movie.TieuDe || '';

    const genres = String(movie.TheLoai || '').split(',').map((g) => g.trim()).filter(Boolean);
    el('badges').innerHTML = genres.map((g) => `<span class="badge">${g}</span>`).join('')
        + (movie.AgeRate != null ? `<span class="badge red">${movie.AgeRate}+</span>` : '');
    el('movieTitle').textContent = movie.TieuDe || '';
    el('duration').textContent = movie.ThoiLuong ? `${movie.ThoiLuong} phút` : '—';
    el('synopsis').textContent = movie.MieuTa || '';
    document.title = `${movie.TieuDe || ''} · Chọn Suất Chiếu`;
  }

  function fmtDateLabel(d, idx) {
    const [y, m, dd] = d.split('-');
    const dt = new Date(Number(y), Number(m) - 1, Number(dd));
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return idx === 0 ? `Hôm nay, ${dd}/${m}` : `${days[dt.getDay()]}, ${dd}/${m}`;
  }

  function renderDates() {
    const row = el('dateRow');
    if (dates.length === 0) {
      row.innerHTML = '';
      el('showtimeGrid').innerHTML = '<p style="color:#7a7a90">Phim này chưa có suất chiếu nào. Vui lòng quay lại sau.</p>';
      return;
    }
    row.innerHTML = '';
    dates.forEach((d, i) => {
      const btn = document.createElement('button');
      btn.className = 'date-btn' + (selectedDateIdx === i ? ' active' : '');
      btn.textContent = fmtDateLabel(d, i);
      btn.onclick = () => {
        selectedDateIdx = i;
        selectedShowtime = null;
        renderDates();
        renderShowtimesForSelectedDate();
        renderConfirm();
      };
      row.appendChild(btn);
    });
  }

  function renderShowtimesForSelectedDate() {
    if (dates.length === 0) return;
    const targetDate = dates[selectedDateIdx];
    const showsOfDate = allShows.filter((s) => dateOf(s) === targetDate);

    const grid = el('showtimeGrid');
    grid.innerHTML = '';
    if (!showsOfDate.length) {
      grid.innerHTML = '<p style="color:#7a7a90">Không có suất chiếu ngày này.</p>';
      return;
    }
    showsOfDate
        .sort((a, b) => timeOf(a).localeCompare(timeOf(b)))
        .forEach((s) => {
          const hhmm = timeOf(s);
          const sel = selectedShowtime && selectedShowtime.ShowTimeID === s.ShowTimeID;
          const card = document.createElement('button');
          card.className = 'showtime-card' + (sel ? ' active' : '');
          card.innerHTML = `<div class="st-time">${hhmm}</div>
          <div class="st-price">${fmt(Number(movie.GiaVe) || 0)}</div>`;
          card.onclick = () => { selectedShowtime = { ...s, time: hhmm }; renderShowtimesForSelectedDate(); renderConfirm(); };
          grid.appendChild(card);
        });
  }

  function renderConfirm() {
    const btn = el('confirmBtn');
    if (selectedShowtime) {
      btn.className = 'confirm-btn ready';
      btn.textContent = `Chọn Ghế — ${fmt(Number(movie.GiaVe) || 0)}/vé`;
    } else {
      btn.className = 'confirm-btn';
      btn.textContent = 'Vui Lòng Chọn Suất Chiếu';
    }
  }

  el('confirmBtn').onclick = () => {
    if (!selectedShowtime) return;
    const url = `/DatVe/ChonGhe.html?movieId=${movieId}&showtimeId=${selectedShowtime.ShowTimeID}`
        + `&time=${encodeURIComponent(selectedShowtime.time)}&date=${encodeURIComponent(dates[selectedDateIdx])}`;
    window.location.href = url;
  };

  load();
})();
