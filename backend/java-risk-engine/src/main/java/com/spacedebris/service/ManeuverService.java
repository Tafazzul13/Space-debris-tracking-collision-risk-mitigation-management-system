package com.spacedebris.service;

import com.spacedebris.model.Maneuver;
import com.spacedebris.model.Conjunction;
import com.spacedebris.repo.ManeuverRepository;
import com.spacedebris.repo.ConjunctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManeuverService {

    @Autowired
    private ManeuverRepository maneuverRepository;

    @Autowired
    private ConjunctionRepository conjunctionRepository;

    /**
     * Delta-v calculation for collision avoidance maneuver.
     * Simplified: dv = 2 * v * sin(theta/2) where theta is required angle change.
     * For MVP: dv_ms = 0.1 to 1.0 m/s typical for small avoidance.
     */
    public Double calculateDeltaV(double missDistanceKm, double requiredMissDistanceKm) {
        double improvementFactor = Math.max(1.0, requiredMissDistanceKm / Math.max(missDistanceKm, 0.1));
        double baseDv = 0.5; // m/s base
        double dv = baseDv * Math.log(improvementFactor + 1.0);
        return Math.round(dv * 10000.0) / 10000.0;
    }

    @Transactional
    public Maneuver planManeuver(Long objectId, Long conjunctionId, String direction, LocalDateTime maneuverTime, double dvMs) {
        Maneuver m = new Maneuver();
        m.setObjectId(objectId);
        m.setConjunctionId(conjunctionId);
        m.setDvMs(dvMs);
        m.setDirection(direction);
        m.setManeuverTime(maneuverTime);
        m.setStatus("PLANNED");
        m.setCreatedAt(LocalDateTime.now());
        return maneuverRepository.save(m);
    }

    public List<Maneuver> getPlannedManeuvers() {
        return maneuverRepository.findByStatus("PLANNED");
    }

    @Transactional
    public Maneuver executeManeuver(Long id) {
        Maneuver m = maneuverRepository.findById(id).orElseThrow(() -> new RuntimeException("Maneuver not found"));
        m.setStatus("EXECUTED");
        return maneuverRepository.save(m);
    }
}
