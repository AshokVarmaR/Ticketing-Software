package com.ts.configs;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ts.dtos.EmployeeResponse;
import com.ts.dtos.LoginRequest;
import com.ts.dtos.LoginResponse;
import com.ts.models.Employee;
import com.ts.repositories.EmployeeRepository;
import com.ts.services.EmployeeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService empService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

    	System.out.println(request.toString());
    	
        // username = email OR employeeCode
        var r = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        System.out.println(r.toString());

        // Fetch employee using same identifier
        Employee employee = employeeRepository
                .findByEmailOrEmployeeCode(
                        request.getUsername(),
                        request.getUsername()
                )
                .orElseThrow();

        String token = jwtUtil.generateToken(employee);

        EmployeeResponse employeeResponse = empService.mapToResponse(employee);

        return new LoginResponse(token, employeeResponse);
    }
}
