(function () {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movieId');

  let selectedShowtimeId = null;
  let selectedTime = '';
  let selectedDate = '';
  let moviePrice = 200000;

  if (!movieId) {
    document.querySelector('.flow-page').innerHTML =
      '<p style="padding:40px;text-align:center;color:#a8a8ba">Thiếu movieId. <a href="/Home/Phim.html" style="color:#d4a44c">Quay lại chọn phim</a></p>';
    return;
  }

  async function loadMovie() {
    const movie = await fetch(`/api/movies?movieId=${movieId}`).then((r) => r.json());
    moviePrice = Number(movie.GiaVe) || moviePrice;
    document.getElementById('movieBar').innerHTML = `
      <img src="${movie.PosterUrl || ''}" alt="${movie.TieuDe || ''}" />
      <div>
        <h3>${movie.TieuDe || ''}</h3>
        <p>${movie.TheLoai || ''} · ${movie.ThoiLuong || '?'} phút</p>
      </div>
    `;
  }

  async function loadDates() {
    const shows = await fetch(`/api/showtimes?movieId=${movieId}`).then((r) => r.json());
    const dates = [...new Set(shows.map((s) => (s.date || s.startTime || s.ThoiGianBatDau || '').substring(0, 10)))].filter(Boolean);

    if (dates.length === 0) {
      document.getElementById('dateTabs').innerHTML = '<li>Chưa có lịch chiếu</li>';
      return;
    }

    document.getElementById('dateTabs').innerHTML = dates.map((d, i) =>
      `<li data-date="${d}" class="${i === 0 ? 'active' : ''}">${d.split('-').reverse().join('/')}</li>`
    ).join('');

    document.querySelectorAll('#dateTabs li[data-date]').forEach((li) => {
      li.addEventListener('click', () => {
        document.querySelectorAll('#dateTabs li').forEach((l) => l.classList.remove('active'));
        li.classList.add('active');
        loadShowtimesForDate(li.dataset.date);
      });
    });

    loadShowtimesForDate(dates[0]);
  }

  async function loadShowtimesForDate(date) {
    selectedDate = date;
    selectedShowtimeId = null;
    updateGotoBtn();
    const cont = document.getElementById('showtimesContainer');
    cont.innerHTML = '<p style="color:#7a7a90;padding:10px 0">Đang tải…</p>';

    const shows = await fetch(`/api/showtimes?movieId=${movieId}&date=${date}`).then((r) => r.json());
    if (!shows.length) {
      cont.innerHTML = '<p style="color:#7a7a90;padding:10px 0">Không có suất chiếu ngày này.</p>';
      return;
    }

    cont.innerHTML = shows.map((st) => {
      const hhmm = (String(st.time || '').match(/\d{2}:\d{2}/) || ['--:--'])[0];
      return `<button type="button" class="showtime-btn" data-id="${st.ShowTimeID}" data-time="${hhmm}">${hhmm}</button>`;
    }).join('');

    cont.querySelectorAll('.showtime-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        cont.querySelectorAll('.showtime-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedShowtimeId = btn.dataset.id;
        selectedTime = btn.dataset.time;
        updateGotoBtn();
      });
    });
  }

  function updateGotoBtn() {
    const btn = document.getElementById('gotoSeatsBtn');
    if (selectedShowtimeId) {
      btn.disabled = false;
      btn.textContent = `Chọn Ghế — ${moviePrice.toLocaleString('vi-VN')}đ/vé`;
    } else {
      btn.disabled = true;
      btn.textContent = 'Chọn Ghế';
    }
  }

  document.getElementById('gotoSeatsBtn').addEventListener('click', () => {
    if (!selectedShowtimeId) return;
    const url = `/DatVe/ChonGhe.html?movieId=${movieId}&showtimeId=${selectedShowtimeId}`
      + `&time=${encodeURIComponent(selectedTime)}&date=${encodeURIComponent(selectedDate)}`;
    window.location.href = url;
  });

  loadMovie();
  loadDates();
})();
