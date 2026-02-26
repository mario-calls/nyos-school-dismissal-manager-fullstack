import React, { useState, useEffect } from 'react'

export default function TeacherDashboard() {
    const [activePickups, setActivePickups] = useState([])
    const [myStudents, setMyStudents] = useState([])

    useEffect(() => {
        setActivePickups([
            {
                "id": 1,
                "queueId": "P-247",
                "studentName": "Kohaan Callaway",
                "parentName": "Mario Callaway",
                "status": "Waiting"
            }
        ])

        setMyStudents([
            {
                "id": 1,
                "name": "Kohaan Callaway",
                "status": "Pickup ready"
            },
            {
                "id": 2,
                "name": "Emma Martinez",
                "status": "In class"
            },
            {
                "id": 3,
                "name": "Oliver Brown",
                "status": "In class"
            }
        ])
    }, [])

    const handleSendToPickup = (pickupId) => {
        setActivePickups(activePickups.map(pickup =>
            pickup.id === pickupId
                ? { ...pickup, status: "Sent to pickup" }
                : pickup
        ))
    }

    const handleMarkComplete = (pickupId) => {
        setActivePickups(activePickups.filter(pickup => pickup.id !== pickupId))
    }

    return (
        <div>
            <h2>Teacher Dashboard - Mrs. Ashcar</h2>
            <p>Room 2A - 2nd Grade</p>

            <h3>Active Pickups ({activePickups.length})</h3>
            {activePickups.map((pickup) => (
                <div key={pickup.id}>
                    <p>Queue: {pickup.queueId} - {pickup.studentName} - Parent: {pickup.parentName}</p>
                    <p>Status: {pickup.status}</p>
                    {pickup.status === "Waiting" && (
                        <button onClick={() => handleSendToPickup(pickup.id)}>
                            Send to Pickup
                        </button>
                    )}
                    {pickup.status === "Sent to pickup" && (
                        <button onClick={() => handleMarkComplete(pickup.id)}>
                            Mark Complete
                        </button>
                    )}
                </div>
            ))}

            <h3>My Students</h3>
            {myStudents.map((student) => (
                <div key={student.id}>
                    <p>{student.name} - Status: {student.status}</p>
                </div>
            ))}
        </div>
    )
}



