# Fit-Tech SaaS Gym Booking Case Study

## Project Overview
This project implements a real-time gym capacity and booking system designed for high concurrency and performance.

### Components
1.  **Backend API (`/api`)**: Built with Fastify and TypeScript.
2.  **Mobile App (`/GymBookingApp`)**: Built with React Native and Expo.
3.  **Infrastructure (`/infra`)**: Built with AWS CDK.

## How to Run

### Backend API
```bash
cd api
npm install
npm run dev
```
*Note: The API runs on http://localhost:3000.*

### Running Tests
```bash
cd api
npm test
```

### Mobile App
```bash
cd GymBookingApp
npm install
```
Create a .env file in your GymBookingApp root:
```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3000
```
```bash
npx expo start
```



## Architectural Decisions

### Concurrency Handling
In the `GymRepository`, I implemented a **Mutex** (via `async-mutex`) to handle concurrent booking requests. 
- **The Problem**: In a high-concurrency environment (e.g., Monday at 6:00 PM), multiple requests might read the same capacity state simultaneously, leading to overbooking (the "Lost Update" or "Race Condition" problem).
- **The Solution**: The Mutex ensures that the "Read-Check-Write" cycle for a booking is atomic within a single execution context.
- **Real-World Scaling**: For a distributed cloud environment, this would be handled using **Atomic Increments in DynamoDB** (using `ConditionExpression`) or **Redis (ElastiCache) Lua scripts** to ensure atomicity across multiple Lambda instances.

### Code Quality & Seniority
- **Strict Typing**: TypeScript is configured with `strict: true` and `verbatimModuleSyntax: true` to ensure robust type safety and ESM compliance.
- **Modularity**: The backend is separated into Routes, Services (Repository), and Types. The mobile app uses reusable UI components like `CapacityRing`.
- **State Management**: The mobile app handles `Loading`, `Success`, and `Error` states using standard React hooks and provide immediate feedback via `Alert` and `ActivityIndicator`.

## Trade-offs & Improvements
- **In-Memory Mock**: The current implementation uses an in-memory Map. If I had more time, I would implement a local DynamoDB Docker container to show actual persistence logic.
- **Animation Complexity**: Standard React Native `Animated` was used for the `CapacityRing`. For a production app, I would use `react-native-reanimated` for smoother, UI-thread animations and `react-native-svg` for precise circular rendering.
- **Authentication**: JWT authentication/middleware is currently omitted for simplicity but would be essential for a real-world SaaS.

## Bonus: AWS ElastiCache Optimization
To optimize the `GET /capacity` endpoint for a global user base:
1.  **Global Replication**: Use Redis Global Datastore to replicate capacity data across multiple AWS regions, ensuring low latency for worldwide gym members.
2.  **Write-Behind/Write-Through**: When a booking occurs, update the ElastiCache value immediately (Write-Through) so the mobile app reflects the change instantly.
3.  **TTL & Eviction**: Set appropriate TTLs for capacity data to handle dynamic updates while reducing load on the primary DB.
4.  **Edge Compute**: Use Lambda@Edge to serve capacity data directly from the nearest Redis node.

