package com.spacedebris.dao;

import com.spacedebris.model.DashboardStats;

import java.sql.SQLException;

public interface DashboardDao {
    DashboardStats fetchDashboardStats() throws SQLException;
}
