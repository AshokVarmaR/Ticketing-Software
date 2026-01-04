package com.ts.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.models.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

//	List<Notification> findByRecipientOrderByCreatedAtDesc(Employee recipient);
//
//	List<Notification> findByRecipientsAndIsReadFalse(Employee recipient);
//
//	List<Notification> findByRecipientsAndIsReadFalseOrderByCreatedAtDesc(Employee recipient);

}
