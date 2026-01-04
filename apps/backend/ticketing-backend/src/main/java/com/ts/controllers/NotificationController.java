package com.ts.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ts.models.Employee;
import com.ts.services.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;
	
	@PostMapping("/recipient/{id}/mark-read")
	public ResponseEntity<?> markRead(@PathVariable Long id, Authentication auth) {
		System.out.println("in mark read method");
		Employee emp = (Employee) auth.getPrincipal();
		notificationService.markAsRead(id, emp);
		return ResponseEntity.ok("Marked read");
	}
	
	@PostMapping("/recipient/mark-readall")
	public ResponseEntity<?> markRead(Authentication auth) {
		System.out.println("in mark read all method");
		Employee emp = (Employee) auth.getPrincipal();
		notificationService.markAllAsRead(emp);
		return ResponseEntity.ok("Marked read");
	}
	
}
