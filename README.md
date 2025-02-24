# NextAuth Authentication System

A secure authentication system built with Next.js 13+, featuring role-based access control and comprehensive user management.

## Features

- 🔐 Secure Authentication

  - Email/password login
  - Google OAuth integration
  - Password reset functionality
  - Session management

- 👥 Role-Based Access Control

  - Admin role with full access
  - Member role for standard users
  - Protected routes and API endpoints

- 🛠️ Modern Stack
  - Next.js 13+ (App Router)
  - MongoDB with Mongoose
  - NextAuth.js
  - TypeScript
  - Tailwind CSS

## Setup Instructions

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   - Copy `.env.example` to `.env.local`
   - Update the variables with your values:
     - `NEXTAUTH_URL`: Your application URL
     - `NEXTAUTH_SECRET`: A secure random string
     - `MONGODB_URI`: Your MongoDB connection string
     - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

3. Set up Google OAuth:

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google OAuth API
   - Create OAuth credentials (Web application)
   - Add authorized origins and redirect URIs
   - Copy Client ID and Secret to your env variables

4. Set up MongoDB:

   - Create a MongoDB database
   - Add connection string to env variables
   - The system will automatically create required collections

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Routes

### Public Routes

- `/` - Home page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset with token

### Protected Routes

- `/admin` - Admin dashboard (admin only)
- `/member` - Member dashboard (members and admins)

### API Routes

- `/api/auth/[...nextauth]` - NextAuth endpoints
- `/api/auth/register` - User registration
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset verification

## User Roles

### Admin

- Full access to admin dashboard
- Access to member areas
- User management capabilities
- System configuration access

### Member

- Access to member dashboard
- Personal profile management
- Standard user features

## Security Features

- Password hashing with bcrypt
- CSRF protection
- HTTP-only cookies
- Input validation with Zod
- Protected API routes
- Secure password reset flow
- Session management
- Role-based middleware protection

## Development Notes

### Database Schema

The User model includes:

- email (unique)
- password (hashed)
- name
- role (admin/member)
- created/updated timestamps
- OAuth accounts
- Password reset tokens

### Adding an Admin User

To create an admin user, register normally and then update the user's role in the database:

```javascript
// Using MongoDB shell
db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } });
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this code for your own projects.
