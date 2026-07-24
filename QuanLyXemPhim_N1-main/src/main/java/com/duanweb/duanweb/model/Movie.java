package com.duanweb.duanweb.model;

import java.math.BigDecimal;
import java.util.Date;

public class Movie {
    private int movieID;
    private String tieuDe;
    private String mieuTa;
    private String posterUrl;
    private String trailerId;
    private String theLoai;
    private int thoiLuong;
    private String doTuoi;
    private Date ngayChieu;
    private BigDecimal giaVe;
    private String ngonNgu;
    private String daoDien;
    private String dienVien;

    // 1. Constructor rỗng
    public Movie() {
    }

    // 2. Constructor đầy đủ tham số (Giúp tạo nhanh đối tượng khi cần)
    public Movie(int movieID, String tieuDe, String mieuTa, String posterUrl, String trailerId,
                 String theLoai, int thoiLuong, String doTuoi, Date ngayChieu,
                 BigDecimal giaVe, String ngonNgu, String daoDien, String dienVien) {
        this.movieID = movieID;
        this.tieuDe = tieuDe;
        this.mieuTa = mieuTa;
        this.posterUrl = posterUrl;
        this.trailerId = trailerId;
        this.theLoai = theLoai;
        this.thoiLuong = thoiLuong;
        this.doTuoi = doTuoi;
        this.ngayChieu = ngayChieu;
        this.giaVe = giaVe;
        this.ngonNgu = ngonNgu;
        this.daoDien = daoDien;
        this.dienVien = dienVien;
    }

    // ====== GETTERS & SETTERS ======
    public int getMovieID() {
        return movieID;
    }

    public void setMovieID(int movieID) {
        this.movieID = movieID;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getMieuTa() {
        return mieuTa;
    }

    public void setMieuTa(String mieuTa) {
        this.mieuTa = mieuTa;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getTrailerId() {
        return trailerId;
    }

    public void setTrailerId(String trailerId) {
        this.trailerId = trailerId;
    }

    public String getTheLoai() {
        return theLoai;
    }

    public void setTheLoai(String theLoai) {
        this.theLoai = theLoai;
    }

    public int getThoiLuong() {
        return thoiLuong;
    }

    public void setThoiLuong(int thoiLuong) {
        this.thoiLuong = thoiLuong;
    }

    public String getDoTuoi() {
        return doTuoi;
    }

    public void setDoTuoi(String doTuoi) {
        this.doTuoi = doTuoi;
    }

    public Date getNgayChieu() {
        return ngayChieu;
    }

    public void setNgayChieu(Date ngayChieu) {
        this.ngayChieu = ngayChieu;
    }

    public BigDecimal getGiaVe() {
        return giaVe;
    }

    public void setGiaVe(BigDecimal giaVe) {
        this.giaVe = giaVe;
    }

    public String getNgonNgu() {
        return ngonNgu;
    }

    public void setNgonNgu(String ngonNgu) {
        this.ngonNgu = ngonNgu;
    }

    public String getDaoDien() {
        return daoDien;
    }

    public void setDaoDien(String daoDien) {
        this.daoDien = daoDien;
    }

    public String getDienVien() {
        return dienVien;
    }

    public void setDienVien(String dienVien) {
        this.dienVien = dienVien;
    }
}