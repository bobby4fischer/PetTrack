# PetTalk - Productivity Web App Backend

A comprehensive productivity web application backend built with the MERN stack. This backend provides user authentication, task management, and automated email reporting features.

## Features

- 🔐 **User Authentication**: Secure registration and login with JWT tokens
- 📝 **Task Management**: Complete CRUD operations for tasks with priority levels, categories, and due dates
- 📊 **Analytics & Reporting**: Detailed task completion statistics and productivity insights
- 📧 **Automated Email Reports**: Scheduled productivity reports sent every 6 hours
- 🔒 **Security**: Rate limiting, input validation, and secure password hashing
- 📈 **Performance Tracking**: Completion ratios, overdue task monitoring, and improvement suggestions

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **Scheduling**: Node-cron
- **Validation**: Express-validator
- **Security**: Helmet, bcryptjs, CORS, Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Email service credentials (Gmail recommended)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PetTalk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the `.env.example` file to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/pettalk
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   
   # Application Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system or provide a cloud MongoDB URI.

5. **Run the application**
   
   For development:
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password

### Task Routes (`/api/tasks`)

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks (with filtering and pagination)
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Check

- `GET /api/health` - Server health check

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in your `EMAIL_PASS` environment variable

### Email Reports

The system automatically sends productivity reports every 6 hours containing:
- Task completion statistics
- Success ratio analysis
- Missed tasks summary
- Personalized improvement suggestions

Users can configure their email preferences:
- Enable/disable reports
- Set frequency (6 hours, 12 hours, 24 hours)

## Project Structure

```
PetTalk/
├── models/
│   ├── User.js          # User model with authentication
│   └── Task.js          # Task model with analytics methods
├── routes/
│   ├── auth.js          # Authentication routes
│   └── tasks.js         # Task management routes
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── services/
│   ├── emailService.js  # Email service for reports
│   └── emailScheduler.js # Automated email scheduling
├── utils/
│   └── analytics.js     # Analytics and reporting utilities
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template
```

## Usage Examples

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "priority": "high",
    "category": "work",
    "estimatedDuration": 120
  }'
```

### Get Task Statistics
```bash
curl -X GET "http://localhost:5000/api/tasks/stats?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Testing Email Service
You can manually trigger email reports for testing:
```javascript
// In your application code
const emailScheduler = require('./services/emailScheduler');

// Send report to specific user
await emailScheduler.sendReportToUser(userId);

// Send reports to all eligible users
await emailScheduler.triggerReportsManually();
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers for Express

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository or contact the development team.