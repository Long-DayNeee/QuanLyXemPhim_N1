
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <h2> Danh sách sinh viên</h2>
    <hr>
<table style=" text-align: center ;border: 1px; width: 40%;">
    <tr>
        <th>STT</th>
        <th>Mã sinh viên</th>
        <th> Chi tiết</th>
    </tr>
    <tr>
        <td>1</td>
        <td>TPh001</td>
        <td><a href="?id=TPh001">chi tiết</a></td>
    </tr>
    <tr>
        <td>2</td>
        <td>TPh002</td>
        <td><a href="?id=TPh002">chi tiết</a></td>
    </tr>
    <tr>
        <td>3</td>
        <td>TPh003</td>
        <td><a href="?id=TPh003">chi tiết</a></td>
    </tr>
</table>
<%
    String id = request.getParameter("id");
    if (id != null){
%>
<jsp:forward page="detail.jsp">
    <jsp:param name="id" value="<%=id%>"/>
</jsp:forward>

<%
    }
%>
