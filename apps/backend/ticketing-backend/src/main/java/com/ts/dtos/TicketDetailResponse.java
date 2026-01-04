package com.ts.dtos;

import java.util.List;

import lombok.Data;

@Data
public class TicketDetailResponse {
    private TicketResponse ticket;
    private List<TicketCommentResponse> comments;
    private List<TicketAttachmentResponse> attachments;
    
}
