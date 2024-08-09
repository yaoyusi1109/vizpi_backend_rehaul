# VizGroup: An AI-Assisted Event-Driven System for Real-Time Collaborative Programming Learning Analytics

## Introduction

Programming instructors often conduct collaborative learning activities, like Peer Instruction, to foster a deeper understanding in students and enhance their engagement with learning. These activities, however, may not always yield productive outcomes due to the diversity of student mental models and their ineffective collaboration. In this work, we introduce VizGroup, an AI-assisted system that enables programming instructors to easily oversee students’ real-time collaborative learning behaviors during large programming courses. VizGroup leverages Large Language Models (LLMs) to recommend event specifications for instructors so that they can simultaneously track and receive alerts about key correlation patterns between various collaboration metrics and ongoing coding tasks.

## Table of Contents

- [Project Overview](#project-overview)
- [Setup Instructions](#setup-instructions)
- [Key Components](#key-components)
- [Features](#features)
- [Guidelines for Code Refactoring](#guidelines-for-code-refactoring)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

The Task Management System backend is built using Node.js and Express, providing a robust server-side framework for managing API requests, real-time data processing, and AI integrations. It leverages Azure OpenAI services and Langchain to enhance various functionalities such as task description generation, function name detection, unit test generation, and topic analysis. The backend architecture includes controllers, models, services, and real-time communication handlers to ensure efficient task management and AI-driven insights.

Key features include automated task description refinement, generation of pre-coding quiz questions, real-time chat functionalities, and secure user authentication and authorization.

## Architecture Diagram

```
Backend Architecture
------------------------------
|         Project Root        |
|----------------------------|
| .github/                   | # GitHub configuration and workflows
| config/                    | # Configuration files for the application
| controllers/               | # Handles the logic for different functionalities
|  ├── authController.js     |    # Authentication related logic
|  ├── chatController.js     |    # Chat related logic
|  ├── codeController.js     |    # Code processing logic
|  ├── gptController.js      |    # GPT related logic
|  ├── groupController.js    |    # Group management logic
|  ├── instructorController.js|   # Instructor management logic
|  ├── reviewController.js   |    # Review related logic
|  ├── sessionController.js  |    # Session management logic
|  ├── submissionsController.js|  # Submissions management logic
|  ├── userController.js     |    # User management logic
| general/                   | # General utilities and configurations
|  ├── groupLogit.js         |    # Group related utilities
|  ├── passportConfig.js     |    # Passport.js configuration for authentication
| models/                    | # Defines the data structures used in the application
|  ├── code.js               |    # Code data model
|  ├── event.js              |    # Event data model
|  ├── group.js              |    # Group data model
|  ├── index.js              |    # Index file for models
|  ├── init-models.js        |    # Initialize models
|  ├── instructor.js         |    # Instructor data model
|  ├── message.js            |    # Message data model
|  ├── review.js             |    # Review data model
|  ├── session.js            |    # Session data model
|  ├── submission.js         |    # Submission data model
|  ├── topicAnalysis.js      |    # Topic analysis data model
|  ├── user.js               |    # User data model
| node_modules/              | # Project dependencies
| postgre/                   | # PostgreSQL related files and listeners
|  ├── listener/             |    # Listeners for database events
|  |   ├── groupListener.js  |       # Listener for group events
|  |   ├── messageListener.js|       # Listener for message events
|  |   ├── sessionListener.js|       # Listener for session events
|  |   ├── submissionListener.js|   # Listener for submission events
|  ├── db.js                 |    # Database configuration and connection
| routes/                    | # Defines API routes
|  ├── authRoute.js          |    # Routes for authentication
|  ├── chatRoute.js          |    # Routes for chat functionalities
|  ├── codeRoute.js          |    # Routes for code processing
|  ├── gptRoute.js           |    # Routes for GPT functionalities
|  ├── groupsRoute.js        |    # Routes for group management
|  ├── instructorsRoute.js   |    # Routes for instructor management
|  ├── reviewRoute.js        |    # Routes for reviews
|  ├── sessionsRoute.js      |    # Routes for session management
|  ├── submissionsRoute.js   |    # Routes for submission management
|  ├── usersRoute.js         |    # Routes for user management
| services/                  | # Business logic and interactions with models
|  ├── audioService.js       |    # Audio processing service
|  ├── authService.js        |    # Authentication service
|  ├── chatService.js        |    # Chat service
|  ├── codeService.js        |    # Code processing service
|  ├── courseService.js      |    # Course management service
|  ├── DeepgramService.js    |    # Deepgram AI service
|  ├── errorService.js       |    # Error handling service
|  ├── gptService.js         |    # GPT interaction service
|  ├── groupService.js       |    # Group management service
|  ├── instructorService.js  |    # Instructor management service
|  ├── reviewService.js      |    # Review management service
|  ├── sessionService.js     |    # Session management service
|  ├── studentService.js     |    # Student management service
|  ├── submissionService.js  |    # Submission management service
|  ├── testService.js        |    # Testing service
|  ├── userService.js        |    # User management service
| socket/                    | # Real-time communication handlers
|  ├── authSocket.js         |    # Socket for authentication
|  ├── groupSocket.js        |    # Socket for group communication
|  ├── groupsSocket.js       |    # Socket for groups communication
|  ├── sessionSocket.js      |    # Socket for session communication
|  ├── submissionSocket.js   |    # Socket for submission communication
|  ├── transcribeSocket.js   |    # Socket for transcription
|  ├── webRTCSocket.js       |    # Socket for WebRTC communication
| .env                       | # Environment variables
| .gitignore                 | # Git ignore file
| app.js                     | # Entry point of the backend application
| backend_doc.md             | # Documentation for the backend
| package-lock.json          | # Lockfile for npm dependencies
| package.json               | # Project metadata and dependencies
| README.md                  | # Project overview and instructions
------------------------------

```

## Setup Instructions

### Prerequisites

- Node.js (>= 12.x)
- npm

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/task-management-backend.git
cd task-management-backend
```

2. Install dependencies:

```
npm install
```
3. To start the backend server:
```
npm start
```

The backend server will be available at `http://localhost:5000`.

## Key Components

### `authController.js`

Handles authentication-related logic, including login, logout, and user registration.

### `chatController.js`

Manages chat functionalities, including sending and receiving messages.

### `codeController.js`

Handles code processing logic, including code submissions and evaluations.

### `gptController.js`

Manages interactions with GPT for generating and refining task descriptions.

### `groupController.js`

Handles group management logic, including creating and managing groups.

## Features

- **Authentication**: Secure user authentication and authorization.
- **Chat**: Real-time chat functionalities for collaboration.
- **Code Processing**: Code submissions and evaluations.
- **AI Integration**: Interaction with GPT for generating and refining task descriptions.
- **Group Management**: Create and manage groups for collaborative learning.

## Guidelines for Code Refactoring

- Every member involved in refactoring must have a dedicated branch for this purpose: `ec2-yourName`.
- Before starting any development work, always pull from the `ec2` branch and merge into your current branch.
- All refactoring-related code can only be committed to branch `ec2` after thorough testing.
- When you decide to refactor a service, document it in the progress part below for tracking refactoring progress.
- If you encounter a feature that cannot be implemented via the backend API, submit an issue in the backend project, specifying the method name and location.
- If implementing a feature requires calling at least two APIs, submit an issue in the backend project, specifying the method name and location.
- Since it may not be possible to deploy normally until all interfaces have been rewritten, please ensure to commit correct code to branch `ec2`.
- Before using any backend API, test it with Postman to ensure you are aware of all the data it returns.
- We use Axios to send the HTTP requests.
- You can change the parameter list of the functions. But, do not change the name of the functions.
- If you have any other thoughts or suggestions regarding these guidelines, please submit an issue in the backend project.
