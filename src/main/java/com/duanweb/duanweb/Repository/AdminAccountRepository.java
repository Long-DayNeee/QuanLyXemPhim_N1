package com.duanweb.duanweb.Repository;

import com.duanweb.duanweb.model.AdminAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminAccountRepository extends JpaRepository<AdminAccount, Integer> {

    Optional<AdminAccount> findByUsernameAndPassword(String username, String password);

    boolean existsByUsername(String username);
}