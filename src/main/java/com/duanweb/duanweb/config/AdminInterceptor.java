package com.duanweb.duanweb.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Chống cache
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        HttpSession session = request.getSession(false);
        String role = (session != null) ? (String) session.getAttribute("role") : null;

        // Nếu KHÔNG phải ADMIN -> Ngắt ngay request và chuyển hướng về trang chủ
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            String errorMsg = URLEncoder.encode("Bạn không có quyền truy cập trang Admin!", StandardCharsets.UTF_8);
            response.sendRedirect(request.getContextPath() + "/Home/index.html?error=" + errorMsg);
            return false; // STOP, không trả file HTML về trình duyệt
        }

        return true; // Cho phép đi tiếp nếu là ADMIN
    }
}