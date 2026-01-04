package com.ts.services;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Service
@RequiredArgsConstructor
@ConfigurationProperties("spring.mail")
public class EmailService {
	
	@Getter @Setter
	private String username;

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
    	
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(username);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
        
        System.out.println("From Email is :"+username + ", To Email is :"+to+"--- Mail sent");
    }

	public void otpMail(SimpleMailMessage message) {
		
		message.setFrom(username);
		mailSender.send(message);
		
	}
}
