# Student Portal Web Application (Portal Ucznia)

## 1. Overview

The Student Portal is a comprehensive, modern web application designed to serve as the central digital hub for students at Zespół Szkół Tischnera. It offers a wide range of integrated features to facilitate seamless access to essential school-related information and services, all delivered through a user-friendly, mobile-optimized single-page application (SPA) interface. All content is presented in Polish.

## 2. Core Features

*   **Substitutions (Zastępstwa):** Real-time updates about teacher substitutions and schedule changes.
*   **Calendar (Kalendarz):** Integrated calendar for exams, school holidays, deadlines.
*   **Events (Wydarzenia):** Information on upcoming school events and activities.
*   **Announcements (Ogłoszenia):** Official announcements from school administration and teachers.
*   **News (Aktualności):** News feed for current information within the school community.
*   **Submit Substitutions (Prześlij Zastępstwa):** (Admin) Interface for authorized users to submit substitution files.
*   **Now Playing (Teraz Odtwarzane):** Integration for school broadcasts or media streams.
*   **Administrator Portal (Portal Administratora):** (Admin) Dedicated panel for content management, user management, and settings.
*   **Account Settings (Ustawienia Konta):** User profile customization, notification preferences.
*   **E-Signature (E-Podpis):** (Future) Secure digital signature functionality.
*   **Forms (Formularze):** Access to various school forms.
*   **Student Council (Samorząd Uczniowski):** Dedicated section for student council updates and projects.
*   **Authentication (TischnerID):** Secure single sign-on system modeled after AppleID, using Firebase Authentication.

## 3. Tech Stack

*   **Frontend:**
    *   React (with TypeScript)
    *   Tailwind CSS
    *   React Router
    *   Firebase SDK (for auth, Firestore, Storage)
    *   Workbox (for PWA/Offline Support)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   Firebase Admin SDK (for server-side Firebase operations)
    *   Firestore (as the primary database)
    *   Multer (for file uploads)
    *   CORS

## 4. Project Structure

The project is organized into two main parts:

*   **Root Directory (`/`):** Contains the backend Node.js/Express application (`server.js`), `package.json` for backend dependencies, `Dockerfile` (if added), `.env.example` for backend environment variables, and this `README.md`.
*   **`student-portal/` Directory:** Contains the frontend React application, its own `package.json` for frontend dependencies, source files in `student-portal/src/`, and build configuration.

## 5. Setup and Installation

### Prerequisites

*   Node.js (v16.x or later recommended)
*   npm (v8.x or later) or yarn

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  **Install backend dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Firebase Admin SDK:**
    *   Download your Firebase service account key JSON file from your Firebase project settings (Project settings > Service accounts > Generate new private key).
    *   Place this file in the root directory of the project and name it `firebase-service-account-key.json`.
    *   **Important:** This file contains sensitive credentials. Ensure it is kept secure and **added to your `.gitignore`** if the repository is public.
4.  **Configure Environment Variables:**
    *   Copy `.env.example` to a new file named `.env` in the root directory:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file and provide the necessary values, especially for `PORT`, `CORS_ORIGIN` (for development, this might be `http://localhost:3000`), and confirm the `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (if you named the key file differently or placed it elsewhere, though `./firebase-service-account-key.json` is assumed by the current `server.js`).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd student-portal
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    *   For development, Create React App uses `.env.development`. You can copy `student-portal/.env.production.example` to `student-portal/.env.development` (and/or `student-portal/.env.local` which is not tracked by git).
    *   Edit the development environment file(s) to set `REACT_APP_API_BASE_URL` to your local backend URL (e.g., `http://localhost:3001/api` if your backend runs on port 3001).
    *   For production, follow instructions in the "Deployment" section below.

## 6. Running the Application

### Backend Server

1.  From the **root directory**:
    ```bash
    npm start
    ```
    Or for development with nodemon (if you want auto-restarts on file changes):
    ```bash
    npm run dev
    ```
    The backend server will typically start on the port specified in your `.env` file (e.g., 3001).

### Frontend Development Server

1.  From the **`student-portal/` directory** (in a new terminal window):
    ```bash
    npm start
    ```
    The React development server will typically start on `http://localhost:3000`.

## 7. Building for Production

### Frontend

1.  From the **`student-portal/` directory**:
    ```bash
    npm run build
    ```
    This command creates an optimized static build of the React app in the `student-portal/build/` directory. These are the files you would deploy to a static hosting provider. Remember to configure production environment variables (e.g., in `student-portal/.env.production`) before building.

### Backend

The backend `server.js` is run directly with Node. No separate build step is currently configured unless you convert it to TypeScript.

## 8. API Endpoints (Overview)

The backend provides RESTful APIs for various features. Key base paths include:

*   `/api/substitutions`: For managing and retrieving substitution data.
*   `/api/upload/substitutions`: For uploading substitution Excel files (Admin).
*   `/api/calendar`: For calendar events.
*   `/api/events`: For school events.
*   `/api/announcements`: For announcements.
*   `/api/news`: For news articles.
*   `/api/secure-data`: Example authenticated route.
*   `/api/health`: Health check endpoint.

Authentication is handled via Firebase ID tokens passed in the `Authorization: Bearer <token>` header for protected routes.

## 9. Deployment

*   **Frontend (React App):**
    *   Build the app using `npm run build` in `student-portal/`.
    *   Deploy the contents of `student-portal/build/` to a static hosting service like Vercel, Netlify, or Firebase Hosting.
    *   Ensure production environment variables (e.g., `REACT_APP_API_BASE_URL`) are set in the hosting provider's settings or via a `.env.production` file at build time.
*   **Backend (Node.js App):**
    *   Deploy the root directory contents (server code, `package.json`, etc.) to a Node.js hosting environment like Google Cloud Run, Heroku, or Render.
    *   Ensure production environment variables (from your `.env` file, including the Firebase service account key path/content and `CORS_ORIGIN`) are configured in the hosting environment.
*   **CI/CD:** Consider setting up a CI/CD pipeline (e.g., GitHub Actions) for automated testing, building, and deployment.

Refer to `student-portal/.env.production.example` and `.env.example` for guidance on environment variables.

## 10. Note for AI Agents

If you are an AI agent working on this codebase, please refer to any `AGENTS.md` files that may exist in the repository (or relevant subdirectories) for specific instructions, conventions, or tips for development.

---

This README provides a starting point. It can be expanded with more details as the project evolves.
