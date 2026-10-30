package com.spacedebris.service;

import com.spacedebris.model.SpaceObject;
import org.springframework.stereotype.Service;

@Service
public class RiskService {

    private static final double POCA_THRESHOLD_CRITICAL = 1e-4;
    private static final double POCA_THRESHOLD_HIGH = 1e-6;
    private static final double POCA_THRESHOLD_MEDIUM = 1e-8;

    /**
     * Probability of Collision (PoC) calculation using simplified Gaussian model.
     * PoC = (1 / (2 * pi * sigma^2)) * exp(-d^2 / (2 * sigma^2)) * effective_area
     * where sigma is combined position uncertainty and effective_area accounts for object sizes.
     */
    public Double calculatePoC(double distanceKm, SpaceObject o1, SpaceObject o2) {
        double sigma = 1.0; // km, combined 1-sigma position uncertainty (simplified)
        double rcs1 = o1.getRcsM2() != null ? o1.getRcsM2() : 1.0;
        double rcs2 = o2.getRcsM2() != null ? o2.getRcsM2() : 1.0;
        double effectiveRadius = Math.sqrt(rcs1 / Math.PI) + Math.sqrt(rcs2 / Math.PI);
        effectiveRadius = effectiveRadius / 1000.0; // convert m to km

        double exponent = -(distanceKm * distanceKm) / (2.0 * sigma * sigma);
        double base = 1.0 / (2.0 * Math.PI * sigma * sigma);
        double poc = base * Math.exp(exponent) * Math.PI * effectiveRadius * effectiveRadius;

        // Clamp
        if (poc > 1.0) poc = 1.0;
        if (poc < 0.0) poc = 0.0;
        return poc;
    }

    public String classifyRisk(Double poc) {
        if (poc >= POCA_THRESHOLD_CRITICAL) return "CRITICAL";
        if (poc >= POCA_THRESHOLD_HIGH) return "HIGH";
        if (poc >= POCA_THRESHOLD_MEDIUM) return "MEDIUM";
        return "LOW";
    }

    public String getRiskColor(String riskLevel) {
        switch (riskLevel) {
            case "CRITICAL": return "#ff0000";
            case "HIGH": return "#ff6600";
            case "MEDIUM": return "#ffcc00";
            default: return "#00cc00";
        }
    }
}
