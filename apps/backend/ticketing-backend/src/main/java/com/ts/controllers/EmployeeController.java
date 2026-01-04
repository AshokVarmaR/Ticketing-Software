package com.ts.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ts.dtos.EmployeeCreateRequest;
import com.ts.dtos.EmployeeResponse;
import com.ts.enums.Role;
import com.ts.services.EmployeeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    
    @GetMapping("/roles")
    public Role[] fetchRoles() {
    	return Role.values();
    }

    @PostMapping
    public EmployeeResponse createEmployee(
            @RequestBody EmployeeCreateRequest request
    ) {
        return employeeService.createEmployee(request);
    }

    @GetMapping
    public List<EmployeeResponse> getAllEmployees() {
        return employeeService.getAll();
    }
    
    @GetMapping("/role/{role}")
    public List<EmployeeResponse> getAllEmployees(@PathVariable Role role) {
        return employeeService.getEmployeesByRole(role);
    }
    
    
    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(@PathVariable Long id) {
    	return employeeService.findById(id);
    }
    
    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee( @PathVariable Long id,
            @RequestBody EmployeeCreateRequest request
    ) {
        return employeeService.updateEmployee(id,request);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployeeById(@PathVariable Long id) {
    	employeeService.deleteById(id);
    	return ResponseEntity.ok("Employee removed successfully");
    }
    
    
    
	@PostMapping("/otp/send")
	public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> jsonObject) {
	    
	    String email = jsonObject.get("email");
	    boolean isGenerated = employeeService.generateOtp(email);

	    Map<String, String> response = new HashMap<>();
	    
	    if (isGenerated) {
	        response.put("message", "OTP Generated Successfully");
	        return ResponseEntity.ok(response);
	    } else {
	        response.put("error", "Failed to generate OTP");
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	    }
	}
	
	@PostMapping("/otp/verify")
	public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> jsonObject) {
	    
	    String email = jsonObject.get("email");
	    String otp = jsonObject.get("otp");

	    boolean isVerified = employeeService.verifyOtp(email, otp);
	    Map<String, String> response = new HashMap<>();

	    if (isVerified) {
	        response.put("message", "OTP verified successfully");
	        return ResponseEntity.ok(response);
	    } else {
	        response.put("message", "Invalid OTP");
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	    }
	}

	
	@PostMapping("/password/reset")
	public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> jsonObject) {
	    
	    String email = jsonObject.get("email");
	    String password = jsonObject.get("password");

	    boolean isReset = employeeService.resetPassword(email, password);
	    Map<String, String> response = new HashMap<>();

	    if (isReset) {
	        response.put("message", "Password reset successfully");
	        return ResponseEntity.ok(response);
	    } else {
	        response.put("message", "Password didn't reset");
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	    }
	}

    
}


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               