package com.sandhya.fashion.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private UserDto user;
    private boolean success;
    private String error;

    @Data
    public static class UserDto {
        private String id;
        private String email;
        private String name;
        private String role;
        private String shopName;
    }
}
