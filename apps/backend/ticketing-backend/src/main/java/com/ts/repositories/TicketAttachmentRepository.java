package com.ts.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.models.Ticket;
import com.ts.models.TicketAttachment;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

	List<TicketAttachment> findByTicket(Ticket ticket);

	List<TicketAttachment> findAllByTicket(Ticket ticket);

}
