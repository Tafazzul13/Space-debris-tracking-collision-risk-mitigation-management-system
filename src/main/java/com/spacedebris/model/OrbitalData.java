package com.spacedebris.model;

import java.math.BigDecimal;

public class OrbitalData {
    private Integer orbitId;
    private Integer satelliteId;
    private Integer debrisId;
    private BigDecimal altitudeKm;
    private BigDecimal inclination;

    public OrbitalData() {
    }

    public OrbitalData(Integer orbitId, Integer satelliteId, Integer debrisId, BigDecimal altitudeKm, BigDecimal inclination) {
        this.orbitId = orbitId;
        this.satelliteId = satelliteId;
        this.debrisId = debrisId;
        this.altitudeKm = altitudeKm;
        this.inclination = inclination;
    }

    public Integer getOrbitId() {
        return orbitId;
    }

    public void setOrbitId(Integer orbitId) {
        this.orbitId = orbitId;
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

    public BigDecimal getAltitudeKm() {
        return altitudeKm;
    }

    public void setAltitudeKm(BigDecimal altitudeKm) {
        this.altitudeKm = altitudeKm;
    }

    public BigDecimal getInclination() {
        return inclination;
    }

    public void setInclination(BigDecimal inclination) {
        this.inclination = inclination;
    }
}
