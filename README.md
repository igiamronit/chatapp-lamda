# Ctrl-Alt-Elite: Real-time Chat Application

## Overview
Ctrl-Alt-Elite is a feature-rich real-time chat application developed for Lambda Spring Camp. This application enables seamless communication through instant messaging, image sharing, and collaborative spaces.

## Features
- **Real-time messaging** for no delays.
- **Google authentication** for secure access.
- **Joining and Creating Room** for organized discussions.
- **Image sharing** with preview.
- **Room Deletion** when you don't need the room anymore.
- **Typing indicator** to show active participants.
- **Emoji support** with integrated emoji picker.
- **Responsive design** for all devices.
- **Chat with AI** if you have no friends.
    - **Friendly**: Incase you need a friend to talk to.
    - **Roaster**: Incase you need a roast.
    - **Tech Support**: Incase you want to ask a tech question.
- **Clean and intuitive UI** for enhanced user experience.

## Technologies Used
- **Frontend**: React.js, HTML5, CSS3
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.io
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with Google Sign-in
- **Image Hosting**: imgBB API
- **Deployment**: Render (backend), GitHub Pages (frontend)
- **Version Control**: Git and GitHub
- **AI Integration**: Gemini API for chat functionalities

## Installation
1. Clone the repository
```bash
git clone https://github.com/igiamronit/chatapp-lamda.git
```
2. Navigate to the project directory
```bash
cd chatapp-lamda
```
3. Install dependencies for both server and client
```bash
cd server
npm install
cd ../client
npm install
```
4.  Set up environment variables as needed
## Usage

### Running the server
```bash
cd server
npm start
```

### Running the client
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure
```
chatapp-lamda/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/                # Source files
│   │   ├── App.js          # Main application component
│   │   ├── chat.js         # Chat functionality
│   │   ├── login.js        # Authentication components
│   │   ├── firebaseConfig.js # Firebase configuration
│   │   └── ...             # Other components and styles
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## Key Features Implementation

### Real-time Communication
The application uses Socket.io for real-time bidirectional communication between clients and the server.

### Firebase Integration
Firebase Firestore is used to store chat messages and room information, while Firebase Authentication provides secure Google Sign-in.

### Image Sharing
Users can upload and share images using the imgBB API integration.

### AI personas
The application integrates with the Gemini API to provide AI chat functionalities. Users can interact with three different personas: Friendly, Roaster, and Tech Support.

## Future Enhancements
- End-to-end encryption
- Voice and video chat capabilities
- Message search functionality
- User profile customization
- Mobile application development

## Contact
Project Maintainers: [harsh15044](https://github.com/harsh15044), [igiamronit](https://github.com/igiamronit), [AdisheshBalaji](https://github.com/adisheshbalaji)

---

Made with ❤️ for Lambda Spring Camp 2025