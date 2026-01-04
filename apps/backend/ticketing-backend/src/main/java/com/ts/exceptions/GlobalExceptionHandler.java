package com.ts.exceptions;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
		Map<String, Object> error = new HashMap<>();
		error.put("timestamp", LocalDateTime.now());
		error.put("message", ex.getMessage());
		error.put("status", HttpStatus.CONFLICT.value());
		return new ResponseEntity<>(error,HttpStatus.CONFLICT);
	}
	
	@ExceptionHandler(ResourceAlreadyExistsException.class)
	public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceAlreadyExistsException ex) {
		Map<String, Object> error = new HashMap<>();
		error.put("timestamp", LocalDateTime.now());
		error.put("message", ex.getMessage());
		error.put("status", HttpStatus.CONFLICT.value());
		return new ResponseEntity<>(error,HttpStatus.CONFLICT);
	}
}
