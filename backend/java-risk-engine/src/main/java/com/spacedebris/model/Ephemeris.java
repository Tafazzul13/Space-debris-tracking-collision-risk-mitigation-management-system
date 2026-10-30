package com.spacedebris.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ephemeris")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ephemeris {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "object_id", nullable = false)
    private Long objectId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "x_km")
    private Double xKm;

    @Column(name = "y_km")
    private Double yKm;

    @Column(name = "z_km")
    private Double zKm;

    @Column(name = "vx_kms")
    private Double vxKms;

    @Column(name = "vy_kms")
    private Double vyKms;

    @Column(name = "vz_kms")
    private Double vzKms;

    @Column(name = "lat_deg")
    private Double latDeg;

    @Column(name = "lon_deg")
    private Double lonDeg;

    @Column(name = "alt_km")
    private Double altKm;
}
