package com.spacedebris.model;

public class Satellite {
    private Integer satelliteId;
    private String name;
    private String operator;
    private String status;

    public Satellite() {
    }

    public Satellite(Integer satelliteId, String name, String operator, String status) {
        this.satelliteId = satelliteId;
        this.name = name;
        this.operator = operator;
        this.status = status;
    }

    public Integer getSatelliteId() {
        return satelliteId;
    }

    public void setSatelliteId(Integer satelliteId) {
        this.satelliteId = satelliteId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
