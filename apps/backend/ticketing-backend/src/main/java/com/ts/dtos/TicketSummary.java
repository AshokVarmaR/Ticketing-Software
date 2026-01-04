package com.ts.dtos;

import com.ts.models.Ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketSummary {

    private Long id;
    private String ticketNumber;
    private String title;

    public static TicketSummary toDto(Ticket ticket) {
        if (ticket == null) return null;
        return new TicketSummary(
            ticket.getId(),
            ticket.getTicketNumber(),
            ticket.getTitle()
        );
    }
}
