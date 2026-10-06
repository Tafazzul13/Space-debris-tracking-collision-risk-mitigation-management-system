package com.spacedebris.model;

import java.time.LocalDate;

public class RiskAssessment {
    private Integer riskId;
    private Integer approachId;
    private RiskLevel riskLevel;
    private LocalDate assessmentDate;

    public RiskAssessment() {
    }

    public RiskAssessment(Integer riskId, Integer approachId, RiskLevel riskLevel, LocalDate assessmentDate) {
        this.riskId = riskId;
        this.approachId = approachId;
        this.riskLevel = riskLevel;
        this.assessmentDate = assessmentDate;
    }

    public Integer getRiskId() {
        return riskId;
    }

    public void setRiskId(Integer riskId) {
        this.riskId = riskId;
    }

    public Integer getApproachId() {
        return approachId;
    }

    public void setApproachId(Integer approachId) {
        this.approachId = approachId;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDate assessmentDate) {
        this.assessmentDate = assessmentDate;
    }
}
