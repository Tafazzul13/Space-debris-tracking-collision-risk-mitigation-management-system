package com.spacedebris;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpaceDebrisEngineApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpaceDebrisEngineApplication.class, args);
    }
}
