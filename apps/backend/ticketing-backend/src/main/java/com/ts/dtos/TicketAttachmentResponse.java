package com.ts.dtos;

import java.time.LocalDateTime;

import com.ts.models.Employee;
import com.ts.models.TicketAttachment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TicketAttachmentResponse {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Long size;
    private EmployeeSummary uploadedBy;
    private LocalDateTime uploadedAt;
    
	public TicketAttachmentResponse(Long id, String fileName, String fileUrl, Long size, EmployeeSummary uploadedBy,
			LocalDateTime uploadedAt) {
		super();
		this.id = id;
		this.fileName = fileName;
		this.fileUrl = fileUrl;
		this.size = size;
		this.uploadedBy = uploadedBy;
		this.uploadedAt = uploadedAt;
	}
    
    
    
    public static TicketAttachmentResponse toDto(TicketAttachment att) {
    	return new TicketAttachmentResponse(att.getId(),att.getFileName(),att.getFileUrl(),att.getSize(),att.getUploadedBy()!=null?EmployeeSummary.toDto(att.getUploadedBy()):null,att.getUploadedAt());
    }




}
