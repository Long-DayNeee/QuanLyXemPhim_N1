package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Repository.AuthRepository;
import com.duanweb.duanweb.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final AuthRepository authRepository;

    public AuthService(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }

    public User login(String username, String password) {
        return authRepository
                .findByUsernameAndPassword(username, password)
                .orElse(null);
    }

    public User loginAdmin(String username, String password) {

        User user = authRepository
                .findByUsernameAndPassword(username, password)
                .orElse(null);

        if (user != null
                && user.getRole() != null
                && user.getRole().equalsIgnoreCase("admin")) {
            return user;
        }

        return null;
    }

    public boolean checkUserExists(String value) {
        return authRepository.existsByUsernameOrEmail(value, value);
    }

    public User register(User user) {
        return authRepository.save(user);
    }

    public User addUser(User user) {
        return authRepository.save(user);
    }

    // LẤY TẤT CẢ TÀI KHOẢN
    public List<User> getAllAccounts() {
        return authRepository.findAll();
    }

    // XÓA TÀI KHOẢN
    public boolean deleteUser(Integer userId) {
        if (!authRepository.existsById(userId)) {
            return false;
        }

        authRepository.deleteById(userId);
        return true;
    }
}