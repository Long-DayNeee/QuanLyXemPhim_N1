<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<jsp:useBean id="now" class="java.util.Date"/>

<!DOCTYPE html>
<html>
<head>
    <title>Trang chủ</title>
</head>
<body>

<h1 style="text-align: center">${message}</h1>
<hr>
<h3>1.Cấu trúc rẽ nhánh</h3>
<form method="get" action="">
    Nhập điểm:
    <input type="number" name="score" step="0.5"/>
    <button type="submit">Xếp loại</button>
</form>

<c:if test="${not empty param.score}">
    <p>Điểm nhập: ${param.score}</p>

    <c:if test="${param.score < 0 || param.score > 10}">
        <span style="color: red">Điểm không hợp lệ (0-10)</span>
    </c:if>

    <c:if test="${param.score >= 0 && param.score <= 10}">
        <c:choose>
            <c:when test="${param.score >= 8.5}">
                <span style="color: green">Giỏi</span>
            </c:when>
            <c:when test="${param.score >= 7}">
                <span style="color: blue">Khá</span>
            </c:when>
            <c:when test="${param.score >= 5}">
                <span style="color: pink">Trung bình</span>
            </c:when>
            <c:otherwise>
                <span style="color: red">Yếu</span>
            </c:otherwise>
        </c:choose>
    </c:if>
</c:if>

<h3>2.Cấu trúc lặp</h3>
<h4>2.1 Map</h4>
<table style="width: 40%; text-align: center ">
    <tr>
        <th>Mã sinh viên</th>
        <th>Họ và tên</th>
        <th>Điểm số</th>
    </tr>

    <c:forEach var="entry" items="${studentMap}">
        <tr>
            <td>${entry.key}</td>
            <td>${entry.value.fullName}</td> <!-- sửa FullName -->
            <td>${entry.value.score}</td>
        </tr>
    </c:forEach>
</table>

<h4>2.2 List</h4>
<table style="width:40%; text-align:center ">
    <tr>
        <th>Mã sinh viên</th>
        <th>Họ và tên</th>
        <th>Điểm số</th>
    </tr>
    <c:forEach var="item" items="${studentList}">
        <tr>
            <td>${item.id}</td>
            <td>${ item.name}</td>
            <td>${ item.score}</td>
        </tr>
    </c:forEach>
</table>

<h3>3. c:forTokens</h3>
<h4>Tách chuỗi đơn giản</h4>
<c:forTokens var="word" items="Java,PHP,C#,Python,JavaScript, Labview" delims=",">
    <p style="padding-left: 3rem">${word}</p>
</c:forTokens>

<h4>3.2 c:forTokens với Selection</h4>
<label>Chọn quốc gia:</label>
<select name="country">
    <c:forTokens var="c" delims="," items="Viet Nam, Hoa Ky, Nhat Ban,Han Quoc, Phap">
        <option value="${c}">${c}</option>
    </c:forTokens>
</select>

<h4>3.3 c:forTokens với Radio</h4>
<label style="padding-left:3rem;">Giới tính</label>
<c:forTokens var="gender" delims="," items="Nam, Nữ, Khác">
    <label style="margin-right:10px">
        <input type="radio" name="gender" value="${gender}">
            ${gender}
    </label>
</c:forTokens>

<h3>4. Thuộc tính varStatus của c:forEach/c:forTokens</h3>
<c:forEach var="item" items="${['Java','PHP','C#','Python','JavaScript', 'Labview']}" varStatus="status">
    <p style="padding-left:3rem ">
        Index:${status.index}|
        Count:${status.count}|
        First:${status.first}|
        Last:${status.last}
    </p>
</c:forEach>

<h3>5. c:set và c:remove</h3>
<div style="padding-left: 3rem;">
    <form method="get">
        <button type="submit" name="action" value="set">Set tài khoản</button>
        <button type="submit" name="action" value="remove">Remove tài khoản</button>
    </form>

    <c:if test="${param.action == 'set'}">
        <c:set var="username" value="admin" scope="session"/>
        <c:set var="password" value="123@123" scope="session"/>
    </c:if>

    <c:if test="${param.action == 'remove'}">
        <c:remove var="username"  scope="session"/>
        <c:remove var="password"  scope="session"/>
    </c:if>

    <c:if test="${not empty sessionScope.username}">
        <p style="color:purple">Đã đăng nhập với tài khoản:</p>
        <p>Username:${sessionScope.username}</p>
        <p>Password:${sessionScope.password}</p>
    </c:if>

    <c:if test="${empty sessionScope.username}">
        <p style="color: blue">Session rỗng (chưa đăng nhập hoặc bị xóa)</p>
    </c:if>
</div>

<h4>6. c:url</h4>
<c:url value="/auth/register" var="registerUrl"/>
<button type="button" onclick="location.href='${registerUrl}'" style="margin-left: 3rem">Đăng ký</button>

<h4>7. c:import</h4>
<%--<c:import url="layout/footer.jsp"/>--%>

<h4>8.Thư viện định dạng</h4>
<div style="margin-left: 3rem">
    <h4>8.1 Định dạng kiểu số</h4>
    số gốc: <c:set var="number" value="1234567"/>${number}<br>
    <ul>
        <li>Hiển thị trang có dấu phân cách: <fmt:formatNumber value="${number}"/></li>
        <li>Hiển thị tiền tệ: <fmt:formatNumber value="${number}" type="currency"/></li> <!-- sửa currencv -->
        <li>Hiển thị dạng phần trăm: <fmt:formatNumber value="${0.25}" type="percent"/></li>
        <li>Hiển thị dạng thập phân: <fmt:formatNumber value="${1.2345}" maxFractionDigits="3"/></li>
    </ul>

    <h4>8.2 Định dạng kiểu thời gian</h4>
    Ngày gốc: ${now}
    <ul>
        <li>Định dạng(dd/MM/yyyy): <fmt:formatDate value="${now}" pattern="dd/MM/yyyy" /></li>
        <li>Hiển thị ngày và giờ: <fmt:formatDate value="${now}" pattern="dd/MM/yyyy HH:mm:ss"/></li>
        <li>Hiển thị giờ: <fmt:formatDate value="${now}" pattern="HH:mm:ss" /></li>
    </ul>

    <h4>8.3 Định dạng theo địa phương</h4>
    <fmt:setLocale value="vi_VN"/>
    <fmt:formatNumber value="${number}" type="currency"/>

    <fmt:setLocale value="en_US"/>
    <fmt:formatNumber value="${number}" type="currency"/>
</div>

<h3>9. Thu vien ham</h3>
    <div style="margin-left: 3rem;">
        <c:set var="str" value="VN dep lam anh chi em oi"/>
        <p>${str}</p>
        <ul>
            <li>Do dai chuoi: ${fn:length(str)}</li>
            <li>Ky tu hoa: ${fn:toUpperCase(str)}</li>
            <li>Ky tu thuong: ${fn:toLowerCase(str)}</li>
            <li>Có chứa từ "việt": ${fn:contains(str, "Việt")}</li>
            <li>Thay từ "đẹp thành tuyệt vời": ${fn:replace(str, "dep", "tuyet voi")}</li>
            <li>Cắt 10 ký tự: ${fn:substring (str, 0,10)}</li>


        </ul>
    </div>
<c:import url="layout/footer.jsp"/>

</body>
</html>