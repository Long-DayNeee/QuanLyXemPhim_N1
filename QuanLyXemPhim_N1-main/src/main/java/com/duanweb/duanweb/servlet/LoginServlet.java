package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.AuthDAO;
import com.duanweb.duanweb.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    private final AuthDAO authDAO = new AuthDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("login.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String u = request.getParameter("username");
        String p = request.getParameter("password");

        u = (u != null) ? u.trim() : "";
        p = (p != null) ? p.trim() : "";

        if (u.isBlank() || p.isBlank()) {
            request.setAttribute("error", "Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!");
            request.getRequestDispatcher("login.jsp").forward(request, response);
            return;
        }

        // Gọi DAO kiểm tra đăng nhập
        User user = authDAO.login(u, p);

        if (user != null) {
            HttpSession session = request.getSession();
            session.setAttribute("account", user);
            session.setMaxInactiveInterval(3600);
            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                response.sendRedirect("Admin/QuanLyPhim.jsp");
            } else {
                response.sendRedirect("Home/home.jsp");
            }
        } else {
            request.setAttribute("error", "Tài khoản hoặc mật khẩu không đúng!");
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }
}