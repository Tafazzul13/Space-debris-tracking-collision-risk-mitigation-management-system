package com.spacedebris.repo;

import com.spacedebris.model.Conjunction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;

public interface ConjunctionRepository extends JpaRepository<Conjunction, Long> {
    List<Conjunction> findByRiskLevel(String riskLevel);
    List<Conjunction> findByIsAcknowledgedFalse();
    List<Conjunction> findByTcaBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT c FROM Conjunction c WHERE (c.primaryObjectId = :oid OR c.secondaryObjectId = :oid) ORDER BY c.tca DESC")
    List<Conjunction> findByObjectId(@Param("oid") Long oid);
}
