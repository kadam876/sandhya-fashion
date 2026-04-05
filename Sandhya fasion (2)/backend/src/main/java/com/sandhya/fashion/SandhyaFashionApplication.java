package com.sandhya.fashion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.security.Security;

@SpringBootApplication
public class SandhyaFashionApplication {

    public static void main(String[] args) {
        // Fix for MongoDB Atlas SSL Exception on Java 21+
        Security.setProperty("jdk.tls.disabledAlgorithms", "SSLv3, RC4, DES, MD5withRSA, DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL");
        Security.setProperty("jdk.tls.legacyAlgorithms", "");
        System.setProperty("jdk.tls.client.protocols", "TLSv1.2,TLSv1.3");

        // Empty PORT in the environment breaks server.port binding; force a valid default before startup.
        String portEnv = System.getenv("PORT");
        if (portEnv != null && portEnv.isBlank()) {
            System.setProperty("server.port", "8080");
        }

        SpringApplication.run(SandhyaFashionApplication.class, args);
    }

}
