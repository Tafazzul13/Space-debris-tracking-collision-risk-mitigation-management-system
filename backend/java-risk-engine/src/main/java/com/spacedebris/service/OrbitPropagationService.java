package com.spacedebris.service;

import com.spacedebris.model.Ephemeris;
import com.spacedebris.model.SpaceObject;
import com.spacedebris.model.TleRecord;
import com.spacedebris.repo.EphemerisRepository;
import com.spacedebris.repo.SpaceObjectRepository;
import com.spacedebris.repo.TleRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrbitPropagationService {

    @Autowired
    private TleRecordRepository tleRepository;

    @Autowired
    private SpaceObjectRepository objectRepository;

    @Autowired
    private EphemerisRepository ephemerisRepository;

    // Earth constants
    private static final double EARTH_RADIUS_KM = 6378.137;
    private static final double MU = 398600.4418; // km^3/s^2
    private static final double XKE = 7.43669161e-5; // min^-1
    private static final double TUMIN = 1.0 / XKE; // min
    private static final double AE = 1.0; // earth radius units

    /**
     * Simplified SGP4-like propagation: converts TLE to ECI position/velocity at a given time.
     * This is a production-grade approximation for MVP. For full precision, integrate pykep/SGP4 lib.
     */
    public Ephemeris propagate(TleRecord tle, LocalDateTime targetTime) {
        double minutesFromEpoch = minutesBetween(tle.getEpoch(), targetTime);

        // Parse mean motion (revs/day) from TLE line 2 columns 53-63
        double meanMotion = parseDouble(tle.getLine2(), 52, 63); // revs/day
        double n = meanMotion * 2.0 * Math.PI / 1440.0; // rad/min

        // Parse eccentricity (line 2 cols 27-33, leading "0.")
        double ecc = parseDouble(tle.getLine2(), 26, 33) / 1e7;

        // Parse inclination (line 2 cols 8-16)
        double incl = Math.toRadians(parseDouble(tle.getLine2(), 8, 16));

        // Parse RAAN (line 2 cols 17-25)
        double raan = Math.toRadians(parseDouble(tle.getLine2(), 17, 25));

        // Parse arg of perigee (line 2 cols 34-42)
        double argp = Math.toRadians(parseDouble(tle.getLine2(), 34, 42));

        // Parse mean anomaly (line 2 cols 43-51)
        double m0 = Math.toRadians(parseDouble(tle.getLine2(), 43, 51));

        // Semi-major axis from mean motion
        double a = Math.pow(MU / Math.pow(n, 2), 1.0 / 3.0); // km

        // Mean anomaly at time t
        double m = m0 + n * minutesFromEpoch;

        // Solve Kepler's equation for eccentric anomaly E
        double E = solveKepler(m, ecc);

        // True anomaly
        double nu = 2.0 * Math.atan2(Math.sqrt(1 + ecc) * Math.sin(E / 2),
                Math.sqrt(1 - ecc) * Math.cos(E / 2));

        // Radius
        double r = a * (1 - ecc * Math.cos(E));

        // Position in orbital plane
        double xOp = r * Math.cos(nu);
        double yOp = r * Math.sin(nu);

        // Velocity in orbital plane
        double h = Math.sqrt(MU * a * (1 - ecc * ecc));
        double vxOp = -MU / h * Math.sin(nu);
        double vyOp = MU / h * (ecc + Math.cos(nu));

        // Rotation to ECI (simplified: R3(raan) * R1(incl) * R3(argp))
        double[] pos = rotate3D(xOp, yOp, 0.0, raan, incl, argp);
        double[] vel = rotate3D(vxOp, vyOp, 0.0, raan, incl, argp);

        Ephemeris eph = new Ephemeris();
        eph.setObjectId(tle.getObjectId());
        eph.setTimestamp(targetTime);
        eph.setXKm(pos[0]);
        eph.setYKm(pos[1]);
        eph.setZKm(pos[2]);
        eph.setVxKms(vel[0]);
        eph.setVyKms(vel[1]);
        eph.setVzKms(vel[2]);

        // Convert ECI to lat/lon/alt (approximate, ignoring Earth rotation for MVP)
        double rMag = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
        double lat = Math.asin(pos[2] / rMag);
        double lon = Math.atan2(pos[1], pos[0]);
        eph.setLatDeg(Math.toDegrees(lat));
        eph.setLonDeg(Math.toDegrees(lon));
        eph.setAltKm(rMag - EARTH_RADIUS_KM);

        return eph;
    }

    @Transactional
    public List<Ephemeris> generateEphemerisForObject(Long objectId, LocalDateTime start, LocalDateTime end, int stepMinutes) {
        List<Ephemeris> results = new ArrayList<>();
        TleRecord latest = tleRepository.findLatestByObjectId(objectId).stream().findFirst().orElse(null);
        if (latest == null) return results;

        LocalDateTime t = start;
        while (!t.isAfter(end)) {
            Ephemeris eph = propagate(latest, t);
            results.add(ephemerisRepository.save(eph));
            t = t.plusMinutes(stepMinutes);
        }
        return results;
    }

    private double solveKepler(double m, double ecc) {
        double E = m;
        for (int i = 0; i < 10; i++) {
            E = E - (E - ecc * Math.sin(E) - m) / (1 - ecc * Math.cos(E));
        }
        return E;
    }

    private double minutesBetween(LocalDateTime start, LocalDateTime end) {
        return java.time.Duration.between(start, end).toMinutes() +
                java.time.Duration.between(start, end).toNanosPart() / 1e9 * 60;
    }

    private double parseDouble(String s, int start, int end) {
        try {
            return Double.parseDouble(s.substring(start, end).trim());
        } catch (Exception ex) {
            return 0.0;
        }
    }

    private double[] rotate3D(double x, double y, double z, double raan, double incl, double argp) {
        double cosR = Math.cos(raan), sinR = Math.sin(raan);
        double cosI = Math.cos(incl), sinI = Math.sin(incl);
        double cosA = Math.cos(argp), sinA = Math.sin(argp);

        // R3(argp)
        double x1 = cosA * x - sinA * y;
        double y1 = sinA * x + cosA * y;
        double z1 = z;

        // R1(incl)
        double x2 = x1;
        double y2 = cosI * y1 - sinI * z1;
        double z2 = sinI * y1 + cosI * z1;

        // R3(raan)
        double x3 = cosR * x2 - sinR * y2;
        double y3 = sinR * x2 + cosR * y2;
        double z3 = z2;

        return new double[]{x3 * AE * EARTH_RADIUS_KM, y3 * AE * EARTH_RADIUS_KM, z3 * AE * EARTH_RADIUS_KM};
    }
}
