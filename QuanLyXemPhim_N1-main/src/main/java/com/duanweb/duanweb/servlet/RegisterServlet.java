package com.duanweb.duanweb.servlet;

import com.duanweb.duanweb.dao.AuthDAO;
import com.duanweb.duanweb.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    private AuthDAO authDAO;

    @Override
    public void init() {
        authDAO = new AuthDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/register.jsp").forward(request, response);    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String fullName = request.getParameter("fullName");

        // 1. Kiểm tra dữ liệu rỗng
        if (username == null || username.isBlank() ||
                password == null || password.isBlank()) {

            request.setAttribute("error", "Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu!");
            request.setAttribute("fullName", fullName);
            request.getRequestDispatcher("/register.jsp").forward(request, response);
            return;
        }

        username = username.trim();
        password = password.trim();
        fullName = (fullName != null) ? fullName.trim() : "";

        // 2. Kiểm tra tài khoản đã tồn tại chưa
        if (authDAO.checkUserExists(username)) {
            request.setAttribute("error", "Tên tài khoản này đã có người sử dụng!");
            request.setAttribute("fullName", fullName);
            request.getRequestDispatcher("/register.jsp").forward(request, response);
            return;
        }

        // 3. Tiến hành đăng ký
        User newUser = new User(username, password, fullName);
        boolean isSuccess = authDAO.register(newUser);

        if (isSuccess) {
            // Lưu thông báo vào session để hiển thị bên trang login sau khi redirect
            HttpSession session = request.getSession();
            session.setAttribute("message", "Đăng ký thành công! Hãy đăng nhập ngay.");
            response.sendRedirect(request.getContextPath() + "/login");
        } else {
            request.setAttribute("error", "Đã xảy ra lỗi trong quá trình lưu dữ liệu. Vui lòng thử lại!");
            request.getRequestDispatcher("/register.jsp").forward(request, response);
        }
    }
}