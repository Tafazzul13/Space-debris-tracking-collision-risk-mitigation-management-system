package com.spacedebris.model;

public class MitigationAction {
    private Integer actionId;
    private Integer approachId;
    private String actionType;
    private MitigationStatus status;

    public MitigationAction() {
    }

    public MitigationAction(Integer actionId, Integer approachId, String actionType, MitigationStatus status) {
        this.actionId = actionId;
        this.approachId = approachId;
        this.actionType = actionType;
        this.status = status;
    }

    public Integer getActionId() {
        return actionId;
    }

    public void setActionId(Integer actionId) {
        this.actionId = actionId;
    }

    public Integer getApproachId() {
        return approachId;
    }

    public void setApproachId(Integer approachId) {
        this.approachId = approachId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public MitigationStatus getStatus() {
        return status;
    }

    public void setStatus(MitigationStatus status) {
        this.status = status;
    }
}
