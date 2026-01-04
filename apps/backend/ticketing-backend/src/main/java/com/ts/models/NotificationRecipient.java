package com.ts.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "notification_recipients",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"notification_id", "employee_id"})
    }
)
public class NotificationRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne(optional = false)
    private Notification notification;

    @ManyToOne(optional = false)
    private Employee employee;

    private Boolean isRead = false;

    private LocalDateTime readAt;
}
