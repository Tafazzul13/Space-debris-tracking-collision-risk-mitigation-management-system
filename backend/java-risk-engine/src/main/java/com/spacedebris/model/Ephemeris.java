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

    @Column(name = "x_km", precision = 15, scale = 4)
    private Double xKm;

    @Column(name = "y_km", precision = 15, scale = 4)
    private Double yKm;

    @Column(name = "z_km", precision = 15, scale = 4)
    private Double zKm;

    @Column(name = "vx_kms", precision = 10, scale = 4)
    private Double vxKms;

    @Column(name = "vy_kms", precision = 10, scale = 4)
    private Double vyKms;

    @Column(name = "vz_kms", precision = 10, scale = 4)
    private Double vzKms;

    @Column(name = "lat_deg", precision = 10, scale = 6)
    private Double latDeg;

    @Column(name = "lon_deg", precision = 10, scale = 6)
    private Double lonDeg;

    @Column(name = "alt_km", precision = 10, scale = 4)
    private Double altKm;
}
