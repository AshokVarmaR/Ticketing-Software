package com.ts.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ts.dtos.TicketAttachmentResponse;
import com.ts.dtos.TicketCommentResponse;
import com.ts.exceptions.ResourceNotFoundException;
import com.ts.models.Employee;
import com.ts.models.Ticket;
import com.ts.models.TicketAttachment;
import com.ts.repositories.TicketAttachmentRepository;
import com.ts.repositories.TicketRepository;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Service
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "files")
public class TicketAttachmentService {

	@Getter
	@Setter
	private String path; // uploads/images

	private final TicketRepository ticketRepository;
	private final TicketAttachmentRepository attachmentRepository;

	/**
	 * Anyone who can VIEW the ticket can upload attachments.
	 */
	public void upload(Long ticketId, List<MultipartFile> files, Employee user) {
		
		System.out.println("Inside upload method\n"+user!=null?user.toString():"User is null");

		Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));

		// Visibility is already enforced in TicketService
		// So no extra role/team validation here

		Path ticketDir = Paths.get(path, "tickets", ticketId.toString());

		try {
			Files.createDirectories(ticketDir);

			for (MultipartFile file : files) {

				if (file == null || file.isEmpty()) {
					continue;
				}

				String originalFileName = file.getOriginalFilename();
				String storedFileName = UUID.randomUUID() + "_" + originalFileName;

				Path filePath = ticketDir.resolve(storedFileName);

				Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

				TicketAttachment attachment = new TicketAttachment();
				attachment.setTicket(ticket);
				attachment.setFileName(originalFileName);
				attachment.setUploadedBy(user);
				attachment.setSize(file.getSize());
				attachment.setFileUrl("/tickets/" + ticketId + "/" + storedFileName);
				attachment.setUploadedAt(LocalDateTime.now());

				attachmentRepository.save(attachment);
			}

		} catch (IOException e) {
			throw new RuntimeException("Failed to upload attachment", e);
		}
	}

	public List<TicketAttachmentResponse> fetchAllAttachmentsByTicketId(Long ticketId) {
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResourceNotFoundException("Ticket with id: " + ticketId + " is not found"));

		return attachmentRepository.findAllByTicket(ticket).stream()
				.map(t -> TicketAttachmentResponse.toDto(t)).collect(Collectors.toList());
	}
}
