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

        // Chống Cache
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        resp.setHeader("Pragma", "no-cache");
        resp.setDateHeader("Expires", 0);

        String requestURI = req.getRequestURI();

        // 🛠️ LÀM SẠCH URI: Loại bỏ query string (?) hoặc matrix parameter (;) nếu có
        String cleanURI = requestURI;
        if (cleanURI.contains("?")) {
            cleanURI = cleanURI.substring(0, cleanURI.indexOf("?"));
        }
        if (cleanURI.contains(";")) {
            cleanURI = cleanURI.substring(0, cleanURI.indexOf(";"));
        }
        String lowerURI = cleanURI.toLowerCase();

        // 🟢 BƯỚC 1: BỎ QUA TẤT CẢ FILE TĨNH (STATIC RESOURCES)
        boolean isStatic = lowerURI.endsWith(".png")  ||
                lowerURI.endsWith(".jpg")  ||
                lowerURI.endsWith(".jpeg") ||
                lowerURI.endsWith(".gif")  ||
                lowerURI.endsWith(".svg")  ||
                lowerURI.endsWith(".ico")  ||
                lowerURI.endsWith(".css")  ||
                lowerURI.endsWith(".js")   ||
                lowerURI.endsWith(".mp4")  ||
                lowerURI.endsWith(".woff") ||
                lowerURI.endsWith(".woff2")||
                lowerURI.endsWith(".ttf")  ||
                lowerURI.endsWith(".html") ||  // ✅ Cho phép file HTML
                lowerURI.endsWith(".htm");

        if (isStatic) {
            chain.doFilter(request, response);
            return;
        }

        // 🟢 BƯỚC 2: BỎ QUA CÁC TRANG VÀ THƯ MỤC PUBLIC
        boolean isPublic = lowerURI.contains("/login") ||
                lowerURI.contains("/register") ||
                lowerURI.contains("/logout") ||
                lowerURI.contains("/error") ||
                lowerURI.contains("/pro230/") ||   // Thư mục ảnh phim của bạn
                lowerURI.contains("/api/check-auth") ||
                lowerURI.contains("/api/movies") ||
                lowerURI.contains("/api/showtimes") ||
                lowerURI.contains("/api/rooms") ||      // ✅ THÊM
                lowerURI.contains("/api/bookings") ||   // ✅ THÊM
                lowerURI.contains("/api/admin/users") ||  // ✅ THÊM - Cho phép API user
                lowerURI.contains("/api/admin/account") || // ✅ THÊM - Cho phép API admin
                lowerURI.contains("/home/") ||          // ✅ THÊM - Cho phép trang home
                lowerURI.contains("/admin/");           // ✅ THÊM - Cho phép trang admin

        if (isPublic) {
            chain.doFilter(request, response);
            return;
        }

        // 🟢 BƯỚC 3: KIỂM TRA PHÂN QUYỀN & CHẶN ACCESS
        HttpSession session = req.getSession(false);
        String role = (session != null) ? (String) session.getAttribute("role") : null;

        // Bật log để debug
        System.out.println("🔍 [AuthFilter DEBUG] URL: " + lowerURI + " | Role: " + role);

        // Kiểm tra đường dẫn Admin - CHỈ CHẶN API ADMIN (không chặn trang HTML)
        boolean isAdminApi = lowerURI.contains("/api/admin/");
        if (isAdminApi) {
            if (role == null || !role.equalsIgnoreCase("ADMIN")) {
                System.out.println("🚨 [AuthFilter CHẶN API ADMIN] URL: " + lowerURI + " | Role: " + role);
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                resp.setContentType("application/json;charset=UTF-8");
                resp.getWriter().write("{\"error\": \"Bạn không có quyền thực hiện thao tác này!\"}");
                return;
            }
        }

        // Kiểm tra người dùng đã đăng nhập chưa
        if (role != null) {
            chain.doFilter(request, response);
        } else {
            // Nếu là API mà chưa đăng nhập
            if (lowerURI.startsWith(req.getContextPath().toLowerCase() + "/api/")) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.setContentType("application/json;charset=UTF-8");
                resp.getWriter().write("{\"error\": \"Vui lòng đăng nhập!\"}");
                return;
            }

            // Nếu là trang web, redirect về login
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