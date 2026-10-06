package com.spacedebris.model;

public class Observation {
    private Integer observationId;
    private Integer debrisId;
    private Integer stationId;
    private String signalQuality;

    public Observation() {
    }

    public Observation(Integer observationId, Integer debrisId, Integer stationId, String signalQuality) {
        this.observationId = observationId;
        this.debrisId = debrisId;
        this.stationId = stationId;
        this.signalQuality = signalQuality;
    }

    public Integer getObservationId() {
        return observationId;
    }

    public void setObservationId(Integer observationId) {
        this.observationId = observationId;
    }

    public Integer getDebrisId() {
        return debrisId;
    }

    public void setDebrisId(Integer debrisId) {
        this.debrisId = debrisId;
    }

    public Integer getStationId() {
        return stationId;
    }

    public void setStationId(Integer stationId) {
        this.stationId = stationId;
    }

    public String getSignalQuality() {
        return signalQuality;
    }

    public void setSignalQuality(String signalQuality) {
        this.signalQuality = signalQuality;
    }
}
