package com.nyos.pickup.repository;

import com.nyos.pickup.model.PickupEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PickupEventRepository extends JpaRepository<PickupEvent, Integer> {

    // Finding pickup events by queue ID
    Optional<PickupEvent> findByQueueId(String queueId);

    // Finding active pickups (not picked up yet)
    List<PickupEvent> findByStatusNot(PickupEvent.Status status);

    // Finding pickups by status
    List<PickupEvent> findByStatus(PickupEvent.Status status);

    // Finding active pickups for specific teachers
    @Query("SELECT pe FROM PickupEvent pe JOIN Student s ON pe.studentId = s.id WHERE s.teacherId = :teacherId AND pe.status != :completedStatus")
    List<PickupEvent> findActivePickupsByTeacherId(@Param("teacherId") int teacherId, @Param("completedStatus") PickupEvent.Status completedStatus);

    // Finding completed pickups for teachers today
    @Query("SELECT pe FROM PickupEvent pe JOIN Student s ON pe.studentId = s.id WHERE s.teacherId = :teacherId AND pe.status = :completedStatus AND DATE(pe.checkinTime) = CURRENT_DATE")
    List<PickupEvent> findCompletedPickupsByTeacherId(@Param("teacherId") int teacherId, @Param("completedStatus") PickupEvent.Status completedStatus);

    // Finding today's pickups
    @Query("SELECT pe FROM PickupEvent pe WHERE DATE(pe.checkinTime) = CURRENT_DATE")
    List<PickupEvent> findTodaysPickups();
}


