package com.ts.dtos;

import com.ts.enums.Role;
import com.ts.models.Employee;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeSummary {
    private Long id;
    private String name;
    private String email;
    private Role role;
    
    public static EmployeeSummary toDto(Employee emp) {
    	return new EmployeeSummary(emp.getId(),emp.getName(),emp.getEmail(),emp.getRole());
    }
}
