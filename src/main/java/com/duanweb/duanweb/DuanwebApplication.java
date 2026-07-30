package com.duanweb.duanweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan
public class DuanwebApplication {
    public static void main(String[] args) {
        SpringApplication.run(DuanwebApplication.class, args);
    }
}
