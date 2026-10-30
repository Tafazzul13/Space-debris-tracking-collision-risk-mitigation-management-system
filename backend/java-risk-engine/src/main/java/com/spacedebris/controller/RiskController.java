package com.spacedebris.controller;

import com.spacedebris.model.Conjunction;
import com.spacedebris.model.Ephemeris;
import com.spacedebris.model.SpaceObject;
import com.spacedebris.service.ConjunctionService;
import com.spacedebris.service.OrbitPropagationService;
import com.spacedebris.service.RiskService;
import com.spacedebris.repo.SpaceObjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*")
public class RiskController {

    @Autowired
    private ConjunctionService conjunctionService;

    @Autowired
    private RiskService riskService;

    @Autowired
    private OrbitPropagationService propagationService;

    @Autowired
    private SpaceObjectRepository objectRepository;

    @GetMapping("/conjunctions")
    public List<Conjunction> getConjunctions(@RequestParam(required = String) String riskLevel) {
        if (riskLevel != null && !riskLevel.isEmpty()) {
            return conjunctionService.getConjunctionsByRisk(riskLevel);
        }
        return conjunctionService.getActiveConjunctions();
    }

    @GetMapping("/conjunctions/{id}/acknowledge")
    public ResponseEntity<Conjunction> acknowledge(@PathVariable Long id,
                                                   @RequestParam(required = false) Long userId) {
        Conjunction c = conjunctionService.acknowledgeConjunction(id, userId);
        return ResponseEntity.ok(c);
    }

    @PostMapping("/scan")
    public ResponseEntity<String> scanNow() {
        conjunctionService.scanConjunctions();
        return ResponseEntity.ok("Conjunction scan completed");
    }

    @GetMapping("/objects/{objectId}/ephemeris")
    public List<Ephemeris> getEphemeris(@PathVariable Long objectId,
                                        @RequestParam String start,
                                        @RequestParam String end) {
        LocalDateTime s = LocalDateTime.parse(start);
        LocalDateTime e = LocalDateTime.parse(end);
        return propagationService.generateEphemerisForObject(objectId, s, e, 60);
    }

    @GetMapping("/risk-color/{riskLevel}")
    public String getRiskColor(@PathVariable String riskLevel) {
        return riskService.getRiskColor(riskLevel);
    }

    @GetMapping("/objects")
    public List<SpaceObject> getObjects() {
        return objectRepository.findByIsActiveTrue();
    }
}
