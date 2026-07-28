package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Repository.AdminAccountRepository;
import com.duanweb.duanweb.Repository.AuthRepository;
import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final AdminAccountRepository adminAccountRepository;

    public AuthService(AuthRepository authRepository, AdminAccountRepository adminAccountRepository) {
        this.authRepository = authRepository;
        this.adminAccountRepository = adminAccountRepository;
    }

    public User login(String username, String password) {
        return authRepository.findByUsernameAndPassword(username, password).orElse(null);
    }

    public AdminAccount loginAdmin(String username, String password) {
        return adminAccountRepository.findByUsernameAndPassword(username, password).orElse(null);
    }

    public boolean checkUserExists(String value) {
        return authRepository.existsByUsernameOrEmail(value, value);
    }

    public boolean checkUsernameExists(String username) {
        return adminAccountRepository.existsByUsername(username);
    }

    public User register(User user) {
        return authRepository.save(user);
    }

    public User addUser(User user) {
        return authRepository.save(user);
    }

    public boolean deleteUser(Integer userId) {
        if (!authRepository.existsById(userId)) {
            return false;
        }
        authRepository.deleteById(userId);
        return true;
    }

    public AdminAccount addAdminAccount(AdminAccount account) {
        return adminAccountRepository.save(account);
    }

    public boolean deleteAdminAccount(Integer accountId) {
        if (!adminAccountRepository.existsById(accountId)) {
            return false;
        }
        adminAccountRepository.deleteById(accountId);
        return true;
    }
}