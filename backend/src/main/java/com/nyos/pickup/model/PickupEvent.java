package com.nyos.pickup.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_events")
public class PickupEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "student_id", nullable = false)
    private int studentId;

    @Column(name = "parent_id", nullable = false)
    private int parentId;

    @Column(name = "queue_id", nullable = false, length = 10)
    private String queueId;

    @Column(name = "checkin_time")
    private LocalDateTime checkinTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_type", nullable = false)
    private PickupType pickupType;

    @Column(name = "gps_lat", nullable = false)
    private double gpsLat;

    @Column(name = "gps_lng", nullable = false)
    private double gpsLng;

    @Column(nullable = false)
    private double accuracy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "completed_time")
    private LocalDateTime completedTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Transient fields for display
    @Transient
    private String studentName;

    @Transient
    private String parentName;

    @Transient
    private String teacherName;

    @Transient
    private String grade;

    // Some more enums
    public enum PickupType {
        car_line, walk_up
    }
    public enum Status {
        waiting, sent_to_pickup, picked_up
    }

    public PickupEvent() {}

    public PickupEvent(int studentId, int parentId, String queueId, PickupType pickupType,
                       double gpsLat, double gpsLng, double accuracy) {
        this.studentId = studentId;
        this.parentId = parentId;
        this.queueId = queueId;
        this.pickupType = pickupType;
        this.gpsLat = gpsLat;
        this.gpsLng = gpsLng;
        this.accuracy = accuracy;
        this.status = Status.waiting;
        this.checkinTime = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getParentId() { return parentId; }
    public void setParentId(int parentId) { this.parentId = parentId; }

    public String getQueueId() { return queueId; }
    public void setQueueId(String queueId) { this.queueId = queueId; }

    public LocalDateTime getCheckinTime() { return checkinTime; }
    public void setCheckinTime(LocalDateTime checkinTime) { this.checkinTime = checkinTime; }

    public PickupType getPickupType() { return pickupType; }
    public void setPickupType(PickupType pickupType) { this.pickupType = pickupType; }

    public double getGpsLat() { return gpsLat; }
    public void setGpsLat(double gpsLat) { this.gpsLat = gpsLat; }

    public double getGpsLng() { return gpsLng; }
    public void setGpsLng(double gpsLng) { this.gpsLng = gpsLng; }

    public double getAccuracy() { return accuracy; }
    public void setAccuracy(double accuracy) { this.accuracy = accuracy; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCompletedTime() { return completedTime; }
    public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Transient getters/setters
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
}





