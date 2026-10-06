package com.spacedebris.service;

import com.spacedebris.model.OrbitalData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OrbitalDataServiceTest {
    private final OrbitalDataService service = new OrbitalDataService();

    @Test
    void shouldAcceptSatelliteOwnedOrbitalData() {
        OrbitalData orbitalData = new OrbitalData(null, 1, null, BigDecimal.valueOf(550), BigDecimal.valueOf(97.4));
        assertDoesNotThrow(() -> service.validate(orbitalData));
    }

    @Test
    void shouldRejectWhenBothSatelliteAndDebrisSet() {
        OrbitalData orbitalData = new OrbitalData(null, 1, 2, BigDecimal.valueOf(550), BigDecimal.valueOf(97.4));
        assertThrows(ValidationException.class, () -> service.validate(orbitalData));
    }

    @Test
    void shouldRejectWhenNeitherSatelliteNorDebrisSet() {
        OrbitalData orbitalData = new OrbitalData(null, null, null, BigDecimal.valueOf(550), BigDecimal.valueOf(97.4));
        assertThrows(ValidationException.class, () -> service.validate(orbitalData));
    }
}
