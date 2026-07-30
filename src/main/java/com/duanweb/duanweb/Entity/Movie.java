package com.duanweb.duanweb.Entity;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movieid")
    private Integer movieID;

    @Column(name = "tieude", nullable = false)
    private String tieuDe;

    @Column(name = "dotuoi")
    private String doTuoi;

    @Column(name = "thoiluong")
    private Integer thoiLuong;

    @Column(name = "ngaykhoichieu")
    private LocalDate ngayKhoiChieu;

    @Column(name = "theloai")
    private String theLoai;

    @Column(name = "mieuta")
    private String mieuTa;

    @Column(name = "posterurl")
    private String posterUrl;

    @Column(name = "trailerid")
    private String trailerID;

    @Column(name = "ngonngu")
    private String ngonNgu;

    @Column(name = "giave")
    private BigDecimal giaVe;

    @Column(name = "daodien")
    private String daoDien;

    @Column(name = "dienvien")
    private String dienVien;
}
