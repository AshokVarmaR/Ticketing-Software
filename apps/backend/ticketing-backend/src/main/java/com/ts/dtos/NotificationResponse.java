package com.ts.dtos;

import java.time.LocalDateTime;

import com.ts.enums.NotificationType;
import lombok.Data;

@Data
public class NotificationResponse {

    private Long id;

    private String title;
    private String message;

    private NotificationType type;

    private Boolean isRead;

    private LocalDateTime createdAt;

    private EmployeeSummary recipient;
    private TicketSummary ticket;
}
