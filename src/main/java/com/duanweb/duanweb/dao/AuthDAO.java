package com.duanweb.duanweb.dao;

import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuthDAO {

    private final JdbcTemplate jdbcTemplate;

    public AuthDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    //================ LOGIN =================

    public User login(String username, String password) {

        String sql = """
                SELECT *
                FROM user_account
                WHERE ten_dang_nhap=? AND mat_khau=?
                """;

        try {

            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {

                User user = new User();

                user.setId(rs.getInt("userid"));
                user.setUsername(rs.getString("ten_dang_nhap"));
                user.setPassword(rs.getString("mat_khau"));
                user.setFullName(rs.getString("ho_ten"));
                user.setEmail(rs.getString("email"));
                user.setRole(rs.getString("role"));

                return user;

            }, username, password);

        } catch (EmptyResultDataAccessException e) {

            return null;

        }
    }

    //================ REGISTER =================

    public boolean register(User user) {

        String sql = """
                INSERT INTO user_account
                (ten_dang_nhap,mat_khau,ho_ten,email,role)
                VALUES(?,?,?,?,?)
                """;

        return jdbcTemplate.update(
                sql,
                user.getUsername(),
                user.getPassword(),
                user.getFullName(),
                user.getEmail(),
                "USER"
        ) > 0;

    }

    //================ ADD USER =================

    public boolean addUser(User user) {

        return register(user);

    }

    //================ DELETE USER =================

    public boolean deleteUser(int id) {

        String sql = """
                DELETE FROM user_account
                WHERE userid=?
                """;

        return jdbcTemplate.update(sql, id) > 0;

    }

    //================ CHECK USER =================

    public boolean checkUserExists(String value) {

        String sql = """
                SELECT COUNT(*)
                FROM user_account
                WHERE ten_dang_nhap=? OR email=?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                value,
                value
        );

        return count != null && count > 0;

    }

    //================ CHECK ADMIN =================

    public boolean checkUsernameExists(String username) {

        String sql = """
                SELECT COUNT(*)
                FROM adminaccount
                WHERE tennguoidung=?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                username
        );

        return count != null && count > 0;

    }

    //================ ADMIN LOGIN =================

    public LoginResult authenticate(String username, String password) {

        String sql = """
                SELECT matkhau
                FROM adminaccount
                WHERE tennguoidung=?
                """;

        try {

            String pass = jdbcTemplate.queryForObject(
                    sql,
                    String.class,
                    username
            );

            if (pass == null) {
                return LoginResult.INVALID_PASSWORD;
            }

            return pass.equals(password)
                    ? LoginResult.OK
                    : LoginResult.INVALID_PASSWORD;

        } catch (EmptyResultDataAccessException e) {

            return LoginResult.USER_NOT_FOUND;

        }

    }

    //================ ADD ADMIN =================

    public boolean addAdminAccount(AdminAccount account) {

        String sql = """
                INSERT INTO adminaccount
                (tennguoidung,matkhau,vaitro)
                VALUES(?,?,?)
                """;

        return jdbcTemplate.update(
                sql,
                account.getUsername(),
                account.getPassword(),
                account.getRole()
        ) > 0;

    }

    //================ DELETE ADMIN =================

    public boolean deleteAdminAccount(int id) {

        String sql = """
                DELETE FROM adminaccount
                WHERE adminid=?
                """;

        return jdbcTemplate.update(sql, id) > 0;

    }

    //================ ENUM =================

    public enum LoginResult {

        OK,
        USER_NOT_FOUND,
        INVALID_PASSWORD

    }

}