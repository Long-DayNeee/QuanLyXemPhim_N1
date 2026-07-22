package com.duanweb.duanweb.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnection {
    private static final Properties DB_PROPS = loadProperties();

    private static Properties loadProperties() {
        Properties props = new Properties();
        try (InputStream input = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input == null) {
                throw new IllegalStateException("Không tìm thấy file db.properties trong classpath");
            }
            props.load(input);
            Class.forName(props.getProperty("jdbc.driver"));
            return props;
        } catch (IOException | ClassNotFoundException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                DB_PROPS.getProperty("jdbc.url"),
                DB_PROPS.getProperty("jdbc.username"),
                DB_PROPS.getProperty("jdbc.password"));
    }
}