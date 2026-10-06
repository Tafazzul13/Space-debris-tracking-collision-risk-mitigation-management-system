package com.spacedebris.service;

import com.spacedebris.dao.DashboardDao;
import com.spacedebris.model.DashboardStats;

import java.sql.SQLException;

public class DashboardService {
    private final DashboardDao dashboardDao;

    public DashboardService(DashboardDao dashboardDao) {
        this.dashboardDao = dashboardDao;
    }

    public DashboardStats fetchStats() throws SQLException {
        return dashboardDao.fetchDashboardStats();
    }

    public DashboardStats sampleStats() {
        return new DashboardStats(1250, 48, 37, 4, 2);
    }
}
