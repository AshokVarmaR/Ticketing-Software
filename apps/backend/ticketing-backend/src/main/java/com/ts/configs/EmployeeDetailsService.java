package com.ts.configs;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ts.models.Employee;
import com.ts.repositories.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Employee employee = employeeRepository
                .findByEmailOrEmployeeCode(username, username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Employee not found")
                );

        return new EmployeeDetails(employee);
    }
}
