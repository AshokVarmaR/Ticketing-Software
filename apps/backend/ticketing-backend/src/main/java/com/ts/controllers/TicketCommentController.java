package com.ts.controllers;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ts.dtos.TicketCommentCreateRequest;
import com.ts.dtos.TicketCommentResponse;
import com.ts.models.Employee;
import com.ts.services.TicketCommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketCommentService commentService;

    @PostMapping
    public void addComment(
            @PathVariable Long ticketId,
            @RequestBody TicketCommentCreateRequest request,
            Authentication auth
    ) {
        commentService.addComment(
                ticketId,
                request,
                (Employee) auth.getPrincipal()
        );
    }
    
    @GetMapping
    public List<TicketCommentResponse> fetchTicketComments(@PathVariable Long ticketId){
    	return commentService.fetchAllCommentsByTicketId(ticketId);
    }
    
}
