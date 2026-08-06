package com.duanweb.duanweb.Service;

import com.duanweb.duanweb.Repository.AdminAccountRepository;
import com.duanweb.duanweb.Repository.AuthRepository;
import com.duanweb.duanweb.model.AdminAccount;
import com.duanweb.duanweb.model.User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public List<User> getAllUsers() {
        return authRepository.findAll();
    }

    public List<AdminAccount> getAllAdmins() {
        return adminAccountRepository.findAll();
    }

    // ==========================
    // UPDATE ADMIN
    // ==========================
    public AdminAccount updateAdminAccount(AdminAccount account) {

        AdminAccount old = adminAccountRepository
                .findById(account.getAccountID())
                .orElse(null);

        if (old == null) {
            return null;
        }

        old.setUsername(account.getUsername());
        old.setFullName(account.getFullName());
        old.setEmail(account.getEmail());
        old.setRole(account.getRole());

        // giữ mật khẩu cũ
        old.setPassword(old.getPassword());

        return adminAccountRepository.save(old);
    }
    // ==========================
    // UPDATE USER
    // ==========================
    public User updateUser(User user) {

        User old = authRepository.findById(user.getId()).orElse(null);

        if (old == null) {
            return null;
        }

        old.setUsername(user.getUsername());
        old.setFullName(user.getFullName());
        old.setEmail(user.getEmail());
        old.setRole(user.getRole());

        // giữ nguyên mật khẩu
        old.setPassword(old.getPassword());

        return authRepository.save(old);
    }

    public User getUserById(int id) {
        return authRepository.findById(id).orElse(null);
    }

    public AdminAccount getAdminById(int id) {
        return adminAccountRepository.findById(id).orElse(null);
    }

    // ==========================
    // DASHBOARD
    // ==========================

    public List<User> getCustomers() {
        return authRepository.findByRole("USER");
    }

    public List<AdminAccount> getStaffs() {
        return adminAccountRepository.findByRole("STAFF");
    }

    public List<AdminAccount> getAdmins() {
        return adminAccountRepository.findByRole("ADMIN");
    }

    public Map<String, Long> getDashboardStats() {

        Map<String, Long> stats = new HashMap<>();

        long customerCount = authRepository.countByRole("USER");
        long staffCount = adminAccountRepository.countByRole("STAFF");
        long adminCount = adminAccountRepository.countByRole("ADMIN");

        stats.put("totalAccount", customerCount + staffCount + adminCount);
        stats.put("totalCustomer", customerCount);
        stats.put("totalStaff", staffCount);
        stats.put("totalAdmin", adminCount);

        return stats;
    }
}