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
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        String action = req.getParameter("action");
        if (action == null) action = "";

        try {
            switch (action) {
                case "new":
                    req.getRequestDispatcher("/views/movie-form.jsp").forward(req, resp);
                    break;

                case "edit":
                    int editId = parseInt(req.getParameter("id"), 0);
                    if (editId > 0) {
                        Movie m = dao.findById(editId);
                        if (m != null) {
                            req.setAttribute("movie", m);
                            req.getRequestDispatcher("/views/movie-form.jsp").forward(req, resp);
                            return;
                        }
                    }
                    resp.sendRedirect(req.getContextPath() + "/movies");
                    break;

                case "delete":
                    int deleteId = parseInt(req.getParameter("id"), 0);
                    if (deleteId > 0) {
                        dao.delete(deleteId);
                    }
                    resp.sendRedirect(req.getContextPath() + "/movies");
                    break;

                default:
                    List<Movie> list = dao.findAll();
                    req.setAttribute("movieList", list);
                    req.getRequestDispatcher("/views/movie-list.jsp").forward(req, resp);
                    break;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new ServletException("Lỗi CSDL trong MovieServlet: " + e.getMessage(), e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");

        try {
            int id = parseInt(req.getParameter("movieID"), 0);

            String tieuDe      = req.getParameter("tieuDe");
            String doTuoi      = req.getParameter("doTuoi");
            String thoiLuongStr= req.getParameter("thoiLuong");
            String ngayChieuStr= req.getParameter("ngayKhoiChieu");
            String theLoai     = req.getParameter("theLoai");
            String giaVeStr    = req.getParameter("giaVe");
            String ngonNgu     = req.getParameter("ngonNgu");
            String daoDien     = req.getParameter("daoDien");
            String dienVien    = req.getParameter("dienVien");
            String mieuTa      = req.getParameter("mieuTa");
            String posterUrl   = req.getParameter("posterUrl");
            String trailerId   = req.getParameter("trailerId");

            Movie m = new Movie();
            m.setTieuDe(tieuDe == null ? "" : tieuDe.trim());
            m.setDoTuoi(doTuoi == null ? "" : doTuoi.trim());
            m.setThoiLuong(parseInt(thoiLuongStr, 0));

            if (ngayChieuStr == null || ngayChieuStr.isBlank()) {
                m.setNgayChieu(Date.valueOf(LocalDate.now()));
            } else {
                try {
                    m.setNgayChieu(Date.valueOf(ngayChieuStr.split("T")[0]));
                } catch (Exception e) {
                    m.setNgayChieu(Date.valueOf(LocalDate.now()));
                }
            }

            m.setTheLoai(theLoai == null ? "" : theLoai.trim());

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

            m.setNgonNgu(ngonNgu == null ? "" : ngonNgu.trim());
            m.setDaoDien(daoDien == null ? "" : daoDien.trim());
            m.setDienVien(dienVien == null ? "" : dienVien.trim());
            m.setMieuTa(mieuTa == null ? "" : mieuTa.trim());
            m.setPosterUrl(posterUrl == null ? "" : posterUrl.trim());
            m.setTrailerId(trailerId == null ? "" : trailerId.trim());

            if (id == 0) {
                dao.insert(m);
            } else {
                m.setMovieID(id);
                dao.update(m);
            }
            resp.sendRedirect(req.getContextPath() + "/movies");

        } catch (SQLException e) {
            e.printStackTrace();
            throw new ServletException("Lỗi lưu dữ liệu Phim: " + e.getMessage(), e);
        }
    }

    // Hàm tiện ích parse số nguyên an toàn
    private static int parseInt(String value, int defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}