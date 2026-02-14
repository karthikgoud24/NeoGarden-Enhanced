# 🌱 NeoGarden Enhanced  
**Final Project Report (README)**  

---

## 1. Project Title

**Project Name:** NeoGarden Enhanced – AI-Assisted Garden & Landscape Designer  
**Domain:** Web Application / Interactive Design Tool / AI-Assisted Landscape Planning  

---

## 2. Detailed Description of the Project

NeoGarden Enhanced is a **web-based interactive garden and landscape design system** that allows users to design and visualize real-world outdoor spaces such as:

- Home gardens and villas  
- Apartment landscapes and gated communities  
- College and school campuses  
- Public parks and institutional layouts  

The application is built with a **frontend–backend architecture**:

- The **Frontend** provides an interactive design interface where users can:
  - Define a plot/land area
  - Place plants, trees, and landscape elements on a grid/canvas
  - Remove or rearrange elements
  - View a clean, animated UI with smooth scrolling and transitions

- The **Backend** supports:
  - Plant library management
  - AI suggestion logic integration
  - Handling of future extensions like user design saving, loading, and analytics

### Core Objectives

1. Provide a **practical, easy-to-use tool** for designing gardens and landscapes.
2. Integrate **AI assistance** to reduce manual effort and improve design quality.
3. Offer a visually engaging and smooth user experience with enhanced graphics.
4. Build a **scalable architecture** so new features (data storage, user accounts, etc.) can be added later.

---

## 3. Team Members and Contributions

**Team Size:** 5 Members  

All five members contributed **equally** across all parts of the project.  
Work was done collaboratively in planning, designing, coding, and testing.

| S.No | Name       | Contributions (All Shared Equally) |
|------|------------|------------------------------------|
| 1    | Karthik - CS24B011   | Frontend UI & layout, AI logic integration, backend routes, testing, documentation |
| 2    | Rohan - CS24B007     | Frontend components, API design, AI suggestion flow, plant library updates, bug fixing |
| 3    | Thrinesh - CS24B017   | Plant & tree data modeling, UI enhancements, backend integration, feature validation |
| 4    | Harshith  -CS24B019 | Canvas interactions, plant placement & removal mechanics, performance tuning, testing |
| 5    | Santosh  - CS24B050  | Smooth animations, graphics enhancement, frontend–backend connectivity, report preparation |

> **Note:**  
> Every feature (frontend, backend, AI, testing, documentation) was completed as a **team effort**.  
> No feature was implemented by a single person only; all five members worked together and shared equal responsibility.

---

## 4. Features Completed up to Release 1

This section lists the features that were **completed for Release 1**.

### 4.1 Functional Features – Release 1

1. **Introduction / Landing Page**
   - Describes what NeoGarden is.
   - Includes an explanation of the purpose and usage.
   - Provides a clear **“Design Now”** button to enter the designer.

2. **Garden Designer Canvas (Basic Version)**
   - Grid-based or layout-based design area.
   - Users can place plants on specific positions.
   - Basic interaction support like clicking and placing elements.

3. **Basic Plant Library**
   - List of initial plants available for placement.
   - Each plant has a name and a basic icon/graphic representation.

4. **Basic UI & Scroll Experience**
   - Smooth scrolling between sections (Introduction → Designer).
   - Clean arrangement of sections, panels, and canvas.

5. **Frontend and Backend Setup**
   - Project structure created for:
     - `frontend/` – client-side code  
     - `backend/` – server-side code
   - Initial API endpoints and communication logic prepared for plant-related actions and future expandability.

---

## 5. Additional Features Completed for Final Submission

After the Release 1 submission, **additional features and enhancements** were implemented.  
If no features were added after Release 1 we would mention **NIL**, but in this project several important additions were made.

### 5.1 New Features & Enhancements (Final Submission)

