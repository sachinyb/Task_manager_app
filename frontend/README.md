# Task Manager Frontend

A simple task manager application built with vanilla HTML, CSS, and JavaScript.

## Features

- ✅ User registration and login with JWT authentication
- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as completed with checkboxes
- ✅ Responsive design for mobile and desktop
- ✅ Logout functionality
- ✅ Token-based authentication with localStorage

## Setup

1. Make sure your backend server is running on `http://localhost:5000`
2. Open `index.html` in your web browser
3. Register a new account or login with existing credentials

## API Endpoints Used

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user (returns JWT token)
- **GET** `/tasks` - Fetch user's tasks (with Bearer token)
- **POST** `/tasks` - Create new task (with Bearer token)
- **PUT** `/tasks/:id` - Update task completion (with Bearer token)
- **DELETE** `/tasks/:id` - Delete task (with Bearer token)

## How to Use

1. **Register**: Create a new account with username and password
2. **Login**: Sign in with your credentials
3. **Add Tasks**: Use the input field to add new tasks
4. **Complete Tasks**: Check the checkbox to mark tasks as completed
5. **Delete Tasks**: Click the delete button to remove tasks
6. **Logout**: Click logout to sign out and clear your session

## File Structure

```
frontend/
├── index.html      # Main HTML file
├── styles.css      # CSS styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- Fetch API
- localStorage
- CSS Grid and Flexbox 