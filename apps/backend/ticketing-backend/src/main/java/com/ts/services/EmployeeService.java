package com.ts.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ts.dtos.EmployeeCreateRequest;
import com.ts.dtos.EmployeeResponse;
import com.ts.enums.Role;
import com.ts.exceptions.ResourceAlreadyExistsException;
import com.ts.exceptions.ResourceNotFoundException;
import com.ts.models.Employee;
import com.ts.models.Otp;
import com.ts.repositories.EmployeeRepository;
import com.ts.repositories.OtpRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeService implements CommandLineRunner {

	private final EmployeeRepository employeeRepository;
	private final PasswordEncoder passwordEncoder;
	private final OtpRepository otpRepo;
	private final EmailService emailService;

	@Override
	public void run(String... args) throws Exception {
		if (employeeRepository.findByEmail("admin@gmail.com").isEmpty()) {

			Employee admin = new Employee();

			admin.setName("Admin");
			admin.setEmail("admin@gmail.com");
			admin.setEmployeeCode("EIDC" + 1);
			admin.setRole(Role.ADMIN);
			admin.setIsActive(true);
			admin.setJoiningDate(LocalDate.now());
			admin.setPassword(passwordEncoder.encode("1234"));
			admin.setCreatedAt(LocalDateTime.now());

			employeeRepository.save(admin);
		}
	}

	public EmployeeResponse createEmployee(EmployeeCreateRequest req) {

		if (employeeRepository.findByEmailOrEmployeeCode(req.getEmail(), req.getEmployeeCode()).isPresent()) {
			throw new ResourceAlreadyExistsException(
					"Employee with Email " + req.getEmail() + " or Code " + req.getEmployeeCode() + " already exists");
		}

		Employee e = new Employee();
		e.setName(req.getName());
		e.setPhone(req.getPhone());
		e.setEmail(req.getEmail());
		e.setPassword(passwordEncoder.encode(req.getPassword()));
		e.setJoiningDate(req.getJoiningDate());
		e.setRole(req.getRole());
		e.setIsActive(true);
		e.setCreatedAt(LocalDateTime.now());

		employeeRepository.save(e);

		if (req.getEmployeeCode() == null) {
			e.setEmployeeCode("EIDC" + e.getId());
		} else {
			e.setEmployeeCode(req.getEmployeeCode());
		}
		employeeRepository.save(e);

		return mapToResponse(e);
	}

	public List<EmployeeResponse> getAll() {
		return employeeRepository.findAll().stream().map(this::mapToResponse).toList();
	}

	public EmployeeResponse mapToResponse(Employee e) {
		EmployeeResponse r = new EmployeeResponse();
		r.setId(e.getId());
		r.setEmployeeCode(e.getEmployeeCode());
		r.setName(e.getName());
		r.setEmail(e.getEmail());
		r.setRole(e.getRole());e.getPhone();
		r.setPhone(e.getPhone());
		r.setIsActive(e.getIsActive());
		r.setJoiningDate(e.getJoiningDate());
		return r;
	}

	public EmployeeResponse updateEmployee(Long id, EmployeeCreateRequest request) {

		// 1️⃣ Resource exists check
		Employee emp = employeeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Employee with Id " + id + " not found"));

		// 2️⃣ Name update
		if (hasText(request.getName())) {
			emp.setName(request.getName().trim());
		}

		// 3️⃣ Email update + uniqueness check
		if (hasText(request.getEmail()) && !request.getEmail().equalsIgnoreCase(emp.getEmail())) {

			if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
				throw new ResourceAlreadyExistsException(
						"Employee with email " + request.getEmail() + " already exists");
			}
			emp.setEmail(request.getEmail().trim());
		}

		// 4️⃣ Employee Code update + uniqueness check
		if (hasText(request.getEmployeeCode()) && !request.getEmployeeCode().equalsIgnoreCase(emp.getEmployeeCode())) {

			if (employeeRepository.findByEmployeeCode(request.getEmployeeCode()).isPresent()) {
				throw new ResourceAlreadyExistsException(
						"Employee with code " + request.getEmployeeCode() + " already exists");
			}
			emp.setEmployeeCode(request.getEmployeeCode().trim());
		}

		// 5️⃣ Password update (only if provided)
		if (hasText(request.getPassword())) {
			System.out.println("in update password method: "+request.getPassword());
			emp.setPassword(passwordEncoder.encode(request.getPassword()));
			System.out.println("password updated");
		}

		// 6️⃣ Role update
		if (request.getRole() != null) {
			emp.setRole(request.getRole());
		}

		// 7️⃣ Joining date update
		if (request.getJoiningDate() != null) {
			emp.setJoiningDate(request.getJoiningDate());
		}

		// 8️⃣ Active flag update
		if (request.getIsActive() != null) {
			emp.setIsActive(request.getIsActive());
		}
		
		if(request.getPhone() != null) {
			emp.setPhone(request.getPhone());
		}

		// 9️⃣ Persist
		employeeRepository.save(emp);

		return mapToResponse(emp);
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}

	public EmployeeResponse findById(Long id) {
		// TODO Auto-generated method stub
		return employeeRepository.findById(id).map(this::mapToResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Employee with Id " + id + " not found"));
	}

	public void deleteById(Long id) {
		
		Employee emp = employeeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Employee with Id " + id + " not found"));
		employeeRepository.delete(emp);
	}

	public List<EmployeeResponse> getEmployeesByRole(Role role) {
		// TODO Auto-generated method stub
		return employeeRepository.findAllByRole(role).stream().map(this::mapToResponse).collect(Collectors.toList());
	}
	
	public boolean generateOtp(String email) {
	    Optional<Employee> optionalUser = employeeRepository.findByEmail(email);
	    
	    if (optionalUser.isPresent()) {
	        Employee user = optionalUser.get();
	        
	            // Generate 6-digit OTP
	            int otp = 100000 + new Random().nextInt(900000);
	            String otpString = Integer.toString(otp);

	            // Delete existing OTP for this user
	            otpRepo.findByEmployee_Id(user.getId()).ifPresent(otpRepo::delete);

	            // Create and save new OTP
	            Otp otpass = new Otp();
	            otpass.setPassword(passwordEncoder.encode(otpString)); 
	            otpass.setCreatedAt(LocalDateTime.now());
	            otpass.setEmployee(user); 
	            otpRepo.save(otpass); 

	            // Send OTP via email
	            SimpleMailMessage message = new SimpleMailMessage();
	            message.setTo(email);
	            message.setSubject("Password Reset");
	            message.setText("OTP to reset your Account password is " + otp +". Do not share this with anyone.");
	            emailService.otpMail(message);
	            System.out.println("Otp : "+otp);
	            return true;
	        
	    }

	    return false;
	}

	public boolean verifyOtp(String email, String otp) {
	    Optional<Otp> optionalOtp = otpRepo.findByEmployee_Email(email);
	    System.out.println("Iam in verify method");
	    if (optionalOtp.isPresent()) {
	        Otp ot = optionalOtp.get();
	        if (passwordEncoder.matches(otp, ot.getPassword())) {
	            return true;
	        }
	    }

	    return false;
	}

	public boolean resetPassword(String email, String password) {
		
		Optional<Otp> optionalOtp = otpRepo.findByEmployee_Email(email);
		if(optionalOtp.isPresent()){
			Otp otp = optionalOtp.get();
			otp.getEmployee().setPassword(passwordEncoder.encode(password));
			otpRepo.save(otp);
			otpRepo.delete(otp);
			return true;
		}		
		return false;
	}


}
