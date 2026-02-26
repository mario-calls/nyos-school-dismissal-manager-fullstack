package com.nyos.pickup.controller;

import com.nyos.pickup.model.*;
import com.nyos.pickup.service.PickupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // Lets my React app access the API
public class PickupController {

    @Autowired
    private PickupService pickupService;

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "NYOS Pickup System",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    // Getting all students for the teacher dashboard
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = pickupService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    // Getting all teachers
    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        List<Teacher> teachers = pickupService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    // Parent submits their pickup request
    @PostMapping("/pickup/checkin")
    public ResponseEntity<?> checkinForPickup(@RequestBody Map<String, Object> request) {
        try {
            String parentName = (String) request.get("parentName");
            String childName = (String) request.get("childName");
            String pickupType = (String) request.get("pickupType");
            double gpsLat = Double.parseDouble(request.get("gpsLat").toString());
            double gpsLng = Double.parseDouble(request.get("gpsLng").toString());
            double accuracy = Double.parseDouble(request.get("accuracy").toString());

            // Validating location
            if (!pickupService.validateLocation(gpsLat, gpsLng, accuracy)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Location not within school pickup area"));
            }

            PickupEvent event = pickupService.createPickupEvent(parentName, childName,
                    pickupType, gpsLat, gpsLng, accuracy);

            if (event == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Could not find student or parent, or parent not authorized"));
            }

            return ResponseEntity.ok(event);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request data: " + e.getMessage()));
        }
    }

    // Getting active pickups for admin dashboard
    @GetMapping("/admin/pickups")
    public ResponseEntity<List<PickupEvent>> getActivePickups() {
        List<PickupEvent> pickups = pickupService.getActivePickups();
        return ResponseEntity.ok(pickups);
    }

    // Getting pickups for specific teachers
    @GetMapping("/teacher/{teacherId}/pickups")
    public ResponseEntity<List<PickupEvent>> getTeacherPickups(@PathVariable int teacherId) {
        List<PickupEvent> pickups = pickupService.getPickupsForTeacher(teacherId);
        return ResponseEntity.ok(pickups);
    }

    // Getting students for specific teachers
    @GetMapping("/teacher/{teacherId}/students")
    public ResponseEntity<List<Student>> getTeacherStudents(@PathVariable int teacherId) {
        List<Student> students = pickupService.getStudentsForTeacher(teacherId);
        return ResponseEntity.ok(students);
    }

    // Updating the pickup status (sent to the pickup area, completed)
    @PutMapping("/pickup/{eventId}/status")
    public ResponseEntity<?> updatePickupStatus(@PathVariable int eventId,
                                                @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status is required"));
        }

        boolean success = pickupService.updatePickupStatus(eventId, newStatus);

        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Status updated successfully"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Could not update pickup status - invalid event ID or status"));
        }
    }

    // Getting pickup statistics for the admin dashboard
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getPickupStats() {
        Map<String, Object> stats = pickupService.getPickupStats();
        return ResponseEntity.ok(stats);
    }

    // Validating GPS location
    @PostMapping("/location/validate")
    public ResponseEntity<?> validateLocation(@RequestBody Map<String, Object> request) {
        try {
            double lat = Double.parseDouble(request.get("lat").toString());
            double lng = Double.parseDouble(request.get("lng").toString());
            double accuracy = Double.parseDouble(request.get("accuracy").toString());

            boolean isValid = pickupService.validateLocation(lat, lng, accuracy);

            return ResponseEntity.ok(Map.of(
                    "valid", isValid,
                    "message", isValid ? "Location validated" : "Not within school pickup area"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid location data: " + e.getMessage()));
        }
    }
}