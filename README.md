# 📚 Present Sir - RFID-based Attendance System

## 📝 Project Description
"Present Sir" is a comprehensive, modern RFID-based Attendance System designed to streamline the attendance tracking process for educational institutions and organizations. The system features an ESP32 hardware module integrated with an RFID scanner, capturing attendance data in real-time. The ecosystem includes a responsive Web Dashboard and a dedicated Android Application, both connected to a robust Node.js/Express backend with MongoDB. This allows administrators to easily manage users, track attendance, and generate reports, while providing users with seamless access to their attendance records from any device.

## 🔗 Live Links
- **🌐 Web UI:** [Live Demo](https://rfid-based-attendance-system.vercel.app/#!/signup)
- **📱 Android Application:** [Download APK](https://drive.google.com/file/d/1OgkG2uSM52rFSzB0sR2lj1zBmEo7eaET/view?usp=sharing)



## 🎥 Video Demonstrations
- **Web Interface Demo:** [Insert YouTube/Drive Link Here]
- **Android App Demo:** [Insert YouTube/Drive Link Here]

## 🏗 System Architecture
![System Architecture](./architecture.png)

**How it works:**
1. **Module (ESP32 + RFID):** Scans the student's ID card and sends the UID to the local network.
2. **Local Network / Server:** Routes the request over Wi-Fi to the Node.js backend API.
3. **Server / Database:** Validates the RFID tag, processes the attendance record with accurate local timestamps, and saves it in MongoDB.
4. **Web Interface & Android App:** End-users (students and admins) use the Web Dashboard or Android app to securely log in and view real-time data fetched from the backend server.

## 💻 Tech Stack

### Web Application (Frontend)
- **Framework:** AngularJS (1.8.x)
- **Styling:** HTML5, CSS3, Bootstrap 5
- **Deployment:** Vercel

### Android Application
- **Language:** Java
- **Architecture:** Native Android App with WebView integration
- **IDE:** Android Studio
- **Authentication:** Native Login with Cookie Injection

### Backend
- **Environment:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MongoDB with Mongoose
- **Security:** bcryptjs, JSON Web Tokens (JWT), CORS
- **File Uploads:** Multer

### Hardware (IoT)
- **Microcontroller:** ESP32 / ESP8266
- **Sensor:** MFRC522 RFID Module
- **Language:** C++ (Arduino IDE)

## 🚀 Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB instance running (Local or Atlas)
- Android Studio (for Android app)
- Arduino IDE (for ESP32 programming)

### 1. Clone the repository
```bash
git clone https://github.com/mehta-harshil/RFID-based-attendance-system.git
cd RFID-based-attendance-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` folder based on your environment (add your `MONGO_URI` and `JWT_SECRET`).
- Start the server:
```bash
npm start
```

### 3. Frontend Setup
- The frontend is static HTML/JS. You can serve the `frontend` folder using any static file server (e.g., Live Server extension in VS Code).
- Update `frontend/config.js` with your local or production backend API URL.

### 4. ESP32 Setup
- Open the `.ino` sketch in the `esp32` folder using Arduino IDE.
- Install the `MFRC522` library from the Library Manager.
- Update the Wi-Fi credentials (`SSID` and `PASSWORD`) and the backend API endpoint URL in the code.
- Flash the code to your ESP32 board.

## 🛠 How to Use
1. **System Initialization:** Power up the ESP32 and ensure the backend server is running.
2. **Admin/User Registration:** Open the Web UI and create an account.
3. **Card Registration:** Add students/users to the system, mapping their details to their unique RFID tag UID.
4. **Marking Attendance:** Users simply tap their RFID cards on the ESP32 module. The module sends the UID to the server, logging attendance for the current date and time.
5. **Monitoring:** Log in via the Web Dashboard or Android App ("Present Sir") to view real-time attendance logs, track analytics, and manage users.

---
*Developed by [Harshil Mehta](https://github.com/mehta-harshil)*
