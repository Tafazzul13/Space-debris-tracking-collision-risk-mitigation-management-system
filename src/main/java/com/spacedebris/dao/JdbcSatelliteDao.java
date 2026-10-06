package com.spacedebris.dao;

import com.spacedebris.model.Satellite;
import com.spacedebris.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcSatelliteDao implements SatelliteDao {
    @Override
    public int create(Satellite entity) throws SQLException {
        String sql = "INSERT INTO satellite (name, operator, status) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, entity.getName());
            ps.setString(2, entity.getOperator());
            ps.setString(3, entity.getStatus());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
            return 0;
        }
    }

    @Override
    public Optional<Satellite> findById(Integer id) throws SQLException {
        String sql = "SELECT satellite_id, name, operator, status FROM satellite WHERE satellite_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(map(rs));
                }
            }
            return Optional.empty();
        }
    }

    @Override
    public List<Satellite> findAll() throws SQLException {
        String sql = "SELECT satellite_id, name, operator, status FROM satellite ORDER BY satellite_id";
        List<Satellite> satellites = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                satellites.add(map(rs));
            }
        }
        return satellites;
    }

    @Override
    public boolean update(Satellite entity) throws SQLException {
        String sql = "UPDATE satellite SET name = ?, operator = ?, status = ? WHERE satellite_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, entity.getName());
            ps.setString(2, entity.getOperator());
            ps.setString(3, entity.getStatus());
            ps.setInt(4, entity.getSatelliteId());
            return ps.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteById(Integer id) throws SQLException {
        String sql = "DELETE FROM satellite WHERE satellite_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private Satellite map(ResultSet rs) throws SQLException {
        return new Satellite(
                rs.getInt("satellite_id"),
                rs.getString("name"),
                rs.getString("operator"),
                rs.getString("status")
        );
    }
}
