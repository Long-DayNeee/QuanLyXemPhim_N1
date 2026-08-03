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
                           lowerURI.endsWith(".ttf");

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
                           lowerURI.contains("/api/showtimes");

        if (isPublic) {
            chain.doFilter(request, response);
            return;
        }

        // 🟢 BƯỚC 3: KIỂM TRA PHÂN QUYỀN & CHẶN ACCESS
        HttpSession session = req.getSession(false);
        String role = (session != null) ? (String) session.getAttribute("role") : null;

        // Bật log này để kiểm tra trên Console xem URL nào bị rơi vào vòng kiểm tra Auth
        System.out.println("🚨 [AuthFilter CHẶN TRUY CẬP] URL: " + lowerURI + " | Role: " + role);

        // Kiểm tra đường dẫn Admin
        boolean isAdminPath = lowerURI.contains("/admin/") || lowerURI.contains("/api/admin/");
        if (isAdminPath) {
            if (role == null || !role.equalsIgnoreCase("ADMIN")) {
                if (lowerURI.startsWith(req.getContextPath().toLowerCase() + "/api/")) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    resp.setContentType("application/json;charset=UTF-8");
                    resp.getWriter().write("{\"error\": \"Bạn không có quyền thực hiện thao tác này!\"}");
                    return;
                }
                resp.sendRedirect(req.getContextPath() + "/Home/index.html?error=" 
                        + encode("Bạn không có quyền truy cập trang Admin!"));
                return;
            }
        }

        // Kiểm tra người dùng đã đăng nhập chưa
        if (role != null) {
            chain.doFilter(request, response);
        } else {
            if (lowerURI.startsWith(req.getContextPath().toLowerCase() + "/api/")) {
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