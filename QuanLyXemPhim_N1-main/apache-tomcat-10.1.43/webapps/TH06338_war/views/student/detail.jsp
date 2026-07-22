
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <h2>Chi tiet</h2>
    <hr>
    <%
        String id = request.getParameter("id");
        if("TPh001".equals(id)){
    %>
    <p>Ma sinh vien: TPh001</p>
    <p>Ho va ten: Nguyen Khanh Thi</p>
    <p>Ngay sinh : 20/10/2008</p>
    <p>Gioi tinh: Nu</p>
    <P>Chuyen nganh: Cong nghe thong tin</P>
    <p>Diem:8.5</p>

    <%
        }else if ("TPh002".equals(id)){
    %>
    <p>Ma sinh vien: TPh002</p>
    <p>Ho va ten: Nguyen Khanh Linh </p>
    <p>Ngay sinh : 20/11/2008</p>
    <p>Gioi tinh: Nu</p>
    <P>Chuyen nganh: Cong nghe thong tin</P>
    <p>Diem:9.5</p>

    <%
        }else if ("TPh003".equals(id)){
    %>
    <p>Ma sinh vien: TPh003</p>
    <p>Ho va ten: Nguyen Khanh San </p>
    <p>Ngay sinh : 11/11/2008</p>
    <p>Gioi tinh: Nam</p>
    <P>Chuyen nganh: Cong nghe thong tin</P>
    <p>Diem:8.0</p>
    <%
        }
    %>


