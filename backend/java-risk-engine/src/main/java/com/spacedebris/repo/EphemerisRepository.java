package com.spacedebris.repo;

import com.spacedebris.model.Ephemeris;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;

public interface EphemerisRepository extends JpaRepository<Ephemeris, Long> {
    List<Ephemeris> findByObjectId(Long objectId);

    @Query("SELECT e FROM Ephemeris e WHERE e.objectId = :objectId AND e.timestamp BETWEEN :start AND :end ORDER BY e.timestamp ASC")
    List<Ephemeris> findByObjectIdAndTimeRange(@Param("objectId") Long objectId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);
}
