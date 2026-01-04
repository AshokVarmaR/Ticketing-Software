package com.ts.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ts.dtos.NotificationResponse;
import com.ts.enums.NotificationType;
import com.ts.enums.Role;
import com.ts.exceptions.ResourceNotFoundException;
import com.ts.models.Employee;
import com.ts.models.Notification;
import com.ts.models.NotificationRecipient;
import com.ts.models.Ticket;
import com.ts.repositories.EmployeeRepository;
import com.ts.repositories.NotificationRecipientRepository;
import com.ts.repositories.NotificationRepository;
import com.ts.utils.NotificationMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final NotificationRecipientRepository recipientRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmployeeRepository employeeRepository;

    /**
     * Create + send notification to ONE employee
     */
    public void createAndSendNotification(
            Employee recipient,
            Ticket ticket,
            String title,
            String message,
            NotificationType type
    ) {
        // 1️⃣ Create Notification
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTicket(ticket);
        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepo.save(notification);

        // 2️⃣ Create NotificationRecipient
        NotificationRecipient nr = new NotificationRecipient();
        nr.setNotification(savedNotification);
        nr.setEmployee(recipient);
        nr.setIsRead(false);

        NotificationRecipient savedRecipient = recipientRepo.save(nr);

        // 3️⃣ Push via WebSocket (recipient-specific DTO)
        NotificationResponse dto = NotificationMapper.toDto(savedRecipient);

        messagingTemplate.convertAndSend(
        	    "/queue/notifications/" + recipient.getId(),
        	    dto
        	);

    }

    /**
     * Fetch all notifications for logged-in user
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Employee employee) {

        return recipientRepo
                .findByEmployeeOrderByNotificationCreatedAtDesc(employee)
                .stream()
                .map(NotificationMapper::toDto)
                .toList();
    }

    /**
     * Fetch unread notifications
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Employee employee) {

        return recipientRepo
                .findByEmployeeAndIsReadFalseOrderByNotificationCreatedAtDesc(employee)
                .stream()
                .map(NotificationMapper::toDto)
                .toList();
    }

    /**
     * Mark single notification as read
     */
    public void markAsRead(Long notificationId, Employee employee) {

        NotificationRecipient nr = recipientRepo
                .findByNotificationIdAndEmployee(notificationId, employee)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        nr.setIsRead(true);
        nr.setReadAt(LocalDateTime.now());

        recipientRepo.save(nr);
    }

    /**
     * Mark all notifications as read for user
     */
    public void markAllAsRead(Employee employee) {

        List<NotificationRecipient> unread =
                recipientRepo.findByEmployeeAndIsReadFalse(employee);

        unread.forEach(nr -> {
            nr.setIsRead(true);
            nr.setReadAt(LocalDateTime.now());
        });

        recipientRepo.saveAll(unread);
    }

    public void notifyAdmins(
            Ticket ticket,
            String title,
            String message
    ) {
        List<Employee> admins = employeeRepository.findAllByRole(Role.ADMIN);
//        		.orElseThrow(()-> new ResourceNotFoundException("Admin not found"));

        for (var admin : admins) {
            createAndSendNotification(
                    admin,
                    ticket,
                    title,
                    message,
                    NotificationType.TICKET_COMMENT_ADDED
            );
        }
    }

}
