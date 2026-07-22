package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.AuthDAO;
import com.duanweb.duanweb.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    private AuthDAO authDAO = new AuthDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("register.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String fullName = request.getParameter("fullName");

        if (authDAO.checkUserExists(username)) {
            request.setAttribute("error", "Tên tài khoản này đã có người sử dụng!");
            request.getRequestDispatcher("register.jsp").forward(request, response);
        } else {
            User newUser = new User(username, password, fullName);
            boolean isSuccess = authDAO.register(newUser);

            if (isSuccess) {
                request.setAttribute("message", "Đăng ký thành công! Hãy đăng nhập ngay.");
                request.getRequestDispatcher("login.jsp").forward(request, response);
            } else {
                request.setAttribute("error", "Đã xảy ra lỗi, vui lòng thử lại!");
                request.getRequestDispatcher("register.jsp").forward(request, response);
            }
        }
    }
}