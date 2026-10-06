package com.spacedebris.service;

import com.spacedebris.model.RiskAssessment;
import com.spacedebris.model.RiskLevel;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RiskAssessmentService {
    // Academic, predefined criteria for demo purposes only.
    public RiskLevel classifyRiskByDistance(BigDecimal minimumDistanceKm) {
        if (minimumDistanceKm == null || minimumDistanceKm.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Minimum distance must be greater than 0.");
        }

        if (minimumDistanceKm.compareTo(BigDecimal.valueOf(3.0)) <= 0) {
            return RiskLevel.CRITICAL;
        }
        if (minimumDistanceKm.compareTo(BigDecimal.valueOf(5.0)) <= 0) {
            return RiskLevel.HIGH;
        }
        if (minimumDistanceKm.compareTo(BigDecimal.valueOf(10.0)) <= 0) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    public RiskAssessment createAssessment(int approachId, BigDecimal minimumDistanceKm) {
        return new RiskAssessment(null, approachId, classifyRiskByDistance(minimumDistanceKm), LocalDate.now());
    }
}
