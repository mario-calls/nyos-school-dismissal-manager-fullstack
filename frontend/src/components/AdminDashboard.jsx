import React, { useState, useEffect } from 'react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({})
    const [allPickups, setAllPickups] = useState([])

    useEffect(() => {
        setStats({
            "totalStudents": 120,
            "activePickups": 3,
            "completedToday": 15,
            "waitingPickups": 2
        })

        setAllPickups([
            {
                "id": 1,
                "queueId": "P-247",
                "studentName": "Kohaan Callaway",
                "teacherName": "Mrs. Ashcar",
                "status": "Waiting"
            },
            {
                "id": 2,
                "queueId": "P-245",
                "studentName": "Sarah Kim",
                "teacherName": "Mr. Rodriguez",
                "status": "Sent to pickup"
            }
        ])
    }, [])

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <p>Pickup Management System</p>

            <h3>Today's Statistics</h3>
            <p>Total Students: {stats.totalStudents}</p>
            <p>Active Pickups: {stats.activePickups}</p>
            <p>Completed Today: {stats.completedToday}</p>
            <p>Currently Waiting: {stats.waitingPickups}</p>

            <h3>All Active Pickups</h3>
            {allPickups.map((pickup) => (
                <div key={pickup.id}>
                    <p>{pickup.queueId} - {pickup.studentName} - {pickup.teacherName} - {pickup.status}</p>
                </div>
            ))}
        </div>
    )
}



