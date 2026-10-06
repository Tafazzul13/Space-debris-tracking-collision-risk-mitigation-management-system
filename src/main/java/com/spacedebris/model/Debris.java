package com.spacedebris.model;

public class Debris {
    private Integer debrisId;
    private String objectName;
    private String objectType;
    private String status;

    public Debris() {
    }

    public Debris(Integer debrisId, String objectName, String objectType, String status) {
        this.debrisId = debrisId;
        this.objectName = objectName;
        this.objectType = objectType;
        this.status = status;
    }

    public Integer getDebrisId() {
        return debrisId;
    }

    public void setDebrisId(Integer debrisId) {
        this.debrisId = debrisId;
    }

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public String getObjectType() {
        return objectType;
    }

    public void setObjectType(String objectType) {
        this.objectType = objectType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
