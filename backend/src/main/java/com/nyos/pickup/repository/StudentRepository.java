package com.nyos.pickup.repository;

import com.nyos.pickup.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    // Finding students with the teacher ID
    List<Student> findByTeacherId(int teacherId);

    // Finding student by name
    Optional<Student> findByNameIgnoreCase(String name);

    Optional<Student> findByNameAndParentId(String name, int parentId);

    // Finding students by grade level
    List<Student> findByGrade(String grade);

    // Finding students by parent ID
    List<Student> findByParentId(int parentId);
}




