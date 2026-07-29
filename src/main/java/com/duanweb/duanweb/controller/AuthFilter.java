package com.duanweb.duanweb.controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@WebFilter(filterName = "auth", value = {
        "/api/*",
        "/movie/*"
})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        HttpSession session = req.getSession();
        String requestURI = req.getRequestURI();
        String role = (String) session.getAttribute("role");
        if (requestURI.contains("/login") || requestURI.contains("/register")) {
            chain.doFilter(request, response);
            return;
        }
        if(role != null){
            if(role.equals("user")){
                chain.doFilter(request, response);
            }else if(role.equals("admin")){
                chain.doFilter(request, response);
            }
        }else{
            resp.sendRedirect(req.getContextPath() + "/Login/login.html?error="
                    + encode("Vui lòng đăng nhập!"));
        }
    }
    private String encode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }

    @Override
    public void destroy() {
    }
}
