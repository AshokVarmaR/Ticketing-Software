package com.ts.controllers;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ts.dtos.TicketAttachmentResponse;
import com.ts.models.Employee;
import com.ts.models.TicketAttachment;
import com.ts.services.TicketAttachmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

    private final TicketAttachmentService attachmentService;

    @PostMapping
    public void upload(
            @PathVariable Long ticketId,
            @RequestParam List<MultipartFile> files,
            Authentication auth
    ) {
        attachmentService.upload(ticketId, files, (Employee) auth.getPrincipal());
    }
    
    @GetMapping
    public List<TicketAttachmentResponse> getAllAttachments(@PathVariable Long ticketId){
    	var atts =  attachmentService.fetchAllAttachmentsByTicketId(ticketId);
    	atts.forEach(System.out::println);
    	return atts;
    }
}
