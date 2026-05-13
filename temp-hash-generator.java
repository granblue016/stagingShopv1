import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String adminPassword = "Admin123";
        String userPassword = "User123";
        
        String adminHash = encoder.encode(adminPassword);
        String userHash = encoder.encode(userPassword);
        
        System.out.println("Admin123 hash: " + adminHash);
        System.out.println("User123 hash: " + userHash);
        
        // Test verification
        System.out.println("Admin123 verifies: " + encoder.matches(adminPassword, adminHash));
        System.out.println("User123 verifies: " + encoder.matches(userPassword, userHash));
    }
}
