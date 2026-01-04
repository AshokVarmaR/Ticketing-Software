package com.ts.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ts.models.Otp;

public interface OtpRepository extends JpaRepository<Otp, Long> {

	Optional<Otp> findByEmployee_Id(Long id);

	Optional<Otp> findByEmployee_Email(String email);

}
