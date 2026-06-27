package com.zumovo.trading.controller;

import com.zumovo.trading.dto.AuthRequest;
import com.zumovo.trading.dto.AuthResponse;
import com.zumovo.trading.entity.User;
import com.zumovo.trading.repository.UserRepository;
import com.zumovo.trading.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user registration and JWT-based authentication.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User registration and login endpoints")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registers a new user account.
     *
     * @param request the registration request with username and password
     * @return 201 Created with success message
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        log.info("User registered: {}", request.getUsername());

        // Generate token for auto-login
        String token = jwtTokenProvider.generateToken(user.getUsername());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request the login request with username and password
     * @return JWT token with expiration information
     */
    @PostMapping("/login")
    @Operation(summary = "Authenticate and get JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication.getName());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .username(authentication.getName())
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .build();

        log.info("User logged in: {}", request.getUsername());
        return ResponseEntity.ok(response);
    }
}
