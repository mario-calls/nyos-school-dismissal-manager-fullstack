package com.nyos.pickup.service;

import com.nyos.pickup.model.*;
import com.nyos.pickup.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PickupService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PickupEventRepository pickupEventRepository;

    @Autowired
    private SchoolZoneRepository schoolZoneRepository;

    public String generateQueueId() {
        LocalDateTime now = LocalDateTime.now();
        String timeComponent = now.getHour() >= 12 ? "P" : "A"; // P=PM, A=AM
        int randomNumber = (int)(Math.random() * 900) + 100; // 100-999
        return timeComponent + "-" + randomNumber;
    }

    public boolean validateLocation(double lat, double lng, double accuracy) {
        // Getting the default school zone
        SchoolZone zone = schoolZoneRepository.getDefaultSchoolZone();
        if (zone == null) {
            // If no zone is defined, it will allow all locations for my demo.
            return true;
        }

        // Calculating distance using the Haversine formula
        double distance = calculateDistance(lat, lng, zone.getCenterLat(), zone.getCenterLng());

        // Checking if within zone radius (based on GPS accuracy)
        return distance <= (zone.getRadiusMeters() + accuracy);
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371000; // Earth's radius in meters

        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public PickupEvent createPickupEvent(String parentName, String childName,
                                         String pickupType, double gpsLat, double gpsLng, double accuracy) {

        // Finding parent by name
        Optional<Parent> parentOpt = parentRepository.findByName(parentName);
        if (parentOpt.isEmpty()) {
            return null; // if parent not found
        }
        Parent parent = parentOpt.get();

        // Finding student by name and verify they belong to this parent
        Optional<Student> studentOpt = studentRepository.findByNameAndParentId(childName, parent.getId());
        if (studentOpt.isEmpty()) {
            return null; // If student is not found or doesn't belong to the parent
        }
        Student student = studentOpt.get();

        // Converting pickup type string to an enum
        PickupEvent.PickupType type = "car_line".equals(pickupType) ?
                PickupEvent.PickupType.car_line : PickupEvent.PickupType.walk_up;

        PickupEvent event = new PickupEvent(
                student.getId(),
                parent.getId(),
                generateQueueId(),
                type,
                gpsLat,
                gpsLng,
                accuracy
        );

        // Saving to database
        event = pickupEventRepository.save(event);

        // Setting up display information
        populateEventDisplayInfo(event, student, parent);

        return event;
    }

    private void populateEventDisplayInfo(PickupEvent event, Student student, Parent parent) {
        event.setStudentName(student.getName());
        event.setParentName(parent.getName());
        event.setGrade(student.getGrade());

        // Getting teacher's name
        Optional<Teacher> teacherOpt = teacherRepository.findById(student.getTeacherId());
        teacherOpt.ifPresent(teacher -> event.setTeacherName(teacher.getName()));
    }

    public List<PickupEvent> getActivePickups() {
        List<PickupEvent> events = pickupEventRepository.findByStatusNot(PickupEvent.Status.picked_up);

        // Populating display info for each event
        return events.stream()
                .map(this::populateEventDisplayInfo)
                .collect(Collectors.toList());
    }

    public List<PickupEvent> getPickupsForTeacher(int teacherId) {
        List<PickupEvent> events = pickupEventRepository.findActivePickupsByTeacherId(teacherId, PickupEvent.Status.picked_up);

        return events.stream()
                .map(this::populateEventDisplayInfo)
                .collect(Collectors.toList());
    }

    public List<PickupEvent> getCompletedPickupsForTeacher(int teacherId) {
        List<PickupEvent> events = pickupEventRepository.findCompletedPickupsByTeacherId(teacherId, PickupEvent.Status.picked_up);

        return events.stream()
                .map(this::populateEventDisplayInfo)
                .collect(Collectors.toList());
    }

    public List<PickupEvent> getTodaysPickups() {
        List<PickupEvent> events = pickupEventRepository.findTodaysPickups();

        return events.stream()
                .map(this::populateEventDisplayInfo)
                .collect(Collectors.toList());
    }

    public Optional<PickupEvent> getPickupByQueueId(String queueId) {
        Optional<PickupEvent> eventOpt = pickupEventRepository.findByQueueId(queueId);

        if (eventOpt.isPresent()) {
            return Optional.of(populateEventDisplayInfo(eventOpt.get()));
        }

        return Optional.empty();
    }

    private PickupEvent populateEventDisplayInfo(PickupEvent event) {
        // Getting student info
        Optional<Student> studentOpt = studentRepository.findById(event.getStudentId());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            event.setStudentName(student.getName());
            event.setGrade(student.getGrade());

            // Getting teacher info
            Optional<Teacher> teacherOpt = teacherRepository.findById(student.getTeacherId());
            teacherOpt.ifPresent(teacher -> event.setTeacherName(teacher.getName()));
        }

        // Getting parent info
        Optional<Parent> parentOpt = parentRepository.findById(event.getParentId());
        parentOpt.ifPresent(parent -> event.setParentName(parent.getName()));

        return event;
    }

    public boolean updatePickupStatus(int eventId, String newStatus) {
        Optional<PickupEvent> eventOpt = pickupEventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return false;
        }

        PickupEvent event = eventOpt.get();

        // Converting string to an enum
        PickupEvent.Status status;
        try {
            status = PickupEvent.Status.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            return false; // Invalid
        }

        event.setStatus(status);

        // Setting completion time if kid is picked up
        if (status == PickupEvent.Status.picked_up) {
            event.setCompletedTime(LocalDateTime.now());
        }

        pickupEventRepository.save(event);
        return true;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsForTeacher(int teacherId) {
        return studentRepository.findByTeacherId(teacherId);
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Map<String, Object> getPickupStats() {
        long totalStudents = studentRepository.count();

        // Getting today's pickup stats
        List<PickupEvent> todaysEvents = pickupEventRepository.findTodaysPickups();

        long totalToday = todaysEvents.size();
        long waiting = todaysEvents.stream()
                .filter(event -> event.getStatus() == PickupEvent.Status.waiting)
                .count();
        long sentToPickup = todaysEvents.stream()
                .filter(event -> event.getStatus() == PickupEvent.Status.sent_to_pickup)
                .count();
        long completed = todaysEvents.stream()
                .filter(event -> event.getStatus() == PickupEvent.Status.picked_up)
                .count();

        // Calculating average wait time (still fake for the demo)
        double avgWaitTime = 3.2; // minutes

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalToday", totalToday);
        stats.put("waiting", waiting);
        stats.put("sentToPickup", sentToPickup);
        stats.put("completed", completed);
        stats.put("averageWaitTime", avgWaitTime + " min");

        return stats;
    }
}




