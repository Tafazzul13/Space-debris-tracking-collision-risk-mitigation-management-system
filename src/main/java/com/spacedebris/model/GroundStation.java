package com.spacedebris.model;

public class GroundStation {
    private Integer stationId;
    private String stationName;
    private String country;
    private String status;

    public GroundStation() {
    }

    public GroundStation(Integer stationId, String stationName, String country, String status) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.country = country;
        this.status = status;
    }

    public Integer getStationId() {
        return stationId;
    }

    public void setStationId(Integer stationId) {
        this.stationId = stationId;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
