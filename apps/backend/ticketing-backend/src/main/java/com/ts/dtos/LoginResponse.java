package com.ts.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

	private String token;
	private EmployeeResponse employee;
}
