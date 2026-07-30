package com.duanweb.duanweb.controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;


@Component
@Order(1)
// @WebFilter(filterName = "auth", value = {
//         "/api/*",
//         "/movie/*",
//         "/Home/*",
//         "/GioiThieu.html",
//         "/Phim.html",
//         "/Admin/*",
//         "/admin/*"
// })
@WebFilter(urlPatterns = "/*")
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // Chống cache trình duyệt
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        resp.setHeader("Pragma", "no-cache");
        resp.setDateHeader("Expires", 0);

        HttpSession session = req.getSession(false);
        String requestURI = req.getRequestURI();
        
        // 1. Cho phép các endpoint public không cần kiểm tra auth
        if (requestURI.contains("/login") || 
            requestURI.contains("/register") || 
            requestURI.contains("/logout") || 
            requestURI.contains("/Logout") || 
            requestURI.contains("/api/check-auth")) {
            
            chain.doFilter(request, response);
            return;
        }

        String role = (session != null) ? (String) session.getAttribute("role") : null;

        // 🟢 2. BẢO VỆ TRANG HTML ADMIN & API DÀNH RIÊNG CHO ADMIN
        // Chặn nếu truy cập /Admin/* HOẶC các API quản trị như /api/admin/*
        boolean isAdminPath = requestURI.contains("/Admin/") || requestURI.contains("/api/admin/");

        if (isAdminPath) {
            if (role == null || !role.equalsIgnoreCase("ADMIN")) {
                // Nếu là API call -> Trả về lỗi 403 Forbidden dạng JSON
                if (requestURI.startsWith(req.getContextPath() + "/api/")) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    resp.setContentType("application/json;charset=UTF-8");
                    resp.getWriter().write("{\"error\": \"Bạn không có quyền thực hiện thao tác này!\"}");
                    return;
                }
                
                // Nếu là truy cập trang HTML -> Redirect về /Home/index.html (ĐÃ SỬA LỖI 404)
                resp.sendRedirect(req.getContextPath() + "/Home/index.html?error=" 
                        + encode("Bạn không có quyền truy cập trang Admin!"));
                return;
            }
        }

        // 🟢 3. KIỂM TRA ĐĂNG NHẬP THÔNG THƯỜNG CHO CÁC TRANG USER
        if (role != null) {
            chain.doFilter(request, response);
        } else {
            // Nếu gọi API khi chưa login -> Trả về 401 Unauthorized
            if (requestURI.startsWith(req.getContextPath() + "/api/")) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.setContentType("application/json;charset=UTF-8");
                resp.getWriter().write("{\"error\": \"Vui lòng đăng nhập!\"}");
                return;
            }

            resp.sendRedirect(req.getContextPath() + "/Login/login.html?error="
                    + encode("Vui lòng đăng nhập!"));
        }
    }

    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }

    @Override
    public void destroy() {}
}