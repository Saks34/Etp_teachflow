# TeachFlow - Frontend

TeachFlow is a comprehensive educational platform designed to streamline the interaction between administrators, teachers, and students. This is the frontend application built with React and Vite.

## 🚀 Features

*   **Role-Based Portals:** Distinct interfaces for Admins, Teachers, and Students.
*   **Real-Time Interactions:** Live class streaming, real-time chat, and notifications using Socket.io.
*   **Modern UI/UX:** Built with Tailwind CSS, featuring glassmorphism, dark mode support, and responsive design.
*   **Class Management:** Tools for scheduling (timetables), batch management, and attendance tracking.
*   **Secure Authentication:** Token-based authentication using JWT.

## 🛠️ Tech Stack

*   **Framework:** [React](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Routing:** [React Router v6](https://reactrouter.com/)
*   **State Management:** React Context API
*   **Real-time:** [Socket.io Client](https://socket.io/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Utilities:** `date-fns`, `clsx`, `react-hot-toast`

## 📦 Installation

1.  **Navigate to the website directory:**
    ```bash
    cd teachflow/website
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root of the `website` directory based on the `.env.example` (if available) or add the following:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

## 🏃‍♂️ Running the Application

### Development Mode
To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The app will typically run at `http://localhost:5173`.

### Production Build
To build the application for production:
```bash
npm run build
```
This generates the static files in the `dist` folder.

### Preview Production Build
To test the production build locally:
```bash
npm run preview
```

## 📂 Project Structure

*   `src/components`: Reusable UI components (buttons, inputs) and feature-specific components (ChatPanel, StreamInfo).
*   `src/context`: Global state providers (AuthContext, ThemeContext).
*   `src/pages`: Page components for each route, organized by role (admin, teacher, student).
*   `src/services`: API service functions using Axios.
*   `src/utils`: Helper functions and constants.
*   `public`: Static assets.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
