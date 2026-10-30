package com.spacedebris.controller;

import com.spacedebris.model.SpaceObject;
import com.spacedebris.repo.SpaceObjectRepository;
import com.spacedebris.repo.TleRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/objects")
@CrossOrigin(origins = "*")
public class ObjectController {

    @Autowired
    private SpaceObjectRepository objectRepository;

    @Autowired
    private TleRecordRepository tleRepository;

    @GetMapping
    public List<SpaceObject> getAll() {
        return objectRepository.findByIsActiveTrue();
    }

    @GetMapping("/{noradId}")
    public ResponseEntity<SpaceObject> getByNorad(@PathVariable Integer noradId) {
        SpaceObject o = objectRepository.findByNoradId(noradId);
        return o != null ? ResponseEntity.ok(o) : ResponseEntity.notFound().build();
    }
}
