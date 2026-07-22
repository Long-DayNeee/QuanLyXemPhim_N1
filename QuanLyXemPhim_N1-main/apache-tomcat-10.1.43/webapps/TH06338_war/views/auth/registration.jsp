<%--
  Created by IntelliJ IDEA.
  User: ASUS
  Date: 3/19/2026
  Time: 10:42 AM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Đăng ký</title>
</head>
<body>
    <h3>Thong tin dang ky</h3>
    <hr>
 <form action="/auth/register" method="post" >
    <label>Ten dang nhap</label>
     <input type="text" name="user name" id="username"><br><br>

     <label>Mat khau</label>
     <input type="text" name="pass word" id="pass word"><br><br>

     <label>Ho va ten</label>
     <input type="text" name="full_name" id="full_name"><br><br>

     <label>Email</label>
     <input type="text" name="email" id="email"><br><br>

     <label>Ngay sinh</label>
     <input type="date" name="birthdate" id="bithdate"><br><br>

     <label>Gioi tinh</label>
     <input type="radio" name="gender" value="male">Nam
     <input type="radio" name="gender" value="male">Nu
     <br><br>

     <label>So thich</label>
    <input type="checkbox" name="hobbies" value="reading">Doc sach
     <input type="checkbox" name="hobbies" value="music">Nghe nhac
     <input type="checkbox" name="hobbies" value="sport">The thao
    <br><br>

     <label>Quoc gia</label>
     <select name="country">
         <option value="VN">Viet Nam</option>
         <option value="MAS">Malaysia</option>
         <option value="SING">Singapore</option>
     </select>
     <br><br>

     <label>Anh dai dien</label>
     <input type="file" name="image">
     <br><br>

     <label>Mo ta khac</label>
     <textarea name="desc", id="desc" rows="3" cols="40" placeholder="Mo ta cac thong tin khac"></textarea>
     <br><br>

     <button type="submit">Dang ky</button>
     <button type="reset">Xoa du lieu</button>


 </form>
</body>
</html>
