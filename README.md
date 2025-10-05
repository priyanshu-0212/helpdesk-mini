# helpdesk-mini

## 🌟 Overview

**helpdesk-mini** is a full-stack, minimalist help desk and ticketing system designed for simple, efficient management of customer support requests. It is built with a modern JavaScript stack, featuring a dedicated API and client to separate concerns and ensure a clean architecture.

## ✨ Features (Inferred)

* **Ticket Management:** Create, view, update, and track support tickets.
* **User Authentication:** Separate roles for customers (to raise tickets) and agents (to resolve them).
* **Modern Interface:** A clean, responsive design for a smooth user experience.
* **Scalable Architecture:** Built with a decoupled Client and Server for future growth.

## 💻 Tech Stack

The project is built using the following core technologies:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | JavaScript (with Vite) | Modern, fast-running client application (likely using a framework like React or Vue). |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid and responsive UI development. |
| **Backend** | JavaScript (Node.js/Express) | The core API server logic. |
| **Database** | Prisma | A next-generation ORM for simplified database access and migrations. |

## 🚀 Getting Started

Follow these steps to get a copy of the project up and running on your local machine.

### Prerequisites

You will need the following installed:

* Node.js (v18 or higher recommended)
* npm (or yarn/pnpm)
* A Database (e.g., PostgreSQL, MySQL, SQLite, etc., compatible with Prisma)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/priyanshu-0212/helpdesk-mini.git](https://github.com/priyanshu-0212/helpdesk-mini.git)
    cd helpdesk-mini
    ```

2.  **Install dependencies for the Server and Client:**
    The project appears to be a monorepo or has multiple `package.json` files in the subdirectories (`server/`, `client/`, etc.). You may need to run `npm install` in the respective folders:
    ```bash
    # Install root dependencies (if any)
    npm install
    
    # Install server dependencies
    cd server
    npm install
    
    # Install client dependencies
    cd ../client 
    npm install 
    # OR if using the root app folder structure
    # cd ../app
    # npm install
    ```

3.  **Database Setup (using Prisma):**
    * Configure your database connection string in the `server/.env` file (or wherever your Prisma schema is).
    * Run the database migration to create the tables:
        ```bash
        npx prisma migrate dev
        ```

### Running the Application

1.  **Start the Server/API:**
    Navigate to the server directory and run the start command (this may vary based on the actual scripts):
    ```bash
    cd server
    npm run dev  # Or 'npm start'
    ```

2.  **Start the Client/Frontend:**
    Navigate to the client/app directory and start the application (this likely uses the `vite.config.js`):
    ```bash
    cd client # or 'app'
    npm run dev
    ```

The client application should now be running on a local port (e.g., `http://localhost:5173`).
