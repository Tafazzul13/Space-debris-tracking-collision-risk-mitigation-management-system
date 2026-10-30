package com.spacedebris.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maneuvers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Maneuver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "object_id", nullable = false)
    private Long objectId;

    @Column(name = "conjunction_id")
    private Long conjunctionId;

    @Column(name = "dv_ms", precision = 10, scale = 4, nullable = false)
    private Double dvMs;

    @Column(name = "direction", length = 50)
    private String direction;

    @Column(name = "maneuver_time", nullable = false)
    private LocalDateTime maneuverTime;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "new_tle_line1", length = 100)
    private String newTleLine1;

    @Column(name = "new_tle_line2", length = 100)
    private String newTleLine2;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
