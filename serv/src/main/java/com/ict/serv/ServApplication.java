package com.ict.serv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing	//날짜 만드려고용
@EnableScheduling
public class ServApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServApplication.class, args);
	}

}
