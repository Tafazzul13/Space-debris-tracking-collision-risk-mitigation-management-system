package com.spacedebris.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "conjunctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conjunction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "primary_object_id", nullable = false)
    private Long primaryObjectId;

    @Column(name = "secondary_object_id", nullable = false)
    private Long secondaryObjectId;

    @Column(name = "tca", nullable = false)
    private LocalDateTime tca;

    @Column(name = "min_distance_km", precision = 12, scale = 4, nullable = false)
    private Double minDistanceKm;

    @Column(name = "poc", precision = 15, scale = 10, nullable = false)
    private Double poc;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "is_acknowledged")
    private Boolean isAcknowledged = false;

    @Column(name = "acknowledged_by")
    private Long acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
