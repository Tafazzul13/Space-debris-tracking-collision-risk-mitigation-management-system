package com.spacedebris.dao;

import com.spacedebris.model.Debris;
import com.spacedebris.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcDebrisDao implements DebrisDao {
    @Override
    public int create(Debris entity) throws SQLException {
        String sql = "INSERT INTO debris (object_name, object_type, status) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, entity.getObjectName());
            ps.setString(2, entity.getObjectType());
            ps.setString(3, entity.getStatus());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    @Override
    public Optional<Debris> findById(Integer id) throws SQLException {
        String sql = "SELECT debris_id, object_name, object_type, status FROM debris WHERE debris_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(map(rs));
                }
            }
        }
        return Optional.empty();
    }

    @Override
    public List<Debris> findAll() throws SQLException {
        String sql = "SELECT debris_id, object_name, object_type, status FROM debris ORDER BY debris_id";
        List<Debris> debrisList = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                debrisList.add(map(rs));
            }
        }
        return debrisList;
    }

    @Override
    public boolean update(Debris entity) throws SQLException {
        String sql = "UPDATE debris SET object_name = ?, object_type = ?, status = ? WHERE debris_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, entity.getObjectName());
            ps.setString(2, entity.getObjectType());
            ps.setString(3, entity.getStatus());
            ps.setInt(4, entity.getDebrisId());
            return ps.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteById(Integer id) throws SQLException {
        String sql = "DELETE FROM debris WHERE debris_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private Debris map(ResultSet rs) throws SQLException {
        return new Debris(
                rs.getInt("debris_id"),
                rs.getString("object_name"),
                rs.getString("object_type"),
                rs.getString("status")
        );
    }
}
