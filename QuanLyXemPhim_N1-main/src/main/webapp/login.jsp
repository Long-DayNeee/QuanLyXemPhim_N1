<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Đăng nhập</title>
    <style>
        body { font-family: Arial; background: #f0f2f5; display: flex; justify-content: center; padding-top: 50px; }
        .box { background: white; padding: 25px; border-radius: 8px; width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        input { width: 100%; padding: 8px; margin: 8px 0 15px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
        button { width: 100%; padding: 9px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>

<div class="box">
    <h3 style="text-align: center; margin-top: 0;">ĐĂNG NHẬP</h3>

    <p style="color: red; font-size: 13px;"><%= request.getAttribute("error") != null ? request.getAttribute("error") : "" %></p>
    <p style="color: green; font-size: 13px;"><%= request.getAttribute("message") != null ? request.getAttribute("message") : "" %></p>

    <form action="login" method="post">
        <label>Tài khoản</label>
        <input type="text" name="username" required>

        <label>Mật khẩu</label>
        <input type="password" name="password" required>

        <button type="submit">Đăng nhập</button>
    </form>

    <p style="text-align: center; font-size: 13px; margin-bottom: 0;">
        Chưa có tài khoản? <a href="register">Đăng ký</a>
    </p>
</div>

</body>
</html>