package com.ts.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ts.dtos.EmployeeSummary;
import com.ts.dtos.TicketAttachmentResponse;
import com.ts.dtos.TicketCommentResponse;
import com.ts.dtos.TicketCreateRequest;
import com.ts.dtos.TicketDetailResponse;
import com.ts.dtos.TicketResponse;
import com.ts.enums.NotificationType;
import com.ts.enums.Priority;
import com.ts.enums.Role;
import com.ts.enums.TicketCategory;
import com.ts.enums.TicketStatus;
import com.ts.exceptions.ResourceNotFoundException;
import com.ts.models.Employee;
import com.ts.models.Ticket;
import com.ts.models.TicketAttachment;
import com.ts.models.TicketComment;
import com.ts.repositories.EmployeeRepository;
import com.ts.repositories.TicketAttachmentRepository;
import com.ts.repositories.TicketCommentRepository;
import com.ts.repositories.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

	private final TicketRepository ticketRepository;
	private final EmployeeRepository employeeRepository;
	private final TicketCommentRepository commentRepository;
	private final TicketAttachmentRepository attachmentRepository;
	private final EmailService emailService;
	private final EmployeeService empService;
	private final NotificationService notificationService;

	/* ================= CREATE TICKET ================= */

	public TicketResponse createTicket(TicketCreateRequest req, Employee creator) {

		Ticket t = new Ticket();
		t.setTicketNumber("TS-" + UUID.randomUUID().toString().substring(0, 8));
		t.setTitle(req.getTitle());
		t.setDescription(req.getDescription());
		t.setCategory(req.getCategory());
		t.setPriority(req.getPriority());
		t.setStatus(TicketStatus.OPEN);
		t.setCreatedBy(creator);
		t.setCreatedAt(LocalDateTime.now());
		t.setUpdatedAt(LocalDateTime.now());

		ticketRepository.save(t);
		
		emailService.sendEmail(
				t.getCreatedBy().getEmail(),
				"Ticket Resolved",
				"Your ticket " + t.getTicketNumber() + " has been created."
		);

		String message =
				t.getPriority() + " Ticket Created by " +
				creator.getName() + "(" + creator.getEmployeeCode() + ")";

		// 🔔 Notify ADMIN
		Employee admin = employeeRepository.findByRole(Role.ADMIN)
				.orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

		notificationService.createAndSendNotification(
				admin,
				t,
				t.getTitle(),
				message,
				NotificationType.TICKET_CREATED
		);

		// 🔔 Notify CATEGORY TEAM
		Role teamRole = resolveRoleFromCategory(t.getCategory());

		List<Employee> teamMembers = employeeRepository.findAllByRole(teamRole);
		for (Employee emp : teamMembers) {
			notificationService.createAndSendNotification(
					emp,
					t,
					t.getTitle(),
					message,
					NotificationType.TICKET_CREATED
			);
		}

		return mapTicket(t);
	}

	/* ================= TICKET DETAILS ================= */

	public TicketDetailResponse getTicketDetail(Long id, Employee user) {

		Ticket ticket = ticketRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket with id: " + id + " is not found"));

		if (!canView(ticket, user)) {
			throw new RuntimeException("Access denied");
		}

		TicketDetailResponse res = new TicketDetailResponse();
		res.setTicket(mapTicket(ticket));

		res.setComments(
				commentRepository.findByTicket(ticket).stream()
						.filter(c -> !c.getIsInternal() || user.getRole() != Role.SOFTWARE_ENGINEER)
						.map(this::mapComment)
						.toList()
		);

		res.setAttachments(
				attachmentRepository.findByTicket(ticket).stream()
						.map(t->TicketAttachmentResponse.toDto(t))
						.collect(Collectors.toList())
		);

		return res;
	}

	/* ================= UPDATE STATUS ================= */

	public void updateStatus(Long id, TicketStatus status, Employee user) {

		Ticket ticket = ticketRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

		ticket.setStatus(status);
		ticket.setUpdatedAt(LocalDateTime.now());

		if (status == TicketStatus.RESOLVED) {

			ticket.setResolvedAt(LocalDateTime.now());
			

			emailService.sendEmail(
					ticket.getCreatedBy().getEmail(),
					"Ticket Resolved",
					"Your ticket " + ticket.getTicketNumber() + " has been resolved."
			);

			notificationService.createAndSendNotification(
					ticket.getCreatedBy(),
					ticket,
					"Ticket Resolved",
					"Your ticket " + ticket.getTicketNumber() + " has been resolved",
					NotificationType.TICKET_RESOLVED
			);
			System.out.println("Notification sent");

		} else {
			
			if (status == TicketStatus.OPEN) {
				ticket.setAssignedTo(null);
			}
			notificationService.createAndSendNotification(
					ticket.getCreatedBy(),
					ticket,
					"Ticket Status Changed",
					"Ticket " + ticket.getTicketNumber() +
					" status changed to " + status,
					NotificationType.TICKET_STATUS_CHANGED
			);
			System.out.println("Notification sent");
		}

		ticketRepository.save(ticket);
	}

	/* ================= ASSIGN TICKET ================= */

	public void assignTicket(Long ticketId, Long employeeId, Employee user) {

		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

		Employee assignee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		t.setAssignedTo(assignee);
		t.setStatus(TicketStatus.IN_PROGRESS);
		t.setUpdatedAt(LocalDateTime.now());
		ticketRepository.save(t);

		emailService.sendEmail(
				assignee.getEmail(),
				"Ticket Assigned",
				"You have been assigned ticket " + t.getTicketNumber()
		);
		
		emailService.sendEmail(
				t.getCreatedBy().getEmail(),
				"Ticket Assigned",
				"Your ticket " + t.getTicketNumber() +" has been assigned to "+assignee.getName()+"("+assignee.getEmployeeCode()+")"
		);

		// 🔔 Notify ASSIGNEE
		notificationService.createAndSendNotification(
				assignee,
				t,
				"Ticket Assigned",
				"You have been assigned ticket " + t.getTicketNumber(),
				NotificationType.TICKET_ASSIGNED
		);

		// 🔔 Notify CREATOR
		notificationService.createAndSendNotification(
				t.getCreatedBy(),
				t,
				"Ticket Assigned",
				"Your ticket " + t.getTicketNumber() +
				" has been assigned to " + assignee.getName(),
				NotificationType.TICKET_ASSIGNED
		);
	}

	/* ================= FETCH ALL DETAILS ================= */

	public List<TicketDetailResponse> getAllTicketDetails(Employee user) {

		List<Ticket> tickets;

		if (user.getRole() == Role.ADMIN) {
			tickets = ticketRepository.findAll();
		} else {
			tickets = ticketRepository.findByAssignedToOrCreatedBy(user, user);
		}

		return tickets.stream()
				.filter(ticket -> canView(ticket, user))
				.map(ticket -> {
					TicketDetailResponse res = new TicketDetailResponse();
					res.setTicket(mapTicket(ticket));

					res.setComments(
							commentRepository.findByTicket(ticket).stream()
									.filter(c -> !c.getIsInternal() || user.getRole() != Role.SOFTWARE_ENGINEER)
									.map(this::mapComment)
									.toList()
					);

					res.setAttachments(
							attachmentRepository.findByTicket(ticket).stream()
									.map(this::mapAttachment)
									.collect(Collectors.toList())
					);

					return res;
				})
				.collect(Collectors.toList());
	}

	/* ================= FETCH OPEN ================= */

	public List<TicketResponse> fetchOpenTickets(Employee user) {

		if (user.getRole() == Role.ADMIN) {
			return ticketRepository.findByStatus(TicketStatus.OPEN)
					.stream()
					.map(this::mapTicket)
					.toList();
		}

		TicketCategory category = resolveCategory(user.getRole());

		return ticketRepository.findByStatusAndCategory(TicketStatus.OPEN, category)
				.stream()
				.filter(ticket -> canView(ticket, user))
				.map(this::mapTicket)
				.toList();
	}

	/* ================= HELPERS ================= */

	private boolean canView(Ticket t, Employee u) {
		if (u.getRole() == Role.ADMIN)
			return true;
		if (t.getCreatedBy().getId().equals(u.getId()))
			return true;
		return t.getCategory().name().equals(u.getRole().name());
	}

	private Role resolveRoleFromCategory(TicketCategory category) {
		return switch (category) {
			case IT -> Role.IT;
			case NETWORK -> Role.NETWORK;
			case HR -> Role.HR;
			case SOFTWARE -> Role.SOFTWARE_ENGINEER;
		};
	}

	private TicketCategory resolveCategory(Role role) {
		return switch (role) {
			case IT -> TicketCategory.IT;
			case NETWORK -> TicketCategory.NETWORK;
			case HR -> TicketCategory.HR;
			case SOFTWARE_ENGINEER -> TicketCategory.SOFTWARE;
			default -> throw new IllegalStateException("No ticket category mapped for role: " + role);
		};
	}

	private TicketResponse mapTicket(Ticket t) {
		TicketResponse r = new TicketResponse();
		r.setId(t.getId());
		r.setTicketNumber(t.getTicketNumber());
		r.setTitle(t.getTitle());
		r.setCategory(t.getCategory());
		r.setStatus(t.getStatus());
		r.setPriority(Priority.fromLevel(t.getPriority()));
		r.setCreatedAt(t.getCreatedAt());
		r.setCreatedBy(new EmployeeSummary(
				t.getCreatedBy().getId(),
				t.getCreatedBy().getName(),
				t.getCreatedBy().getEmail(),
				t.getCreatedBy().getRole()
		));
		r.setDescription(t.getDescription());
		r.setResolvedAt(t.getResolvedAt());
		r.setAssignedTo(
				t.getAssignedTo() == null ? null :
				new EmployeeSummary(
						t.getAssignedTo().getId(),
						t.getAssignedTo().getName(),
						t.getAssignedTo().getEmail(),
						t.getAssignedTo().getRole()
				)
		);
		r.setUpdatedAt(t.getUpdatedAt());
		return r;
	}

	private TicketCommentResponse mapComment(TicketComment c) {
		TicketCommentResponse r = new TicketCommentResponse();
		r.setId(c.getId());
		r.setComment(c.getComment());
		r.setCommentedBy(EmployeeSummary.toDto(c.getCommentedBy()));
		r.setIsInternal(c.getIsInternal());
		r.setCommentedAt(c.getCommentedAt());
		return r;
	}

	private TicketAttachmentResponse mapAttachment(TicketAttachment a) {
		TicketAttachmentResponse r = new TicketAttachmentResponse();
		r.setId(a.getId());
		r.setFileName(a.getFileName());
		r.setFileUrl(a.getFileUrl());
		r.setUploadedAt(a.getUploadedAt());
		return r;
	}
	
	private Employee fetchAdmin() {
		return employeeRepository.findByRole(Role.ADMIN)
				.orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
	}

	public List<TicketResponse> fetchLiveTickets(Employee user) {
		if (user.getRole() == Role.ADMIN) {
			return ticketRepository.findByStatusNotIn(List.of(TicketStatus.OPEN,TicketStatus.RESOLVED))
					.stream()
					.map(this::mapTicket)
					.toList();
		}
		return null;
	}

	public List<TicketResponse> fetchResolvedTickets(Employee user) {
		if (user.getRole() == Role.ADMIN) {
			return ticketRepository.findByStatus(TicketStatus.RESOLVED)
					.stream()
					.map(this::mapTicket)
					.toList();
		}
		else {
			return ticketRepository.findByStatusAndAssignedToOrCreatedBy(TicketStatus.RESOLVED, user, user)
					.stream()
					.map(this::mapTicket)
					.toList();
		}
	}
}
