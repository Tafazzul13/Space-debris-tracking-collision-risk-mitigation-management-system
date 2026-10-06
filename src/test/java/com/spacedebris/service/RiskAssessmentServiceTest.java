package com.spacedebris.service;

import com.spacedebris.model.RiskLevel;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RiskAssessmentServiceTest {
    private final RiskAssessmentService service = new RiskAssessmentService();

    @Test
    void shouldClassifyCriticalForVerySmallDistance() {
        assertEquals(RiskLevel.CRITICAL, service.classifyRiskByDistance(BigDecimal.valueOf(2.1)));
    }

    @Test
    void shouldClassifyMediumForModerateDistance() {
        assertEquals(RiskLevel.MEDIUM, service.classifyRiskByDistance(BigDecimal.valueOf(7.5)));
    }

    @Test
    void shouldRejectNonPositiveDistance() {
        assertThrows(ValidationException.class, () -> service.classifyRiskByDistance(BigDecimal.ZERO));
    }
}
