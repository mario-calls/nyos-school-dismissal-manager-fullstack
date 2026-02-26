# NYOS School Dismissal Manager

## Why I Built This

My son's school pickup line was a mess. Parents checking in late, teachers confused about who's where, the existing app crashing constantly. After sitting in my car for nearly an hour one afternoon, I went home frustrated and started coding.

I built this full-stack app over a weekend to show the school how their system could actually work. Turns out when you use it yourself, you catch all the real problems the original developers missed.


## What It Does

Parent Portal:
- Check in when you actually arrive (GPS validates you're at school)
- Get a queue number like "P-142" 
- System knows which kid you're picking up

Teacher Portal:
- PIN login so teachers only see their own class
- Real-time updates when parents arrive
- Click a button when student leaves

Admin Portal:
- See everything happening across the whole school
- Live stats and activity feed
- Actually useful analytics

Tech Stack

Frontend: React + Tailwind CSS  
Backend: Spring Boot  
Database: MySQL

Cool Technical Stuff

- GPS validation using Haversine formula - No external APIs, just math. Parents have to be within ~300 feet of school to check in.
- Queue IDs - Generated based on time of day (P = PM, A = AM) plus random number. Makes it easy for staff to call parents over the radio.
- Real-time sync - When a parent checks in, teacher dashboard updates immediately. Built with proper REST APIs, not polling every second like some systems.
- No external dependencies - Everything runs locally. No Google Maps API fees, no third-party services that go down.

What I Learned

As it turns out, building something you'll actually use makes you a better developer. You can't BS your way through UX decisions when you're the one sitting in the pickup line.

Also I learned Spring Boot, JPA, and how to properly connect a React frontend to a Java backend. And that schools desperately need better software.

## The Database

5 tables, properly normalized:
- parents, teachers, students (the people)
- pickup_events (the transactions)
- school_zones (GPS boundaries)

Foreign keys everywhere they should be. It's not rocket science.

## Running It

Backend:
```bash
cd backend
./mvnw spring-boot:run
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Database:
Create a MySQL database called `pickup_system`, run the schema script, done.

## Final Thoughts

This also happened to be my final project for a coding bootcamp, but it started because I was genuinely annoyed at waiting in a car line to pick up my son. Sometimes the best motivation is just being really tired of a bad user experience.

The actual school version is a bit different (they had their own requirements), but the core concepts are here.

-

Mario Callaway 
Professional developer who also happens to be a frustrated parent
