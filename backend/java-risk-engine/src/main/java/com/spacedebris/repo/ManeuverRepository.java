package com.spacedebris.repo;

import com.spacedebris.model.Maneuver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ManeuverRepository extends JpaRepository<Maneuver, Long> {
    List<Maneuver> findByObjectId(Long objectId);
    List<Maneuver> findByStatus(String status);
}