1. **AI Enhancement – Smart Design Suggestions & Auto Plant Placement**
   - An **AI-based logic module** was integrated.
   - AI can:
     - Suggest design models/arrangements.
     - Automatically place plants in suitable positions on the canvas.
     - Assist users in quickly generating a good-looking layout without starting from scratch.

2. **Plant Removal Feature**
   - Users can **remove/delete plants** that were placed earlier.
   - Makes the design process fully editable and flexible.
   - Supports:
     - Clicking on plants and removing them.
     - Updating the layout dynamically without page reload.

3. **Enhanced Plant Library**
   - Plant library has been **expanded and improved**:
     - More plant types added.
     - Better organization and categorization.
     - Better support for future metadata (height, type, etc. if needed).

4. **Enhanced Tree & Plant Graphics**
   - Visual quality significantly improved:
     - More detailed icons/graphics for trees and plants.
     - Better distinction between different plant categories.
   - Helps users visualize final designs more realistically.

5. **Overall UI/UX Enhancement**
   - Smoother animations.
   - Refined panel design and layout.
   - Better responsiveness and consistency across sections.
   - Improved color usage, spacing, and typography.

6. **Fully Working Frontend–Backend Flow**
   - Frontend now properly communicates with backend routes.
   - Designed so that AI suggestions and plant data can be processed via the backend.
   - Optimized for future extensions (like saving/loading designs).

> **Summary:**  
> Release 1 Features ✅ + Additional Final Features ✅  
> No unimplemented planned features → **NIL (No Pending Features)**  

---

## 6. System Architecture (High Level)

### 6.1 Architecture Overview

- **Client (Frontend)**  
  - Renders the UI in the browser.  
  - Handles:
    - Layout rendering  
    - User interactions (place/remove plants)  
    - Calling AI suggestion features  
    - Communicating with backend via HTTP APIs  

- **Server (Backend)**  
  - `Node.js`/`Express`-based server.  
  - Responsible for:
    - Serving data for the plant library  
    - Hosting endpoints for AI suggestion requests  
    - Providing a structure for future database connectivity  

---

## 7. Technology Stack

| Layer        | Technologies Used                    |
|-------------|---------------------------------------|
| Frontend    | HTML, CSS, JavaScript (and related UI code) |
| Backend     | Node.js, Express.js                  |
| AI Logic    | Custom algorithmic logic (in JS/Node) |
| Versioning  | Git & GitHub                         |
| Future DB   | (Planned) Can be extended to MongoDB/MySQL etc. |

---
## Snapshots Of the Project
![Alt Text](Screenshot%202026-02-14%20162000.png)
![Alt Text](Screenshot%202026-02-14%20162023.png)
![Alt Text](Screenshot%202025-11-28%20082739.png)
![Alt Text](Screenshot%202025-11-28%20082807.png)
![Alt Text](Screenshot%202025-11-28%20083129.png)
![Alt Text](Screenshot%202025-11-28%20083216.png)
![Alt Text](Screenshot%202025-11-28%20083146.png)




## 8. How to Run the Project

> The project is designed with a **frontend** and **backend**.  
> Run both for full functionality.

### 8.1 Prerequisites

- Node.js installed  
- npm installed  

---

### 8.2 Clone the Repository

```bash
git clone https://github.com/karthikgoud24/NeoGarden-Enhanced.git
cd NeoGarden-Enhanced
Backend Setup & Run
Navigate to the backend folder

Bash

cd backend
Install dependencies

Bash

npm install
Start the backend server

Bash

npm start
Backend runs on:

http://localhost:5000
➡️ If you see “Backend Running Successfully! 🚀” in browser or terminal, backend is working.

🌐 Frontend Setup & Run
Open a NEW terminal window (The Backend should keep running in the first terminal)

Navigate to the frontend folder

Bash

cd frontend
If dependencies exist, install them:

Bash

npm install    # Only needed for dev server/project builds
Run frontend (choose based on configuration)

Bash

npm start
or

Bash

npm run dev
Frontend typically runs at:

http://localhost:3000
