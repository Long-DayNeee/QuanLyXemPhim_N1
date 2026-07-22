package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.MovieDAO;
import com.duanweb.duanweb.model.Movie;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@WebServlet(urlPatterns = "/movies")
public class MovieServlet extends HttpServlet {
    private MovieDAO dao;

    @Override
    public void init() {
        dao = new MovieDAO();
    }

    @Override
    protected void doGet(HttpServletRequest req,
                         HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            String action = req.getParameter("action");
            if ("new".equals(action)) {
                req.getRequestDispatcher("/views/movie-form.jsp")
                   .forward(req, resp);

            } else if ("edit".equals(action)) {
                int id = Integer.parseInt(req.getParameter("id"));
                Movie m = dao.findById(id);
                req.setAttribute("movie", m);
                req.getRequestDispatcher("/views/movie-form.jsp")
                   .forward(req, resp);

            } else if ("delete".equals(action)) {
                int id = Integer.parseInt(req.getParameter("id"));
                dao.delete(id);
                resp.sendRedirect(req.getContextPath() + "/movies");

            } else {
                // list
                List<Movie> list = dao.findAll();
                req.setAttribute("movieList", list);
                req.getRequestDispatcher("/views/movie-list.jsp")
                   .forward(req, resp);
            }

        } catch (SQLException e) {
            throw new ServletException("Database error in MovieServlet", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req,
                          HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            req.setCharacterEncoding("UTF-8");
            
            int id = req.getParameter("movieID") == null || req.getParameter("movieID").isBlank() ?
                     0 : Integer.parseInt(req.getParameter("movieID"));

            // Đọc đầy đủ các thông tin gửi lên từ form JSP
            String tieuDe    = req.getParameter("tieuDe");
            String doTuoi    = req.getParameter("doTuoi");
            String thoiLuongStr = req.getParameter("thoiLuong");
            String ngayChieuStr = req.getParameter("ngayKhoiChieu"); // Hoặc ngayChieu tùy form JSP của bạn
            String theLoai   = req.getParameter("theLoai");
            String giaVeStr  = req.getParameter("giaVe");
            String ngonNgu   = req.getParameter("ngonNgu");
            String daoDien   = req.getParameter("daoDien");
            String dienVien  = req.getParameter("dienVien");
            String mieuTa    = req.getParameter("mieuTa");
            String posterUrl = req.getParameter("posterUrl");
            String trailerId = req.getParameter("trailerId");

            Movie m = new Movie();
            m.setTieuDe(tieuDe == null ? "" : tieuDe);
            m.setDoTuoi(doTuoi == null ? "" : doTuoi);
            m.setThoiLuong(thoiLuongStr == null || thoiLuongStr.isBlank() ? 0 : Integer.parseInt(thoiLuongStr.trim()));
            
            // Xử lý ngày tháng an toàn
            if (ngayChieuStr == null || ngayChieuStr.isBlank()) {
                m.setNgayChieu(Date.valueOf(LocalDate.now()));
            } else {
                try {
                    m.setNgayChieu(Date.valueOf(ngayChieuStr.split("T")[0]));
                } catch (Exception e) {
                    m.setNgayChieu(Date.valueOf(LocalDate.now()));
                }
            }

            m.setTheLoai(theLoai == null ? "" : theLoai);
            
            // Xử lý giá vé an toàn
            if (giaVeStr == null || giaVeStr.isBlank()) {
                m.setGiaVe(BigDecimal.valueOf(200000));
            } else {
                try {
                    m.setGiaVe(new BigDecimal(giaVeStr.trim()));
                } catch (Exception e) {
                    m.setGiaVe(BigDecimal.ZERO);
                }
            }

            m.setNgonNgu(ngonNgu == null ? "" : ngonNgu);
            m.setDaoDien(daoDien == null ? "" : daoDien);
            m.setDienVien(dienVien == null ? "" : dienVien);
            m.setMieuTa(mieuTa == null ? "" : mieuTa);
            m.setPosterUrl(posterUrl == null ? "" : posterUrl);
            m.setTrailerId(trailerId == null ? "" : trailerId);

            if (id == 0) {
                dao.insert(m);
            } else {
                m.setMovieID(id);
                dao.update(m);
            }
            resp.sendRedirect(req.getContextPath() + "/movies");

        } catch (SQLException e) {
            throw new ServletException("Error saving Movie", e);
        }
    }
}