package com.spacedebris.service;

import com.spacedebris.model.Conjunction;
import com.spacedebris.model.Ephemeris;
import com.spacedebris.model.SpaceObject;
import com.spacedebris.repo.ConjunctionRepository;
import com.spacedebris.repo.EphemerisRepository;
import com.spacedebris.repo.SpaceObjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ConjunctionService {

    @Autowired
    private SpaceObjectRepository objectRepository;

    @Autowired
    private EphemerisRepository ephemerisRepository;

    @Autowired
    private ConjunctionRepository conjunctionRepository;

    @Autowired
    private RiskService riskService;

    private static final double COLLISION_THRESHOLD_KM = 10.0;
    private static final double SCREENING_WINDOW_KM = 50.0;

    @Scheduled(fixedDelayString = "${conjunction.scan.interval.ms:300000}")
    @Transactional
    public void scanConjunctions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusHours(24);

        List<SpaceObject> objects = objectRepository.findByIsActiveTrue();
        List<Conjunction> found = new ArrayList<>();

        for (int i = 0; i < objects.size(); i++) {
            for (int j = i + 1; j < objects.size(); j++) {
                SpaceObject o1 = objects.get(i);
                SpaceObject o2 = objects.get(j);

                List<Ephemeris> eph1 = ephemerisRepository.findByObjectIdAndTimeRange(o1.getId(), now, windowEnd);
                List<Ephemeris> eph2 = ephemerisRepository.findByObjectIdAndTimeRange(o2.getId(), now, windowEnd);

                if (eph1.isEmpty() || eph2.isEmpty()) continue;

                // Time-synchronized screening (match timestamps)
                Map<LocalDateTime, Ephemeris> eph2Map = eph2.stream()
                        .collect(Collectors.toMap(Ephemeris::getTimestamp, e -> e, (a, b) -> a));

                for (Ephemeris ep1 : eph1) {
                    Ephemeris ep2 = eph2Map.get(ep1.getTimestamp());
                    if (ep2 == null) continue;

                    double dx = ep1.getXKm() - ep2.getXKm();
                    double dy = ep1.getYKm() - ep2.getYKm();
                    double dz = ep1.getZKm() - ep2.getZKm();
                    double dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < SCREENING_WINDOW_KM) {
                        // Deduplication: skip if a conjunction for this exact pair+TCA already exists
                        if (conjunctionRepository.existsByPrimaryObjectIdAndSecondaryObjectIdAndTca(
                                o1.getId(), o2.getId(), ep1.getTimestamp())) {
                            continue;
                        }

                        Double poc = riskService.calculatePoC(dist, o1, o2);
                        String riskLevel = riskService.classifyRisk(poc);

                        Conjunction c = new Conjunction();
                        c.setPrimaryObjectId(o1.getId());
                        c.setSecondaryObjectId(o2.getId());
                        c.setTca(ep1.getTimestamp());
                        c.setMinDistanceKm(dist);
                        c.setPoc(poc);
                        c.setRiskLevel(riskLevel);
                        c.setIsAcknowledged(false);
                        c.setCreatedAt(LocalDateTime.now());
                        found.add(c);
                    }
                }
            }
        }

        conjunctionRepository.saveAll(found);
    }

    public List<Conjunction> getActiveConjunctions() {
        return conjunctionRepository.findByIsAcknowledgedFalse();
    }

    public List<Conjunction> getConjunctionsByRisk(String riskLevel) {
        return conjunctionRepository.findByRiskLevel(riskLevel);
    }

    @Transactional
    public Conjunction acknowledgeConjunction(Long id, Long acknowledgedBy) {
        Conjunction c = conjunctionRepository.findById(id).orElseThrow(() -> new RuntimeException("Conjunction not found"));
        c.setIsAcknowledged(true);
        c.setAcknowledgedBy(acknowledgedBy);
        c.setAcknowledgedAt(LocalDateTime.now());
        return conjunctionRepository.save(c);
    }
}
