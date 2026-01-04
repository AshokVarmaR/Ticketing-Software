package com.ts.dtos;

import com.ts.enums.TicketCategory;

import lombok.Data;

@Data
public class TicketCreateRequest {
    private String title;
    private String description;
    private TicketCategory category;
    private Integer priority;
}
