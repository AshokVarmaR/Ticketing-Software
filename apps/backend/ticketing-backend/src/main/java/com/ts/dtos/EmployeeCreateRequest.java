package com.ts.dtos;

import java.time.LocalDate;

import com.ts.enums.Role;

import lombok.Data;

@Data
public class EmployeeCreateRequest {
    private String employeeCode;
    private String name;
    private String email;
    private String password;
    private LocalDate joiningDate;
    private String phone;
    private Role role;
    private Boolean isActive;
}
