import React, { useState } from 'react';

export default function ParentPickupApp() {
    const [parentName, setParentName] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [queueId, setQueueId] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleParentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // First, it should verify if the parent exists and get their ID
            const parentResponse = await fetch(`http://localhost:8080/api/students`);
            const allStudents = await parentResponse.json();

            // Filtering students for a specific parent
            const parentStudents = allStudents.filter(student => {
                // Matching parent name (not case-sensitive)
                return parentName.toLowerCase().includes(student.name.split(' ')[1].toLowerCase()) ||
                    student.name.toLowerCase().includes(parentName.split(' ')[0].toLowerCase());
            });

            if (parentStudents.length === 0) {
                // If no students found by name matching, show an error
                setError(`No students found for parent "${parentName}". Please check the name and try again.`);
                setLoading(false);
                return;
            }

            // Get teacher info for each student
            const teachersResponse = await fetch(`http://localhost:8080/api/teachers`);
            const teachers = await teachersResponse.json();

            // Enhancing student data with teacher info
            const enhancedStudents = parentStudents.map(student => {
                const teacher = teachers.find(t => t.id === student.teacherId);
                return {
                    ...student,
                    teacherName: teacher ? teacher.name : 'Unknown Teacher',
                    classroom: teacher ? teacher.classroom : 'Unknown Room'
                };
            });

            setStudents(enhancedStudents);

            // Generates a queue ID
            const queueNumber = Math.floor(Math.random() * 900) + 100;
            const newQueueId = `P-${queueNumber}`;
            setQueueId(newQueueId);

            setStep(2);

        } catch (error) {
            console.error('Error fetching student data:', error);
            setError('Unable to connect to the server. Please try again.');
        }

        setLoading(false);
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setStep(3);
    };

    const handleCheckIn = async () => {
        setLoading(true);

        try {
            // Submiting a pickup request to backend
            const checkInData = {
                parentName: parentName,
                childName: selectedStudent.name,
                pickupType: "car_line",
                gpsLat: 30.2672, // Static GPS coordinates
                gpsLng: -97.7431,
                accuracy: 8.0
            };

            const response = await fetch('http://localhost:8080/api/pickup/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkInData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Check-in successful! Queue ID: ${result.queueId || queueId}
                       
Student: ${selectedStudent.name}
Teacher: ${selectedStudent.teacherName}
Pickup Type: Car Line`);

                // Resets form
                setStep(1);
                setParentName("");
                setSelectedStudent(null);
                setStudents([]);
                setQueueId("");
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Check-in failed. Please try again.');
            }

        } catch (error) {
            console.error('Error during check-in:', error);
            setError('Unable to complete check-in. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-blue-500 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v8a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Parent Pickup Portal</h1>
                    <p className="text-blue-100">Secure pickup coordination with GPS verification</p>
                </div>

                {/* Display Errors */}
                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-300 rounded-lg p-4 mb-6">
                        <p className="text-red-100">{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="mt-2 text-red-200 underline text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Step 1: Parent Name Entry */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">Step 1: Enter Your Name</h2>
                        <form onSubmit={handleParentSubmit}>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    value={parentName}
                                    onChange={(e) => setParentName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full p-4 rounded-xl text-gray-800 text-lg border-2 border-transparent focus:border-blue-300 focus:outline-none"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Find My Students'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Student Selection */}
                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Step 2: Select Student</h2>
                        <p className="text-blue-100 mb-6">Hello {parentName}! Who are you picking up today?</p>

                        <div className="space-y-3 mb-6">
                            {students.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className="w-full bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-4 text-left hover:bg-opacity-20 transition-all"
                                >
                                    <div className="font-semibold text-lg">{student.name}</div>
                                    <div className="text-blue-100 text-sm mt-1">
                                        {student.grade} • {student.teacherName}
                                        {student.classroom && ` • ${student.classroom}`}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full bg-gray-600 bg-opacity-50 text-white py-3 rounded-xl hover:bg-opacity-70 transition-colors"
                        >
                            ← Back to Name Entry
                        </button>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && selectedStudent && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6">Step 3: Confirm Pickup</h2>

                        <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 mb-6">
                            <h3 className="font-semibold text-lg mb-4">Pickup Details</h3>
                            <div className="space-y-2 text-blue-100">
                                <p><strong>Parent:</strong> {parentName}</p>
                                <p><strong>Student:</strong> {selectedStudent.name}</p>
                                <p><strong>Teacher:</strong> {selectedStudent.teacherName}</p>
                                <p><strong>Grade:</strong> {selectedStudent.grade}</p>
                                <p><strong>Queue ID:</strong> <span className="font-mono text-lg">{queueId}</span></p>
                                <p><strong>Pickup Type:</strong> Car Line</p>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="w-full bg-green-500 text-white font-semibold py-4 rounded-xl text-lg hover:bg-green-600 transition-colors disabled:opacity-50 mb-3"
                        >
                            {loading ? 'Processing...' : 'Complete Check-In'}
                        </button>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-gray-600 bg-opacity-50 text-white py-3 rounded-xl hover:bg-opacity-70 transition-colors"
                        >
                            ← Back to Student Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}









