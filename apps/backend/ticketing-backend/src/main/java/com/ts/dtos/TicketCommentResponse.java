package com.ts.dtos;

import java.time.LocalDateTime;

import com.ts.models.Employee;
import com.ts.models.TicketComment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentResponse {
    private Long id;
    private String comment;
    private Boolean isInternal;
    private EmployeeSummary commentedBy;
    private LocalDateTime commentedAt;
    
    
    public static TicketCommentResponse toDto(TicketComment comment, Employee commentedEmployee) {
    	return new TicketCommentResponse(comment.getId(),comment.getComment(),comment.getIsInternal(),commentedEmployee!=null?EmployeeSummary.toDto(commentedEmployee):null,comment.getCommentedAt());
    }
}
