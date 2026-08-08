(function () {
    const el = (id) => document.getElementById(id);
    const fmt = (n) => n.toLocaleString('vi-VN') + ' đ';

    let filter = 'upcoming';
    let bookings = [];
    let movieLookup = {}; // title -> movie object (PosterUrl, AgeRate, GiaVe, ThoiLuong)
    let currentPhone = '';

    const savedPhone = sessionStorage.getItem('phone');
    if (savedPhone) el('phone').value = savedPhone;

    function showToast(msg, type) {
        const t = el('toast');
        t.textContent = msg;
        t.className = 'toast show ' + (type || '');
        setTimeout(() => (t.className = 'toast'), 2800);
    }

    async function loadMovieLookup() {
        try {
            const movies = await fetch('/api/movies').then((r) => r.json());
            movieLookup = Object.fromEntries(movies.map((m) => [m.TieuDe, m]));
        } catch (e) {
            movieLookup = {};
        }
    }

    async function fetchHistoryByPhone(phone) {
        currentPhone = phone;
        el('list').innerHTML = '<div class="empty"><p>Đang tải…</p></div>';

        if (Object.keys(movieLookup).length === 0) await loadMovieLookup();

        try {
            const data = await fetch(`/api/history?phone=${encodeURIComponent(phone)}`).then((r) => r.json());
            bookings = Array.isArray(data) ? data : [];
        } catch (e) {
            showToast('Không kết nối được máy chủ, vui lòng thử lại.', 'err');
            bookings = [];
        }
        render();
    }

    function render() {
        renderFilters();
        renderList();
    }

    function renderFilters() {
        const now = Date.now();
        const upcoming = bookings.filter((b) => new Date(b.startTime).getTime() >= now).length;
        const past = bookings.filter((b) => new Date(b.startTime).getTime() < now).length;

        el('filterRow').innerHTML = '';
        if (bookings.length === 0) return;

        [
            { key: 'upcoming', label: 'Sắp chiếu', count: upcoming },
            { key: 'past', label: 'Đã chiếu', count: past },
        ].forEach((f) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (filter === f.key ? ' active' : '');
            btn.innerHTML = `${f.label}<span class="count">(${f.count})</span>`;
            btn.onclick = () => { filter = f.key; render(); };
            el('filterRow').appendChild(btn);
        });
    }

    function renderList() {
        const now = Date.now();
        const shown = bookings.filter((b) => {
            const isUpcoming = new Date(b.startTime).getTime() >= now;
            return filter === 'upcoming' ? isUpcoming : !isUpcoming;
        });

        const list = el('list');
        list.innerHTML = '';

        if (bookings.length === 0) {
            list.innerHTML = `<div class="empty">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7a7a90" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6M16 2l4 4-8 8H8v-4L16 2z"/></svg>
        </div>
        <p>Không tìm thấy vé nào cho số điện thoại này</p>
      </div>`;
            return;
        }
        if (shown.length === 0) {
            list.innerHTML = `<div class="empty"><p>Không có vé nào ở mục này</p></div>`;
            return;
        }

        shown.forEach((b) => {
            const movie = movieLookup[b.title] || {};
            const show = new Date(b.startTime);
            const canCancel = Date.now() <= show.getTime() - 86400000;
            const isUpcoming = show.getTime() >= Date.now();
            const rating = movie.AgeRate != null ? `${movie.AgeRate}+` : '—';
            const ratingBg = movie.AgeRate >= 18 ? '#c0162e' : movie.AgeRate >= 16 ? '#e07830' : '#4caf8a';
            const seatsArr = Array.isArray(b.seats) ? b.seats : String(b.seats || '').split(',').filter(Boolean);
            const total = (Number(movie.GiaVe) || 0) * (Number(b.qty) || seatsArr.length);
            const durationMin = Number(movie.ThoiLuong) || 0;
            const endTime = durationMin
                ? new Date(show.getTime() + durationMin * 60000).toTimeString().slice(0, 5)
                : '';

            const st = isUpcoming
                ? { text: 'Sắp chiếu', color: '#4caf8a', bg: 'rgba(76,175,138,0.12)' }
                : { text: 'Đã chiếu', color: '#7a7a90', bg: 'rgba(255,255,255,0.06)' };

            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
        <div class="ticket-body">
          <div class="ticket-poster">
            <img src="${movie.PosterUrl || ''}" alt="${b.title}" onerror="this.style.opacity=0" />
            <div class="rating-badge" style="background:${ratingBg};">${rating}</div>
          </div>
          <div class="ticket-info">
            <div class="tag-row">
              <span class="code-tag">Mã: ${String(b.group || '').slice(0, 8)}</span>
              <span class="status-tag" style="background:${st.bg};color:${st.color};">${st.text}</span>
            </div>
            <p class="movie-title">${b.title || ''}</p>
            <div class="meta-line">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>${show.toLocaleString('vi-VN')}${endTime ? ` ~${endTime}` : ''}</span>
            </div>
            <div class="meta-line hall-line">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16M2 12h20"/></svg>
              <span class="hall-line">Ghế: ${seatsArr.join(', ')}</span>
            </div>
            <p class="price-line">${fmt(total)}</p>
          </div>
        </div>
        <div class="ticket-footer">
          <div class="footer-actions">
            <button class="footer-btn" onclick="window.open('/HoaDon.html?group=${b.group}','_blank')">In hóa đơn</button>
            ${canCancel ? `<button class="footer-btn danger" onclick="cancelGroup('${b.group}')">Hủy vé</button>` : ''}
          </div>
        </div>`;
            list.appendChild(card);
        });
    }

    window.cancelGroup = async function (group) {
        if (!confirm('Bạn chắc chắn muốn hủy vé đặt này?')) return;
        try {
            const res = await fetch(`/api/cancel_booking?group=${group}`).then((r) => r.json());
            if (res.ok) {
                showToast('Đã hủy vé thành công.', 'ok');
                fetchHistoryByPhone(currentPhone);
            } else {
                showToast(res.error || 'Không thể hủy vé.', 'err');
            }
        } catch (e) {
            showToast('Có lỗi xảy ra, vui lòng thử lại.', 'err');
        }
    };

    el('btn-view').addEventListener('click', () => {
        const phoneInput = el('phone');
        const phone = phoneInput.value.trim();
        if (!phone) { showToast('Vui lòng nhập số điện thoại.', 'err'); return; }
        if (!phoneInput.checkValidity()) { showToast(phoneInput.validationMessage, 'err'); return; }
        sessionStorage.setItem('phone', phone);
        fetchHistoryByPhone(phone);
    });

    if (savedPhone) fetchHistoryByPhone(savedPhone);
})();
