package com.ts.utils;

import com.ts.dtos.EmployeeSummary;
import com.ts.dtos.NotificationResponse;
import com.ts.dtos.TicketSummary;
import com.ts.models.Notification;
import com.ts.models.NotificationRecipient;

public class NotificationMapper {

    private NotificationMapper() {}

    public static NotificationResponse toDto(NotificationRecipient nr) {

        Notification n = nr.getNotification();

        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setCreatedAt(n.getCreatedAt());

        dto.setIsRead(nr.getIsRead());
        dto.setRecipient(EmployeeSummary.toDto(nr.getEmployee()));

        if (n.getTicket() != null) {
            dto.setTicket(TicketSummary.toDto(n.getTicket()));
        }

        return dto;
    }
}
