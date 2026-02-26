package com.nyos.pickup.repository;

import com.nyos.pickup.model.SchoolZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchoolZoneRepository extends JpaRepository<SchoolZone, Integer> {

    // Finding zone by school name
    Optional<SchoolZone> findBySchoolName(String schoolName);

    // In this project demo, I'll just be using one school zone
    default SchoolZone getDefaultSchoolZone() {
        return findAll().stream().findFirst().orElse(null);
    }
}




