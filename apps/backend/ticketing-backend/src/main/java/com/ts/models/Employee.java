package com.ts.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.ts.enums.Role;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "employees",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "employeeCode")
    }
)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String employeeCode;

    private String name;

    private String email;

    private String password;
    
    private String phone;

    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Boolean isActive = true;

    private LocalDateTime createdAt;
}
