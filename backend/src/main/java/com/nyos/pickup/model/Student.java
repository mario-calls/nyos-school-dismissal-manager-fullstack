package com.nyos.pickup.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String grade;

    @Column(name = "teacher_id", nullable = false)
    private int teacherId;

    @Column(name = "parent_id", nullable = false)
    private int parentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_pickup")
    private PickupType defaultPickup;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Enum for my pickup types
    public enum PickupType {
        car_line, walk_up
    }

    // Constructors
    public Student() {}

    public Student(String name, String grade, int teacherId, int parentId, PickupType defaultPickup) {
        this.name = name;
        this.grade = grade;
        this.teacherId = teacherId;
        this.parentId = parentId;
        this.defaultPickup = defaultPickup;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public int getTeacherId() { return teacherId; }
    public void setTeacherId(int teacherId) { this.teacherId = teacherId; }

    public int getParentId() { return parentId; }
    public void setParentId(int parentId) { this.parentId = parentId; }

    public PickupType getDefaultPickup() { return defaultPickup; }
    public void setDefaultPickup(PickupType defaultPickup) { this.defaultPickup = defaultPickup; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


