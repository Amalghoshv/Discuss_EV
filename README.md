# DiscussEV - Electric Vehicle Discussion Platform

A comprehensive web-based platform fostering discussions and engagement among electric vehicle (EV) enthusiasts, owners, and experts.

## 🚗 Features

- **User Authentication**: Secure JWT-based authentication with registration and login
- **Post Management**: Create, edit, delete, and view posts with rich content
- **Comment System**: Engage in discussions with nested comments and reactions
- **Real-time Notifications**: Get notified about new comments, reactions, and mentions
- **Search & Filtering**: Find posts by category, tags, and keywords
- **Role-based Access**: Different permissions for users, moderators, and admins
- **Responsive Design**: Mobile-friendly interface built with Material-UI
- **Real-time Updates**: Live notifications and updates using Socket.io

## 🛠️ Admin Features
- User management
- Content moderation
- Analytics dashboard
- Notification control

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite for fast development
- **Redux Toolkit** for state management
- **Material-UI** for beautiful, responsive components
- **React Router** for navigation
- **React Hook Form** for form handling
- **Axios** for API communication
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Bcrypt** for password hashing

## 📁 Project Structure

```
Discuss_EV/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── userController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Reaction.js
│   │   ├── Notification.js
│   │   ├── Follow.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   ├── users.js
│   │   └── notifications.js
│   ├── utils/
│   │   └── jwt.js
│   ├── seed/
│   │   └── seedData.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   ├── layout/
│   │   │   └── common/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amalghoshv/Discuss_EV.git
   cd discuss-ev
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up the database**
   ```bash
   # Create a PostgreSQL database
   createdb discuss_ev
   ```

4. **Configure environment variables**
   
   **Backend (.env)**
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Edit `backend/.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=discuss_ev
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=sample@gmail.com
   SMTP_PASSWORD=samplepassword
   FROM_EMAIL=sample@gmail.com
   FROM_NAME="DiscussEV Support"
   ```

   **Frontend (.env)**
   ```bash
   cp frontend/env.example frontend/.env
   ```
   
   Edit `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 5173) servers.

## 📱 Usage

1. **Register/Login**: Create an account or sign in to access all features
2. **Browse Posts**: View the latest discussions and trending posts
3. **Create Posts**: Share your EV experiences, ask questions, or start discussions
4. **Engage**: Like posts, comment, and participate in conversations
5. **Search**: Find specific topics using the search functionality
6. **Categories**: Browse posts by EV-related categories

Seeded Test Accounts

The system includes pre-seeded test accounts:

👤 Normal User
{
  "email": "user@discussev.com",
  "password": "password123"
}
👑 Admin User
{
  "email": "official@discussev.com",
  "password": "password123"
}

👉 These accounts are already available after seeding.

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Posts
- `GET /api/posts` - Get all posts (with pagination and filters)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

## 🎨 UI Components

The application uses Material-UI components with a custom theme optimized for the EV community:

- **Primary Color**: Green (#2E7D32) representing sustainability
- **Secondary Color**: Orange (#FF6F00) for energy and innovation
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Toggle between light and dark themes
- **Accessibility**: WCAG compliant with proper focus management

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js for security headers

## 🚀 Deployment

### Backend (Heroku)
1. Create a Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy the backend

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set build command: `npm run build`
3. Set environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Advanced search with filters
- [ ] File upload for images and documents
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with EV charging networks
- [ ] AI-powered content recommendations
- [ ] Multi-language support

---

Made with ❤️ for the electric vehicle community
