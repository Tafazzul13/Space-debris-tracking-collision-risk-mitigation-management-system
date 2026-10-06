package com.spacedebris.model;

public class DashboardStats {
    private final int totalTrackedDebris;
    private final int activeSatellites;
    private final int closeApproaches;
    private final int highRiskEvents;
    private final int pendingMitigationActions;

    public DashboardStats(int totalTrackedDebris, int activeSatellites, int closeApproaches, int highRiskEvents, int pendingMitigationActions) {
        this.totalTrackedDebris = totalTrackedDebris;
        this.activeSatellites = activeSatellites;
        this.closeApproaches = closeApproaches;
        this.highRiskEvents = highRiskEvents;
        this.pendingMitigationActions = pendingMitigationActions;
    }

    public int getTotalTrackedDebris() {
        return totalTrackedDebris;
    }

    public int getActiveSatellites() {
        return activeSatellites;
    }

    public int getCloseApproaches() {
        return closeApproaches;
    }

    public int getHighRiskEvents() {
        return highRiskEvents;
    }

    public int getPendingMitigationActions() {
        return pendingMitigationActions;
    }
}
