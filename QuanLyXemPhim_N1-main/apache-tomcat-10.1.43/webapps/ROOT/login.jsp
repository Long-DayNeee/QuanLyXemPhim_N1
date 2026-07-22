<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Đăng nhập</title>
</head>
<body>
<h2>ĐĂNG NHẬP</h2>

<p style="color: red;">${error}</p>
<p style="color: green;">${message}</p>

<form action="login" method="post">
    Tài khoản: <input type="text" name="username" required><br><br>
    Mật khẩu: <input type="password" name="password" required><br><br>
    <button type="submit">Đăng nhập</button>
</form>

<p>Chưa có tài khoản? <a href="register">Đăng ký</a></p>
</body>
</html>