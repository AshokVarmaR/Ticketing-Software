package com.ts.dtos;

import lombok.Data;

@Data
public class TicketCommentCreateRequest {
    private String comment;
    private Boolean isInternal;
}

