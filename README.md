## Local Chat App in React

Real time chatapp made using React for frontend, Node.js and Socket.io for backend. It enables instant messaging without authentication or database.

*Note that this project is made for Tinkerers' Lab IIT Hyderabad Bootcamp and miniproject*

### Features: 
1. Real-time messaging using WebSockets
2. Local server-based chat without authentication
3. **Note that basic firebase integration has been done but major changes is yet to implement yet**.

### Project Structure: 
```
chatapp-practice/
│── client/        # React frontend
│── server/        # Node.js and express.js backend with Socket.io
│── .gitignore     # Ignored files
│── README.md      #Description about the project.

```

### Installation: 
1. Clone the repo: 
```
git clone https://github.com/your-username/chatapp-practice.git
cd chatapp-practice
```
2. Install Dependencies
```
cd client
npm install

cd ../server
npm install
```
3. Start backend
```
cd server
node index.js
```
4. Start Frontend
```
cd client
npm start
```
5. Open the App \
Go to ```http://localhost:3000``` in your browser

## Currently working on: 
1. Integrating firebase to save the chats when refreshed
2. **Issue** : If two persons having same username join the same room, it is not able to differentiate between the two users.
4. Better UI.

## Why did I choose this project?
I have a interest in building things and learning things by doing projects. I wanted to learn websockets and I thought this will be the perfect project to learn Websockets in a way I will enjoy.

## Key learnings: 
1. This project helped me improve my hands over node.js
2. I learnt websockets
3. Learnt how to approach a completely new problem from scratch.

