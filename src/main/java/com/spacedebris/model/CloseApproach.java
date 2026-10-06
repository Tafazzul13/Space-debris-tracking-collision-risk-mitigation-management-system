package com.spacedebris.model;

import java.math.BigDecimal;

public class CloseApproach {
    private Integer approachId;
    private Integer satelliteId;
    private Integer debrisId;
    private BigDecimal minimumDistance;

    public CloseApproach() {
    }

    public CloseApproach(Integer approachId, Integer satelliteId, Integer debrisId, BigDecimal minimumDistance) {
        this.approachId = approachId;
        this.satelliteId = satelliteId;
        this.debrisId = debrisId;
        this.minimumDistance = minimumDistance;
    }

    public Integer getApproachId() {
        return approachId;
    }

    public void setApproachId(Integer approachId) {
        this.approachId = approachId;
    }

    public Integer getSatelliteId() {
        return satelliteId;
    }

    public void setSatelliteId(Integer satelliteId) {
        this.satelliteId = satelliteId;
    }

    public Integer getDebrisId() {
        return debrisId;
    }

    public void setDebrisId(Integer debrisId) {
        this.debrisId = debrisId;
    }

    public BigDecimal getMinimumDistance() {
        return minimumDistance;
    }

    public void setMinimumDistance(BigDecimal minimumDistance) {
        this.minimumDistance = minimumDistance;
    }
}
