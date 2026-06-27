package com.zumovo.trading.dto;

import lombok.*;

/**
 * Response DTO returned after successful authentication.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String username;
    private long expiresIn;
}
