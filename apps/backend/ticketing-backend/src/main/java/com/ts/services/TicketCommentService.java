package com.ts.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ts.dtos.TicketCommentCreateRequest;
import com.ts.dtos.TicketCommentResponse;
import com.ts.enums.NotificationType;
import com.ts.enums.Role;
import com.ts.exceptions.ResourceNotFoundException;
import com.ts.models.Employee;
import com.ts.models.Ticket;
import com.ts.models.TicketComment;
import com.ts.repositories.TicketCommentRepository;
import com.ts.repositories.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;

    public void addComment(
            Long ticketId,
            TicketCommentCreateRequest req,
            Employee user
    ) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        // 1️⃣ Save comment
        TicketComment c = new TicketComment();
        c.setTicket(ticket);
        c.setComment(req.getComment());
        c.setIsInternal(
                user.getRole() == Role.ADMIN || user.getRole() == Role.HR
                        ? Boolean.TRUE.equals(req.getIsInternal())
                        : false
        );
        c.setCommentedBy(user);
        c.setCommentedAt(LocalDateTime.now());

        commentRepository.save(c);

        // 2️⃣ Send notifications
        sendCommentNotifications(ticket, c, user);
    }

    /**
     * Notification decision logic
     */
    private void sendCommentNotifications(
            Ticket ticket,
            TicketComment comment,
            Employee commenter
    ) {
        Employee creator = ticket.getCreatedBy();
        Employee assignee = ticket.getAssignedTo();
        boolean isInternal = Boolean.TRUE.equals(comment.getIsInternal());

        // ===============================
        // CASE 1: Commenter = Creator
        // ===============================
        if (commenter.getId().equals(creator.getId())) {

            if (assignee != null) {
                // Notify assignee
                notificationService.createAndSendNotification(
                        assignee,
                        ticket,
                        "New Comment on Ticket",
                        "Ticket " + ticket.getTicketNumber() + " has a new comment from creator",
                        NotificationType.TICKET_COMMENT_ADDED
                );
            } else {
                // Notify admin(s)
                notificationService.notifyAdmins(
                        ticket,
                        "New Comment on Ticket",
                        "Ticket " + ticket.getTicketNumber() + " has a new comment from creator"
                );
            }
            return;
        }

        // ==================================
        // CASE 2: Commenter = Admin or Assignee
        // ==================================
        boolean isAdmin = commenter.getRole() == Role.ADMIN;
        boolean isAssignee = assignee != null && commenter.getId().equals(assignee.getId());

        if (!isAdmin && !isAssignee) {
            return;
        }

        // INTERNAL comment
        if (isInternal) {

            if (isAdmin && assignee != null) {
                notifyIfNotSelf(assignee, commenter, ticket);
            }

            if (isAssignee) {
                notificationService.notifyAdmins(
                        ticket,
                        "Internal Comment Added",
                        "Ticket " + ticket.getTicketNumber() + " has a new internal comment"
                );
            }
            return;
        }

        // NON-INTERNAL comment
        // Notify creator
        notifyIfNotSelf(creator, commenter, ticket);

        // Notify opposite party
        if (isAdmin && assignee != null) {
            notifyIfNotSelf(assignee, commenter, ticket);
        }

        if (isAssignee) {
            notificationService.notifyAdmins(
                    ticket,
                    "New Comment Added",
                    "Ticket " + ticket.getTicketNumber() + " has a new comment"
            );
        }
    }

    private void notifyIfNotSelf(Employee recipient, Employee sender, Ticket ticket) {
        if (recipient == null || recipient.getId().equals(sender.getId())) return;

        notificationService.createAndSendNotification(
                recipient,
                ticket,
                "New Comment on Ticket",
                "Ticket " + ticket.getTicketNumber() + " has a new comment",
                NotificationType.TICKET_COMMENT_ADDED
        );
    }

    public List<TicketCommentResponse> fetchAllCommentsByTicketId(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id: " + ticketId + " is not found"));

        return commentRepository.findAllByTicket(ticket)
                .stream()
                .map(t -> TicketCommentResponse.toDto(t, t.getCommentedBy()))
                .collect(Collectors.toList());
    }
}
