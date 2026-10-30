package com.spacedebris.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "space_objects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpaceObject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "norad_id", unique = true)
    private Integer noradId;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "object_type", length = 50)
    private String objectType;

    @Column(name = "owner_country", length = 100)
    private String ownerCountry;

    @Column(name = "rcs_m2", precision = 10, scale = 4)
    private Double rcsM2;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
