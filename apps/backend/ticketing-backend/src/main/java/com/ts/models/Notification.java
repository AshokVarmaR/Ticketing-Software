package com.ts.models;

import java.time.LocalDateTime;
import java.util.List;

import com.ts.enums.NotificationType;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String title;       // "Ticket Assigned"
    private String message;     // "Ticket TS-123 assigned to you"

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @ManyToOne
    private Ticket ticket;      // nullable

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL)
    private List<NotificationRecipient> recipients;
}
