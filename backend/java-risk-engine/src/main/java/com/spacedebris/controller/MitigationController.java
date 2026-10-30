package com.spacedebris.controller;

import com.spacedebris.model.Conjunction;
import com.spacedebris.model.Maneuver;
import com.spacedebris.model.SpaceObject;
import com.spacedebris.service.ConjunctionService;
import com.spacedebris.service.ManeuverService;
import com.spacedebris.repo.SpaceObjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/mitigation")
@CrossOrigin(origins = "*")
public class MitigationController {

    @Autowired
    private ManeuverService maneuverService;

    @Autowired
    private ConjunctionService conjunctionService;

    @Autowired
    private SpaceObjectRepository objectRepository;

    @PostMapping("/maneuvers")
    public ResponseEntity<?> planManeuver(@RequestParam Long objectId,
                                                 @RequestParam(required = false) Long conjunctionId,
                                                 @RequestParam String direction,
                                                 @RequestParam String maneuverTime,
                                                 @RequestParam Double dvMs) {
        try {
            LocalDateTime mt = LocalDateTime.parse(maneuverTime);
            Maneuver m = maneuverService.planManeuver(objectId, conjunctionId, direction, mt, dvMs);
            return ResponseEntity.ok(m);
        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid maneuverTime format. Use ISO-8601 (e.g. 2024-01-01T00:00:00)");
        }
    }

    @GetMapping("/maneuvers")
    public List<Maneuver> getManeuvers() {
        return maneuverService.getPlannedManeuvers();
    }

    @PostMapping("/maneuvers/{id}/execute")
    public ResponseEntity<Maneuver> execute(@PathVariable Long id) {
        Maneuver m = maneuverService.executeManeuver(id);
        return ResponseEntity.ok(m);
    }

    @PostMapping("/maneuvers/calculate-dv")
    public ResponseEntity<Double> calculateDv(@RequestParam double missDistanceKm,
                                              @RequestParam double requiredMissDistanceKm) {
        Double dv = maneuverService.calculateDeltaV(missDistanceKm, requiredMissDistanceKm);
        return ResponseEntity.ok(dv);
    }
}
