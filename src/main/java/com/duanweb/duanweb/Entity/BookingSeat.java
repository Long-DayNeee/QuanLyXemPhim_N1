package com.duanweb.duanweb.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "BookingSeat")
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingSeatID")
    private Long bookingSeatID;

    @Column(name = "BookingID")
    private Long bookingID;

    @Column(name = "SeatID")
    private Integer seatID;

    @Column(name = "DonGia")
    private BigDecimal donGia;

    public Long getBookingSeatID() {
        return bookingSeatID;
    }

    public void setBookingSeatID(Long bookingSeatID) {
        this.bookingSeatID = bookingSeatID;
    }

    public Long getBookingID() {
        return bookingID;
    }

    public void setBookingID(Long bookingID) {
        this.bookingID = bookingID;
    }

    public Integer getSeatID() {
        return seatID;
    }

    public void setSeatID(Integer seatID) {
        this.seatID = seatID;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }
}