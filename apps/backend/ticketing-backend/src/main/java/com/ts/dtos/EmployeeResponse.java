package com.ts.dtos;

import java.time.LocalDate;

import com.ts.enums.Role;

import lombok.Builder;
import lombok.Data;

@Data
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Boolean isActive;
    private LocalDate joiningDate;
}
