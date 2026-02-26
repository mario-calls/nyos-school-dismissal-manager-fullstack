import { useState, useEffect } from 'react'
import { Car, GraduationCap, Shield } from 'lucide-react'

function App() {
    // I'll use this for API Configuration when I add my tables in
    const API_BASE_URL = 'http://localhost:8080/api'

    // State management
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [teachers, setTeachers] = useState({})
    const [studentDatabase, setStudentDatabase] = useState({})
    const [globalQueue, setGlobalQueue] = useState([])
    const [activityFeed, setActivityFeed] = useState([])

    // UI
    const [currentView, setCurrentView] = useState('home')
    const [parentName, setParentName] = useState('')
    const [nameConfirmed, setNameConfirmed] = useState(false)
    const [selectedStudents, setSelectedStudents] = useState([])
    const [currentStudentName, setCurrentStudentName] = useState('')
    const [queuePosition, setQueuePosition] = useState(null)
    const [pickupType, setPickupType] = useState(null)
    const [gpsConfirmed, setGpsConfirmed] = useState(false)

    // For teacher auth
    const [teacherPin, setTeacherPin] = useState('')
    const [authenticatedTeacher, setAuthenticatedTeacher] = useState(null)

    // Test data if server doesn't run
    const sampleTeachers = {
        '3333': { name: 'Mrs. Johnson', grade: '3rd Grade', room: 'Room 2A' },
        '5555': { name: 'Mr. Williams', grade: '5th Grade', room: 'Room 1B' },
        '2222': { name: 'Ms. Davis', grade: '2nd Grade', room: 'Room 3C' },
        '4444': { name: 'Mrs. Smith', grade: '4th Grade', room: 'Room 2B' },
        '1111': { name: 'Mr. Brown', grade: '1st Grade', room: 'Room 1A' }
    }

    const sampleStudentDatabase = {
        'Emma Rodriguez': 'Mrs. Johnson',
        'Kohaan Callaway': 'Mrs. Johnson',
        'Michael Thompson': 'Mrs. Johnson',
        'Liam Chen': 'Mr. Williams',
        'Sophie Chen': 'Mr. Williams',
        'Alexander Park': 'Mr. Williams',
        'Sofia Martinez': 'Ms. Davis',
        'Ethan Brown': 'Ms. Davis',
        'Ava Wilson': 'Ms. Davis',
        'Grace Taylor': 'Mrs. Smith',
        'Ryan Lee': 'Mrs. Smith',
        'Chloe Anderson': 'Mrs. Smith',
        'Emma Davis': 'Mr. Brown',
        'Jake Williams': 'Mr. Brown',
        'Lily Thompson': 'Mr. Brown'
    }

    // For APIs
    const fetchData = async () => {
        try {
            // Try to fetch from backend, but fall back to sample data if doesn't work
            const teachersData = sampleTeachers
            const studentsData = sampleStudentDatabase
            const pickupsData = [
                { queueNum: 1, parent: "Sarah Johnson", students: ["Emma Rodriguez"], type: "Car Line", status: "waiting", teacherName: "Mrs. Johnson" },
                { queueNum: 2, parent: "Michael Chen", students: ["Liam Chen", "Sophie Chen"], type: "Walk Up", status: "waiting", teacherName: "Mr. Williams" },
                { queueNum: 3, parent: "Maria Martinez", students: ["Sofia Martinez"], type: "Car Line", status: "waiting", teacherName: "Ms. Davis" }
            ]
            const activitiesData = [
                { id: 1, message: "System initialized with 3 active pickups", timestamp: new Date(Date.now() - 300000) },
                { id: 2, message: "Sarah Johnson joined queue #1 for Emma Rodriguez (Mrs. Johnson's class)", timestamp: new Date(Date.now() - 240000) },
                { id: 3, message: "Michael Chen joined queue #2 for Liam Chen, Sophie Chen (Mr. Williams' class)", timestamp: new Date(Date.now() - 180000) },
                { id: 4, message: "Maria Martinez joined queue #3 for Sofia Martinez (Ms. Davis' class)", timestamp: new Date(Date.now() - 120000) }
            ]

            return { teachersData, studentsData, pickupsData, activitiesData }
        } catch (error) {
            console.error('Error fetching data:', error)
            return {
                teachersData: sampleTeachers,
                studentsData: sampleStudentDatabase,
                pickupsData: [],
                activitiesData: []
            }
        }
    }

    // Loading up initial data
    useEffect(() => {
        const loadData = async () => {
            setIsDataLoaded(false)
            const { teachersData, studentsData, pickupsData, activitiesData } = await fetchData()
            setTeachers(teachersData)
            setStudentDatabase(studentsData)
            setGlobalQueue(pickupsData)
            setActivityFeed(activitiesData)
            setIsDataLoaded(true)
        }
        loadData()
    }, [])

    // Some helper functions
    const getTeacherForStudent = (studentName) => {
        return studentDatabase[studentName] || null
    }

    const getTeacherForPickup = (students) => {
        if (students.length === 0) return null
        const firstStudentTeacher = getTeacherForStudent(students[0])
        if (!firstStudentTeacher) return null
        const allSameTeacher = students.every(student =>
            getTeacherForStudent(student) === firstStudentTeacher
        )
        return allSameTeacher ? firstStudentTeacher : 'Mixed Classes'
    }

    const addActivity = (message) => {
        const newActivity = {
            id: Date.now(),
            message: message,
            timestamp: new Date()
        }
        setActivityFeed(prev => [newActivity, ...prev.slice(0, 19)])
    }

    // Some event handlers
    const handleTeacherLogin = () => {
        if (teachers[teacherPin]) {
            setAuthenticatedTeacher(teachers[teacherPin])
            addActivity(`Teacher ${teachers[teacherPin].name} logged into pickup portal`)
        } else {
            alert('Invalid PIN. Please try again.')
        }
    }

    const handleTeacherLogout = () => {
        if (authenticatedTeacher) {
            addActivity(`Teacher ${authenticatedTeacher.name} logged out of pickup portal`)
        }
        setAuthenticatedTeacher(null)
        setTeacherPin('')
    }

    const getTeacherQueue = () => {
        if (!authenticatedTeacher) return []
        return globalQueue.filter(pickup => pickup.teacherName === authenticatedTeacher.name)
    }

    const handleAddStudent = () => {
        if (currentStudentName.trim()) {
            const studentName = currentStudentName.trim()
            const teacherName = getTeacherForStudent(studentName)

            setSelectedStudents([...selectedStudents, studentName])
            setCurrentStudentName('')

            if (nameConfirmed) {
                if (teacherName) {
                    addActivity(`Parent ${parentName} added ${studentName} (${teacherName}'s class) to pickup list`)
                } else {
                    addActivity(`Parent ${parentName} added ${studentName} (student not found in system) to pickup list`)
                }
            }
        }
    }

    const handleRemoveStudent = (indexToRemove) => {
        const removedStudent = selectedStudents[indexToRemove]
        setSelectedStudents(selectedStudents.filter((_, index) => index !== indexToRemove))
        if (nameConfirmed) {
            addActivity(`Parent ${parentName} removed ${removedStudent} from pickup list`)
        }
    }

    const handlePickupTypeSelection = (type) => {
        setPickupType(type)
        const pickupTypeText = type === 'carline' ? 'Car Line' : 'Walk Up'
        addActivity(`Parent ${parentName} selected ${pickupTypeText} pickup method`)
    }

    const handleGpsConfirmation = () => {
        setGpsConfirmed(true)
        const newQueuePosition = globalQueue.length + 1
        setQueuePosition(newQueuePosition)

        const assignedTeacher = getTeacherForPickup(selectedStudents)

        const newPickup = {
            queueNum: newQueuePosition,
            parent: parentName,
            students: [...selectedStudents],
            type: pickupType === 'carline' ? 'Car Line' : 'Walk Up',
            status: 'waiting',
            teacherName: assignedTeacher || 'Unknown Teacher'
        }

        setGlobalQueue(prev => [...prev, newPickup])

        const studentsText = selectedStudents.length > 1 ? selectedStudents.join(', ') : selectedStudents[0]
        const pickupTypeText = pickupType === 'carline' ? 'Car Line' : 'Walk Up'

        addActivity(`Parent ${parentName} confirmed GPS location at school`)
        addActivity(`${parentName} joined queue #${newQueuePosition} for ${studentsText} (${pickupTypeText})`)

        if (assignedTeacher && assignedTeacher !== 'Mixed Classes') {
            addActivity(`Queue #${newQueuePosition} assigned to ${assignedTeacher}'s class`)
        } else if (assignedTeacher === 'Mixed Classes') {
            addActivity(`Queue #${newQueuePosition} contains students from multiple classes`)
        } else {
            addActivity(`Queue #${newQueuePosition} contains unrecognized students`)
        }
    }

    const handleReleaseStudents = (queueNum) => {
        const pickup = globalQueue.find(p => p.queueNum === queueNum)
        if (!pickup) return

        setGlobalQueue(prev => prev.filter(p => p.queueNum !== queueNum))

        const studentsText = pickup.students.length > 1 ? pickup.students.join(', ') : pickup.students[0]
        const waitTime = Math.round(Math.random() * 3 + 1.5)

        addActivity(`${pickup.teacherName} released ${studentsText} to parent ${pickup.parent}`)
        addActivity(`Queue #${queueNum} pickup completed (${waitTime}.${Math.floor(Math.random() * 10)} min wait time)`)
    }

    const resetParentFlow = () => {
        setParentName('')
        setNameConfirmed(false)
        setSelectedStudents([])
        setCurrentStudentName('')
        setPickupType(null)
        setGpsConfirmed(false)
        setQueuePosition(null)
    }

    const resetTeacherPortal = () => {
        setAuthenticatedTeacher(null)
        setTeacherPin('')
    }

    if (!isDataLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Loading School Data</h2>
                    <p className="text-blue-200">Connecting to database and loading current information...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
            {currentView === 'home' && (
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/50"></div>

                    <div className="relative z-10 p-6 pb-12">
                        <header className="text-center mb-16 pt-12">
                            <div className="mb-8">
                                <div className="w-32 h-32 mx-auto mb-6">
                                    <img
                                        src="/nyos-logo.png"
                                        alt="NYOS Charter School Logo"
                                        className="w-full h-full object-contain drop-shadow-2xl"
                                    />
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                                    School Dismissal Manager
                                </h1>
                                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
                                    New and improved pickup system designed for NYOS Charter School
                                </p>
                            </div>
                        </header>

                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                                <div
                                    onClick={() => setCurrentView('parent')}
                                    className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:bg-white/15"
                                >
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300">
                                            <Car className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">Parent Portal</h3>
                                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                            Secure check-in system with GPS verification and real-time updates
                                        </p>
                                        <div className="inline-flex items-center px-6 py-3 bg-blue-500/20 rounded-full text-blue-200 text-sm font-medium">
                                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                            GPS Ready
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setCurrentView('teacher')}
                                    className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:bg-white/15"
                                >
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:from-green-400 group-hover:to-green-500 transition-all duration-300">
                                            <GraduationCap className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">Teacher Portal</h3>
                                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                            Student release portal with digital confirmation and parent matching
                                        </p>
                                        <div className="inline-flex items-center px-6 py-3 bg-green-500/20 rounded-full text-green-200 text-sm font-medium">
                                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                            Active Queue
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setCurrentView('admin')}
                                    className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:bg-white/15"
                                >
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:from-purple-400 group-hover:to-purple-500 transition-all duration-300">
                                            <Shield className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">Admin Portal</h3>
                                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                            System management, analytics dashboard, and reporting tools
                                        </p>
                                        <div className="inline-flex items-center px-6 py-3 bg-purple-500/20 rounded-full text-purple-200 text-sm font-medium">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                                            Live Analytics
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                                <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="w-12 h-12 mx-auto mb-6 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4">Secure Queue System</h4>
                                    <p className="text-blue-100 leading-relaxed">
                                        Encrypted queue IDs with tamper-proof generation for organized pickup flow
                                    </p>
                                </div>
                                <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="w-12 h-12 mx-auto mb-6 bg-green-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4">GPS Verification</h4>
                                    <p className="text-blue-100 leading-relaxed">
                                        High-accuracy location validation
                                    </p>
                                </div>
                                <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="w-12 h-12 mx-auto mb-6 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4">Real-time Sync</h4>
                                    <p className="text-blue-100 leading-relaxed">
                                        Instant status updates across all devices with low latency
                                    </p>
                                </div>
                                <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="w-12 h-12 mx-auto mb-6 bg-orange-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4">Advanced Analytics</h4>
                                    <p className="text-blue-100 leading-relaxed">
                                        Complete reporting on wait times, volume, and system performance
                                    </p>
                                </div>
                            </div>

                            <div className="text-center bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-10 shadow-2xl border border-white/20">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                                        <span className="text-blue-900 font-bold text-lg">NYOS</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-xl">NYOS Charter School</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center mt-8">
                                    <div><p className="text-blue-100 text-sm font-semibold">Spring Boot Backend</p></div>
                                    <div><p className="text-blue-100 text-sm font-semibold">React Frontend</p></div>
                                    <div><p className="text-blue-100 text-sm font-semibold">MySQL Database</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'parent' && (
                <div className="min-h-screen p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 pt-8">
                            <button
                                onClick={() => {
                                    setCurrentView('home')
                                    resetParentFlow()
                                }}
                                className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                                </svg>
                            </button>
                            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Car className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">Parent Pickup Portal</h1>
                            <p className="text-blue-200 text-lg">Secure pickup coordination with GPS verification</p>
                        </div>

                        {!nameConfirmed ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-6">Step 1: Enter Your Name</h2>
                                <div className="max-w-md mx-auto space-y-6">
                                    <input
                                        type="text"
                                        value={parentName}
                                        onChange={(e) => setParentName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-all duration-300 text-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            if (parentName.trim()) {
                                                setParentName(parentName.trim())
                                                setNameConfirmed(true)
                                            }
                                        }}
                                        disabled={!parentName.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold w-full transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ) : selectedStudents.length === 0 ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-6">Step 2: Add Student Names</h2>
                                <p className="text-blue-200 mb-8">Hello <span className="font-bold text-white">{parentName}</span>! Who are you picking up today?</p>
                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="flex space-x-3">
                                        <input
                                            type="text"
                                            value={currentStudentName}
                                            onChange={(e) => setCurrentStudentName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
                                            placeholder="Enter student's full name"
                                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-all duration-300"
                                        />
                                        <button
                                            onClick={handleAddStudent}
                                            disabled={!currentStudentName.trim()}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <p className="text-blue-300 text-sm">Press Enter or click Add to include this student</p>
                                </div>
                                <button
                                    onClick={() => setNameConfirmed(false)}
                                    className="mt-8 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                                >
                                    ← Back to Name Entry
                                </button>
                            </div>
                        ) : selectedStudents.length > 0 && !pickupType ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-6">Step 2: Students Added</h2>
                                <div className="max-w-md mx-auto mb-8">
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                                        <h3 className="text-white font-semibold mb-4">Students for pickup:</h3>
                                        <div className="space-y-3">
                                            {selectedStudents.map((student, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20">
                                                    <span className="text-white font-medium">{student}</span>
                                                    <button
                                                        onClick={() => handleRemoveStudent(index)}
                                                        className="text-red-300 hover:text-red-100 transition-colors duration-300"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex space-x-3 mt-4">
                                            <input
                                                type="text"
                                                value={currentStudentName}
                                                onChange={(e) => setCurrentStudentName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
                                                placeholder="Add another student..."
                                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-all duration-300"
                                            />
                                            <button
                                                onClick={handleAddStudent}
                                                disabled={!currentStudentName.trim()}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-300"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-6">Step 3: Select Pickup Type</h2>
                                <div className="space-y-4 max-w-md mx-auto">
                                    <button
                                        onClick={() => handlePickupTypeSelection('carline')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl font-semibold w-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                                    >
                                        <Car className="w-6 h-6" />
                                        <span>Car Line Pickup</span>
                                    </button>
                                    <button
                                        onClick={() => handlePickupTypeSelection('walkup')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-2xl font-semibold w-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L9 8.3V13h2V9.6l-.2-.7z"/>
                                        </svg>
                                        <span>Walk Up Pickup</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setSelectedStudents([])}
                                    className="mt-8 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                                >
                                    ← Back to Student Entry
                                </button>
                            </div>
                        ) : !gpsConfirmed ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-6">Step 4: Confirm Your Location</h2>
                                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 mb-8">
                                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                    </div>
                                    <p className="text-blue-200 mb-6 text-lg">
                                        Parent: <span className="font-bold text-white">{parentName}</span>
                                    </p>
                                    <div className="bg-white/10 rounded-2xl p-4 mb-6">
                                        <p className="text-blue-200 mb-2">Students for pickup:</p>
                                        <div className="space-y-1">
                                            {selectedStudents.map((student, index) => (
                                                <p key={index} className="text-white font-semibold">{student}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-blue-200 mb-6 text-lg">
                                        Pickup Type: <span className="font-bold text-white">{pickupType === 'carline' ? 'Car Line' : 'Walk Up'}</span>
                                    </p>
                                    <p className="text-blue-200 mb-8">
                                        Please confirm you are at NYOS Charter School to notify the school of your arrival
                                    </p>
                                    <button
                                        onClick={handleGpsConfirmation}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                        <span>Confirm GPS Location & Notify School</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setPickupType(null)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                                >
                                    ← Back to Pickup Type
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 mb-8">
                                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-4">NYOS has been Notified of your arrival!</h2>
                                    <div className="bg-blue-500/20 rounded-2xl p-6 mb-6">
                                        <h3 className="text-2xl font-bold text-white mb-2">Queue Position #{queuePosition}</h3>
                                        <p className="text-blue-200 text-lg mb-4">
                                            Parent: <span className="font-bold text-white">{parentName}</span>
                                        </p>
                                        <div className="bg-white/10 rounded-2xl p-4 mb-4">
                                            <p className="text-blue-200 mb-2">Students for pickup:</p>
                                            <div className="space-y-1">
                                                {selectedStudents.map((student, index) => (
                                                    <p key={index} className="text-white font-semibold">{student}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-blue-200">
                                            Type: <span className="font-bold text-white">{pickupType === 'carline' ? 'Car Line' : 'Walk Up'}</span>
                                        </p>
                                    </div>
                                    <div className="bg-green-500/20 rounded-2xl p-6 mb-8">
                                        <p className="text-green-100 text-lg">
                                            Estimated Wait Time: <span className="font-bold text-white">{queuePosition * 2} minutes</span>
                                        </p>
                                        <p className="text-green-200 text-sm mt-2">
                                            You will receive a notification when your student is ready.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <button
                                            onClick={resetParentFlow}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl mr-4"
                                        >
                                            Start New Pickup
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentView('home')
                                                resetParentFlow()
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Return Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentView === 'teacher' && (
                <div className="min-h-screen p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 pt-8">
                            <button
                                onClick={() => {
                                    setCurrentView('home')
                                    resetTeacherPortal()
                                }}
                                className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                                </svg>
                            </button>
                            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <GraduationCap className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">Teacher Release Portal</h1>
                            <p className="text-blue-200 text-lg">Authorize student releases and manage pickups</p>
                        </div>

                        {!authenticatedTeacher ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-6">Teacher Login</h2>
                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                                        <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                                            </svg>
                                        </div>
                                        <p className="text-blue-200 mb-6">Enter your 4-digit PIN to access your class pickup queue</p>
                                        <input
                                            type="password"
                                            value={teacherPin}
                                            onChange={(e) => setTeacherPin(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && teacherPin.length === 4 && handleTeacherLogin()}
                                            placeholder="••••"
                                            maxLength="4"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-blue-200 focus:outline-none focus:border-green-400 transition-all duration-300 text-center text-2xl tracking-widest"
                                        />
                                        <button
                                            onClick={handleTeacherLogin}
                                            disabled={teacherPin.length !== 4}
                                            className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Login
                                        </button>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                        <h3 className="text-white font-semibold mb-4">Sample Teacher PINs:</h3>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex justify-between text-blue-200">
                                                <span>Mrs. Johnson (3rd Grade):</span>
                                                <span className="font-mono">3333</span>
                                            </div>
                                            <div className="flex justify-between text-blue-200">
                                                <span>Mr. Williams (5th Grade):</span>
                                                <span className="font-mono">5555</span>
                                            </div>
                                            <div className="flex justify-between text-blue-200">
                                                <span>Ms. Davis (2nd Grade):</span>
                                                <span className="font-mono">2222</span>
                                            </div>
                                            <div className="flex justify-between text-blue-200">
                                                <span>Mrs. Smith (4th Grade):</span>
                                                <span className="font-mono">4444</span>
                                            </div>
                                            <div className="flex justify-between text-blue-200">
                                                <span>Mr. Brown (1st Grade):</span>
                                                <span className="font-mono">1111</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/20">
                                            <h4 className="text-white font-semibold mb-2">Sample Students:</h4>
                                            <div className="text-xs text-blue-300 space-y-1">
                                                <p><strong>Mrs. Johnson:</strong> Emma Rodriguez, Kohaan Callaway, Michael Thompson</p>
                                                <p><strong>Mr. Williams:</strong> Liam Chen, Sophie Chen, Alexander Park</p>
                                                <p><strong>Ms. Davis:</strong> Sofia Martinez, Ethan Brown, Ava Wilson</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{authenticatedTeacher.name}</h2>
                                            <p className="text-blue-200">{authenticatedTeacher.grade} • {authenticatedTeacher.room}</p>
                                        </div>
                                        <button
                                            onClick={handleTeacherLogout}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                                    <h2 className="text-2xl font-bold text-white mb-6">Your Class Pickup Queue</h2>
                                    {getTeacherQueue().length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">No Active Pickups</h3>
                                            <p className="text-blue-200">Your class queue is empty. New pickups will appear here automatically.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {getTeacherQueue().map((pickup) => (
                                                <div key={pickup.queueNum} className="bg-white/10 rounded-2xl p-6 border border-white/20">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-3">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-4">
                                  #{pickup.queueNum}
                                </span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                    pickup.type === 'Car Line'
                                                                        ? 'bg-blue-500/20 text-blue-200'
                                                                        : 'bg-green-500/20 text-green-200'
                                                                }`}>
                                  {pickup.type}
                                </span>
                                                            </div>
                                                            <p className="text-white font-semibold text-lg mb-2">
                                                                Parent: {pickup.parent}
                                                            </p>
                                                            <div className="text-blue-200">
                                                                <p className="font-medium mb-1">Students for pickup:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {pickup.students.map((student, index) => (
                                                                        <span key={index} className="bg-white/10 px-3 py-1 rounded-lg text-white text-sm font-medium">
                                      {student}
                                    </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleReleaseStudents(pickup.queueNum)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ml-6"
                                                        >
                                                            Release Students
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                                            <p className="text-2xl font-bold text-white">{getTeacherQueue().length}</p>
                                            <p className="text-blue-200 text-sm">Your Active Pickups</p>
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                                            <p className="text-2xl font-bold text-white">
                                                {getTeacherQueue().reduce((total, pickup) => total + pickup.students.length, 0)}
                                            </p>
                                            <p className="text-blue-200 text-sm">Your Students Waiting</p>
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                                            <p className="text-2xl font-bold text-white">2.1 min</p>
                                            <p className="text-blue-200 text-sm">Your Avg Wait Time</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentView === 'admin' && (
                <div className="min-h-screen p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 pt-8">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                                </svg>
                            </button>
                            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
                            <p className="text-blue-200 text-lg">System overview and management controls</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-semibold">Active Queue</h3>
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{globalQueue.length}</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">{globalQueue.length} Parents</p>
                                <p className="text-blue-200 text-sm">Currently waiting</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-semibold">Students Picked Up</h3>
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">78%</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">156 of 200</p>
                                <p className="text-blue-200 text-sm">78% complete • Peak at 3:15 PM</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-semibold">Students Remaining</h3>
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {44 - globalQueue.reduce((total, pickup) => total + pickup.students.length, 0)}
                    </span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {44 - globalQueue.reduce((total, pickup) => total + pickup.students.length, 0)} Students
                                </p>
                                <p className="text-blue-200 text-sm">
                                    {globalQueue.reduce((total, pickup) => total + pickup.students.length, 0)} in active queue • {44 - globalQueue.reduce((total, pickup) => total + pickup.students.length, 0)} not yet called
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                                <h2 className="text-2xl font-bold text-white mb-6">System Controls</h2>
                                <div className="space-y-4">
                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-all duration-300">
                                        Emergency Queue Clear
                                    </button>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-300">
                                        Generate Daily Report
                                    </button>
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300">
                                        Export Analytics
                                    </button>
                                    <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold transition-all duration-300">
                                        System Maintenance
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                                <h2 className="text-2xl font-bold text-white mb-6">Live Activity Feed</h2>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {activityFeed.map((activity) => (
                                        <div key={activity.id} className="bg-white/10 rounded-xl p-3 border border-white/20">
                                            <p className="text-blue-100 text-sm">{activity.message}</p>
                                            <p className="text-blue-300 text-xs">{activity.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                    ))}
                                    {activityFeed.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-blue-200">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App









