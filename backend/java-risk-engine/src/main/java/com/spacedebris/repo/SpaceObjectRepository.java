package com.spacedebris.repo;

import com.spacedebris.model.SpaceObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SpaceObjectRepository extends JpaRepository<SpaceObject, Long> {
    List<SpaceObject> findByIsActiveTrue();
    SpaceObject findByNoradId(Integer noradId);
    boolean existsByNoradId(Integer noradId);

    @Query("SELECT so FROM SpaceObject so WHERE so.objectType = :type AND so.isActive = true")
    List<SpaceObject> findByObjectType(@Param("type") String type);
}
