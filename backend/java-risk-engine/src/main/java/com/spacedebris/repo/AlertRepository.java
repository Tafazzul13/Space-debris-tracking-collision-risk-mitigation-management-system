package com.spacedebris.repo;

import com.spacedebris.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findBySeverity(String severity);
    List<Alert> findByIsReadFalse();

    @Query("SELECT a FROM Alert a WHERE a.conjunctionId = :cid ORDER BY a.sentAt DESC")
    List<Alert> findByConjunctionId(@Param("cid") Long cid);
}
