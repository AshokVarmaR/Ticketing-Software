package com.ts.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.models.Employee;
import com.ts.models.NotificationRecipient;

public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Long> {

	List<NotificationRecipient>
	findByEmployeeOrderByNotificationCreatedAtDesc(Employee employee);

	List<NotificationRecipient>
	findByEmployeeAndIsReadFalseOrderByNotificationCreatedAtDesc(Employee employee);

	List<NotificationRecipient>
	findByEmployeeAndIsReadFalse(Employee employee);

	Optional<NotificationRecipient>
	findByNotificationIdAndEmployee(Long notificationId, Employee employee);
}
