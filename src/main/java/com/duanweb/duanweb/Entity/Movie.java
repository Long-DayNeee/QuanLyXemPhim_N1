package com.duanweb.duanweb.Entity;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Movie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MovieID")
    private Integer movieID;

    @Column(name = "TieuDe")
    private String tieuDe;

    @Column(name = "DoTuoi")
    private String doTuoi;

    @Column(name = "ThoiLuong")
    private Integer thoiLuong;

    @Column(name = "NgayKhoiChieu")
    private LocalDate ngayKhoiChieu;

    @Column(name = "TheLoai")
    private String theLoai;

    @Column(name = "MieuTa")
    private String mieuTa;

    @Column(name = "PosterUrl")
    private String posterUrl;

    @Column(name = "TrailerID")
    private String trailerID;

    @Column(name = "NgonNgu")
    private String ngonNgu;

    @Column(name = "GiaVe")
    private BigDecimal giaVe;

    @Column(name = "DaoDien")
    private String daoDien;

    @Column(name = "DienVien")
    private String dienVien;
}
