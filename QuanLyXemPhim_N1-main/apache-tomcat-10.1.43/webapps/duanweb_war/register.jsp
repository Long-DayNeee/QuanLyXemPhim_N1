<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Đăng ký</title>
</head>
<body>
<h2>ĐĂNG KÝ</h2>

<p style="color: red;">${error}</p>

<form action="register" method="post">
    Họ và tên: <input type="text" name="fullName" required><br><br>
    Tài khoản: <input type="text" name="username" required><br><br>
    Mật khẩu: <input type="password" name="password" required><br><br>
    <button type="submit">Đăng ký</button>
</form>

<p>Đã có tài khoản? <a href="login">Đăng nhập</a></p>
</body>
</html>