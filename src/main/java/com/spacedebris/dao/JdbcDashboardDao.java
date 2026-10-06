package com.spacedebris.dao;

import com.spacedebris.model.DashboardStats;
import com.spacedebris.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JdbcDashboardDao implements DashboardDao {
    @Override
    public DashboardStats fetchDashboardStats() throws SQLException {
        String sql = "SELECT total_tracked_debris, active_satellites, close_approaches, high_risk_events, pending_mitigation_actions FROM v_dashboard_summary";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) {
                return new DashboardStats(0, 0, 0, 0, 0);
            }
            return new DashboardStats(
                    rs.getInt("total_tracked_debris"),
                    rs.getInt("active_satellites"),
                    rs.getInt("close_approaches"),
                    rs.getInt("high_risk_events"),
                    rs.getInt("pending_mitigation_actions")
            );
        }
    }
}
