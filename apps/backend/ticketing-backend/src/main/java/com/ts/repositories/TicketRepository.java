package com.ts.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.dtos.TicketResponse;
import com.ts.enums.TicketCategory;
import com.ts.enums.TicketStatus;
import com.ts.models.Employee;
import com.ts.models.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

	List<Ticket> findByAssignedTo(Employee user);

	List<Ticket> findByAssignedToOrCreatedBy(Employee user, Employee user2);

	Optional<Ticket> findByStatus(TicketStatus open);

	Optional<Ticket> findByStatusAndCategory(TicketStatus status, TicketCategory category);

	List<Ticket> findByStatusNotIn(List<TicketStatus> statuses);

	List<Ticket> findByStatusAndAssignedToOrCreatedBy(TicketStatus resolved, Employee user, Employee user2);


}
