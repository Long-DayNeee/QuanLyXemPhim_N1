package com.duanweb.duanweb.Repository;

import com.duanweb.duanweb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsernameAndPassword(String username, String password);

    boolean existsByUsernameOrEmail(String username, String email);
}