<%@ page import="java.util.List" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>List</title>
</head>
<body>
<h2> Danh sach nguoi dung</h2>
<hr>
<table style=" width: 40%">
    <tr>
        <th>Ho va ten</th>
    </tr>
    <%
        List<String>users = (List<String>) request.getAttribute("user");
        for(String user : users){
    %>
        <tr>
            <td><%= user %></td>
        </tr>
    <%
        }
    %>
</table>
</body>
</html>
