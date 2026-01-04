package com.ts.controllers;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ts.dtos.TicketCreateRequest;
import com.ts.dtos.TicketDetailResponse;
import com.ts.dtos.TicketResponse;
import com.ts.enums.TicketStatus;
import com.ts.models.Employee;
import com.ts.services.TicketService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

	private final TicketService ticketService;
	
	@GetMapping("/statuses")
	public TicketStatus[] getAllStatuses() {
		return TicketStatus.values();
	}
	

	@PostMapping
	public TicketResponse createTicket(@RequestBody TicketCreateRequest request, Authentication auth) {
		Employee user = (Employee) auth.getPrincipal();
		return ticketService.createTicket(request, user);
	}

	@GetMapping("/{id}")
	public TicketDetailResponse getTicket(@PathVariable Long id, Authentication auth) {
		Employee user = (Employee) auth.getPrincipal();
		return ticketService.getTicketDetail(id, user);
	}

	@GetMapping
	public List<TicketDetailResponse> getTickets(Authentication auth) {
		Employee user = (Employee) auth.getPrincipal();
		var tickets =  ticketService.getAllTicketDetails(user);
		tickets.forEach(System.out::println);
		return tickets;
	}
	
	@GetMapping("/live")
	public List<TicketResponse> getLiveTickets(Authentication auth) {
		Employee user = (Employee) auth.getPrincipal();
		return ticketService.fetchLiveTickets(user);
	}
	
	@GetMapping("/resolved")
	public List<TicketResponse> getResolvedTickets(Authentication auth) {
		Employee user = (Employee) auth.getPrincipal();
		return ticketService.fetchResolvedTickets(user);
	}

	@GetMapping("/open")
	public List<TicketResponse> getOpenTickets(Authentication auth) {
		Employee user = (Employee) auth.getPrincipal();
		return ticketService.fetchOpenTickets(user);
	}

	@PatchMapping("/{id}/status")
	public void updateStatus(@PathVariable Long id, @RequestParam TicketStatus status, Authentication auth) {
		ticketService.updateStatus(id, status, (Employee) auth.getPrincipal());
	}

	@PutMapping("/{id}/assign/{employeeId}")
	public void assignTicket(@PathVariable Long id, @PathVariable Long employeeId, Authentication auth) {
		ticketService.assignTicket(id, employeeId, (Employee) auth.getPrincipal());
	}
}
