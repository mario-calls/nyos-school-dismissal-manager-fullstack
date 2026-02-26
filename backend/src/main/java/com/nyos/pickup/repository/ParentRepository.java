package com.nyos.pickup.repository;

import com.nyos.pickup.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Integer> {

    // Finding parents by name
    Optional<Parent> findByNameIgnoreCase(String name);

    Optional<Parent> findByName(String name);

    // Finding parents by email
    Optional<Parent> findByEmail(String email);

    // Checking if email exists
    boolean existsByEmail(String email);
}




