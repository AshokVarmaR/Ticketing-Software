package com.ts.models;

import java.time.LocalDateTime;

import com.ts.enums.TicketCategory;
import com.ts.enums.TicketStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String ticketNumber;

    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Employee createdBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private Employee assignedTo;

    private LocalDateTime updatedAt;

    private Boolean isDeleted = false;

    private Integer priority; // 1 = High, 2 = Medium, 3 = Low

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
