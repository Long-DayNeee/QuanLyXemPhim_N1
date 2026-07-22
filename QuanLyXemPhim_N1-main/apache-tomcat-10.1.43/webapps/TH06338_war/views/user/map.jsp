<%@ page import="java.util.Map" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Map</title>
</head>
<body>
<h2>Danh sach nguoi dung</h2>
<hr>
<table style=" width: 45%; text-align: center">
    <tr>
        <th>Ma</th>
        <th>Ho va ten</th>
    </tr>
    <%
        Map<String,String> user = (Map<String,String>)request.getAttribute("user");
        for(Map.Entry<String,String> entry: user.entrySet()){

    %>
    <tr>
        <td><%= entry.getKey( )%></td>
        <td><%= entry.getValue()%></td>
    </tr>
    <%
        }
    %>
</table>
</body>
</html>
