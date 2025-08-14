## 🏠 Dream Home Real Estate

Dream Home Real Estate is a comprehensive property management system designed for real estate agencies to efficiently manage their staff, branches, and clients. The application provides an intuitive interface for viewing, creating, and updating records through spreadsheet-like data grids and user-friendly forms. The system enables real estate companies to streamline their operations by centralizing staff information, branch details, and client preferences in one unified platform.

<br> 

## 💼 Features

* **Staff Management**: View, create, and update employee records including personal details, positions, salaries, and contact information
* **Branch Management**: Manage office locations with full CRUD operations, search functionality, and detailed branch information display
* **Client Management**: Track client information, preferences (House/Flat), maximum rent budgets, and contact details with inline editing capabilities
* **Interactive Data Grid**: Spreadsheet-like interface using react-spreadsheet for efficient bulk data editing and updates
* **Search & Navigation**: Advanced search functionality for branches with dedicated detail pages
* **Responsive Forms**: User-friendly forms with validation for creating new staff, branches, and clients

<br> 

## 🔧 Tech Stack

**Frontend**

* Next.js
* React
* react-spreadsheet for data grids
* react-hook-form for form handling and validation

<br> 

**Backend**

* Express.js server with RESTful API endpoints
* Oracle Database (oracledb) for data persistence
* CORS middleware for cross-origin requests

<br> 

**Styling**

* CSS modules
* Inline styling
* Responsive design with background images and modern UI components

<br> 

## Local Development

* **Backend Setup**: Navigate to the backend directory, install dependencies with `npm install`, configure your Oracle database connection in `app.js`, and start the server with `npm start` (runs on port 3001)

<br> 

* **Frontend Setup**: Navigate to the frontend directory, install dependencies with `npm install`, and start the development server with `npm run dev` (runs on port 3000)

<br> 

* **Database Configuration**: Ensure your Oracle database is running and accessible with the credentials specified in the backend configuration, and verify the backend API is accessible at `https://dbs501-backend.onrender.com` or update the URLs to point to your local backend
