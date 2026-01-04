package com.ts.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.models.Ticket;
import com.ts.models.TicketComment;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

	List<TicketComment> findByTicket(Ticket ticket);

	List<TicketComment> findAllByTicket(Ticket ticket);

}
