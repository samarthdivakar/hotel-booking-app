# Project Error Report: Hotel Room Booking System Setup

This document details the significant errors encountered during the initial Dockerized setup of the Hotel Room Booking System, along with their root causes and resolutions.

## 1. Backend `package.json` Missing / Initial Project Setup

*   **Problem:** The `server/Dockerfile`'s `COPY package*.json .` command failed because `package.json` was not initially present in the `server/` directory, leading to `npm error ENOENT: no such file or directory, open '/app/package.json'` during `docker compose build`.
*   **Root Cause:** The `server/` directory was empty, and a Node.js project had not been initialized within it.
*   **Resolution:** A basic Node.js project was initialized by running `npm init -y` locally in the `server/` directory. (Note: While this was done locally, the preference for future dependency management remains strictly within Docker containers.)

## 2. Backend `npm run build` Script Missing / Incorrect `CMD`

*   **Problem:** After `package.json` was created, the `server/Dockerfile` contained `RUN npm run build` and `CMD ["node", "dist/main"]`, which are common for NestJS but not for the chosen Express.js backend. This resulted in `npm error Missing script: "build"` during `docker compose build`.
*   **Root Cause:** Misalignment between the `Dockerfile`'s build commands and the Express.js project structure (which typically doesn't have a `build` script). The `CMD` was also incorrect for a simple Express app.
*   **Resolution:**
    *   Removed `node_modules` and `package-lock.json` from the local `server/` directory to maintain a clean, Docker-only dependency environment.
    *   `server/Dockerfile` was updated to remove the `RUN npm run build` step and change the `CMD` to `CMD ["node", "index.js"]`.
    *   A basic `server/index.js` file was created with a simple Express server.

## 3. Backend CORS Module Missing

*   **Problem:** The frontend was still unable to communicate with the backend despite the backend running, with browser errors indicating CORS issues (`net::ERR_NAME_NOT_RESOLVED` followed by network tab errors related to `backend` hostname not resolving). The `server/index.js` was updated to `require('cors')`, but the backend container failed to start due to `Cannot find module 'cors'`.
*   **Root Cause:** The `cors` package was not listed as a dependency in `server/package.json`, so `npm install` within the Docker build process did not install it.
*   **Resolution:** `server/package.json` was updated to include `"cors": "^2.8.5"` in the dependencies.

## 4. `client/src/App.jsx` Save Errors / Persistent Reverting

*   **Problem:** `client/src/App.jsx` frequently reverted to an older state or failed to save new changes, displaying "Save Error: Insufficient permissions" and "The system cannot find the path specified" messages in Cursor.
*   **Root Cause:** This was a persistent issue likely stemming from Cursor's interaction with file permissions within the WSL environment. The initial confusion about `App.jsx`'s location (root vs. `client/src/`) exacerbated this, but the core was a permission/saving problem.
*   **Resolution:** The user manually ensured the file was in `client/src/App.jsx` and likely resolved the permission issues by either using "Retry as Admin" in Cursor or by running `sudo chmod -R 777 .` in the WSL terminal to grant broader permissions to the project directory.

## 5. Frontend `fetch` URL (Network Resolution)

*   **Problem:** Even after CORS was enabled on the backend, the frontend failed to connect, showing `net::ERR_NAME_NOT_RESOLVED` for `http://backend:3000/` in the browser console.
*   **Root Cause:** The browser (running on the Windows host machine) tried to resolve `backend` as a hostname, which is only resolvable within the Docker Compose network. The Docker Compose setup correctly exposed the backend's port 3000 to the host's port 3000.
*   **Resolution:** The `fetch` URL in `client/src/App.jsx` was changed from `http://backend:3000/` to `http://localhost:3000/`.

---

### Potential Future Errors / Considerations:

*   **Database Integration:** When integrating a database (e.g., PostgreSQL or MongoDB), ensure the database service is defined in `docker-compose.yml`, configured correctly (volumes for persistence, environment variables for credentials), and the backend service is configured to connect to the database *using its service name* within the Docker network (e.g., `mongodb://database-service-name:27017/`).
*   **Production CORS:** The current CORS setup (`app.use(cors())`) is very permissive. For a production environment, this should be refined to allow only specific origins (e.g., your frontend's deployed URL).
*   **Environment Variables:** For sensitive information (database credentials, API keys), use Docker Compose environment variables in `docker-compose.yml` and retrieve them in your application code. Do not hardcode them.
*   **Docker Optimization:** For production, consider multi-stage Docker builds to reduce image size and improve security by not including development dependencies in the final image.
*   **Frontend Routing:** If you implement React Router, you might need to configure your web server (like `serve` in the frontend Dockerfile) to handle client-side routing properly (e.g., a fallback for 404s).
*   **Health Checks:** For robust `docker-compose.yml` setups, adding `healthcheck` configurations for services can ensure dependent services don't start until their dependencies are truly ready. 