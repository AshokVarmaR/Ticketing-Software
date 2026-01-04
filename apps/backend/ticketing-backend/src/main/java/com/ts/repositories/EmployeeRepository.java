package com.ts.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.dtos.EmployeeResponse;
import com.ts.enums.Role;
import com.ts.models.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

	Optional<Employee> findByEmail(String email);

	Optional<Employee> findByEmailOrEmployeeCode(String username, String username2);

	Optional<Employee> findByEmployeeCode(String employeeCode);

	List<Employee> findAllByRole(Role role);
	
	Optional<Employee> findByRole(Role role);

}
