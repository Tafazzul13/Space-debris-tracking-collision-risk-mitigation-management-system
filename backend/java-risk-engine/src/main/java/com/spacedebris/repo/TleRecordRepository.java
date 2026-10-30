package com.spacedebris.repo;

import com.spacedebris.model.TleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;

public interface TleRecordRepository extends JpaRepository<TleRecord, Long> {
    List<TleRecord> findByObjectId(Long objectId);

    @Query("SELECT t FROM TleRecord t WHERE t.objectId = :objectId ORDER BY t.epoch DESC")
    List<TleRecord> findLatestByObjectId(@Param("objectId") Long objectId);
}
