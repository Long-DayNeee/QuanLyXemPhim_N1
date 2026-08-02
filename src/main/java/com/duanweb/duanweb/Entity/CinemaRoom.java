package com.duanweb.duanweb.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
// Use the existing PostgreSQL table name. Without this, Spring's naming
// strategy can target a separate `cinema_room` table while Showtime's foreign
// key correctly references the legacy `cinemaroom` table.
@Table(name = "cinemaroom")
public class CinemaRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "roomid")
    private Integer roomID;

    @Column(name = "tenphong")
    private String tenPhong;

    @Column(name = "tongchongoi")
    private Integer tongChoNgoi;

    @Column(name = "trangthai")
    private String trangThai;

    public Integer getRoomID() {
        return roomID;
    }

    public void setRoomID(Integer roomID) {
        this.roomID = roomID;
    }

    public String getTenPhong() {
        return tenPhong;
    }

    public void setTenPhong(String tenPhong) {
        this.tenPhong = tenPhong;
    }

    public Integer getTongChoNgoi() {
        return tongChoNgoi;
    }

    public void setTongChoNgoi(Integer tongChoNgoi) {
        this.tongChoNgoi = tongChoNgoi;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
