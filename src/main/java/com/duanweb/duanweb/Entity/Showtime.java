package com.duanweb.duanweb.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "Showtime")
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShowTimeID")
    private Integer showTimeID;

    @Column(name = "MovieID")
    private Integer movieID;

    @Column(name = "RoomID")
    private Integer roomID;

    @Column(name = "ThoiGianBatDau")
    private LocalDateTime thoiGianBatDau;

    @Column(name = "ThoiGianKetThuc")
    private LocalDateTime thoiGianKetThuc;

    public Integer getShowTimeID() {
        return showTimeID;
    }

    public void setShowTimeID(Integer showTimeID) {
        this.showTimeID = showTimeID;
    }

    public Integer getMovieID() {
        return movieID;
    }

    public void setMovieID(Integer movieID) {
        this.movieID = movieID;
    }

    public Integer getRoomID() {
        return roomID;
    }

    public void setRoomID(Integer roomID) {
        this.roomID = roomID;
    }

    public LocalDateTime getThoiGianBatDau() {
        return thoiGianBatDau;
    }

    public void setThoiGianBatDau(LocalDateTime thoiGianBatDau) {
        this.thoiGianBatDau = thoiGianBatDau;
    }

    public LocalDateTime getThoiGianKetThuc() {
        return thoiGianKetThuc;
    }

    public void setThoiGianKetThuc(LocalDateTime thoiGianKetThuc) {
        this.thoiGianKetThuc = thoiGianKetThuc;
    }
}