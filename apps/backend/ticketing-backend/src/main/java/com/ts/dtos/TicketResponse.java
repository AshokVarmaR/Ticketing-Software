package com.ts.dtos;

import java.time.LocalDateTime;

import com.ts.enums.Priority;
import com.ts.enums.TicketCategory;
import com.ts.enums.TicketStatus;

import lombok.Data;

@Data
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketStatus status;
//    private Integer priority;
    private Priority priority;

    private EmployeeSummary createdBy;
    private EmployeeSummary assignedTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
