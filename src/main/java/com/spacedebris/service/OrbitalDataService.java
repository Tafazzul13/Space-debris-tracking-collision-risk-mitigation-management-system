package com.spacedebris.service;

import com.spacedebris.model.OrbitalData;

import java.math.BigDecimal;

public class OrbitalDataService {

    public void validate(OrbitalData orbitalData) {
        boolean hasSatellite = orbitalData.getSatelliteId() != null;
        boolean hasDebris = orbitalData.getDebrisId() != null;

        if (hasSatellite == hasDebris) {
            throw new ValidationException("OrbitalData must belong to exactly one object: satellite OR debris.");
        }

        if (orbitalData.getAltitudeKm() == null || orbitalData.getAltitudeKm().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Altitude must be greater than 0 km.");
        }

        if (orbitalData.getInclination() == null
                || orbitalData.getInclination().compareTo(BigDecimal.ZERO) < 0
                || orbitalData.getInclination().compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new ValidationException("Inclination must be between 0 and 180 degrees.");
        }
    }
}
