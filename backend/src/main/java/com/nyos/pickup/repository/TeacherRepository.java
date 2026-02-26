package com.nyos.pickup.repository;

import com.nyos.pickup.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Integer> {

    // Finding teachers by name
    Optional<Teacher> findByNameIgnoreCase(String name);

    // Finding teachers by grade level
    List<Teacher> findByGrade(String grade);

    // Finding teachers by classroom
    Optional<Teacher> findByClassroom(String classroom);
}
