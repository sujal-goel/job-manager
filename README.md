# Job Application Manager (MERN Stack)

This is a complete full-stack web application designed for securely managing job applications using the MERN stack and Google OAuth. 

## Structure
- `/backend`: Node.js + Express backend (REST API)
- `/frontend`: React frontend (Vite)

## Setup Instructions

### 1. Configure Credentials
You must set up your environment variables before running the application.

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file and add the following context (replace placeholders with your actual keys):
   ```env
   # .env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=a_super_secret_string_for_jwt_tokens
   GOOGLE_CLIENT_ID=your_google_cloud_client_id
   GOOGLE_CLIENT_SECRET=your_google_cloud_client_secret
   SESSION_SECRET=a_super_secret_key_for_sessions
   ```

**Getting Google OAuth Credentials**:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project, navigate to **APIs & Services** > **Credentials**.
3. Create an **OAuth Client ID** (Web application).
4. Add `http://localhost:5000/auth/google/callback` as an Authorized redirect URI.
5. Copy the Client ID and Client Secret into the `.env` file.

**MongoDB Connection**:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or run a local instance.
2. Obtain your connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/jobmanager`).
3. Paste it as `MONGODB_URI` in `.env`.

### 2. Run Backend
1. Open a terminal and navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *(The server will start on port 5000)*

### 3. Run Frontend
The frontend requires Node and NPM to install dependencies.

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *(The React app will typically start on `http://localhost:5173`)*

## Walkthrough For Viva
- **Auth**: The frontend hits the `/auth/google` API which uses `passport-google-oauth20` to verify identity. Session is created using `express-session`, storing a cookie on the frontend (allowed via `cors` with credentials).
- **CRUD**: The dashboard uses `axios` to trigger `GET`, `POST`, `PUT`, and `DELETE` on `/api/jobs`. The middleware `ensureAuth` verifies the cookie before proceeding. `Mongoose` executes the queries in MongoDB using the `req.user.id` to keep data sandboxed to the active user.
