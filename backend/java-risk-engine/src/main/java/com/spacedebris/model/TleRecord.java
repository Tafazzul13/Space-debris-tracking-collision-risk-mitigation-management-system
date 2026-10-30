package com.spacedebris.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tle_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TleRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "object_id", nullable = false)
    private Long objectId;

    @Column(name = "line1", length = 100, nullable = false)
    private String line1;

    @Column(name = "line2", length = 100, nullable = false)
    private String line2;

    @Column(name = "epoch", nullable = false)
    private LocalDateTime epoch;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "ingested_at")
    private LocalDateTime ingestedAt;
}
