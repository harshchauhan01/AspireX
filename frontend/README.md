# AspireX Frontend

This is the frontend application for AspireX, a mentorship platform connecting students with mentors.

## Features

- **Unified Authentication**: Single login/signup system for both students and mentors
- **Google OAuth Integration**: Sign in/up with Google accounts
- **Role-based Access**: Different dashboards for students and mentors
- **Real-time Chat**: Built-in messaging system
- **Community Features**: Share and interact with the community
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory based on `env.example`:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api/

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Development Settings
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

### 3. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set the application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
8. Copy the Client ID and update `VITE_GOOGLE_CLIENT_ID` in your `.env` file

### 4. Backend Setup

Make sure the backend server is running on `http://127.0.0.1:8000` or update the `VITE_API_BASE_URL` accordingly.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Authentication Flow

### Unified Login/Signup

The application uses a unified authentication system that supports both students and mentors:

1. **Role Selection**: Users can choose between "Student" and "Mentor" roles
2. **Traditional Login**: Email/password authentication
3. **Google OAuth**: Sign in/up with Google accounts
4. **Token Management**: Automatic token storage and management
5. **Route Protection**: Role-based access to different dashboard areas

### API Endpoints

The frontend connects to these backend endpoints:

- `POST /api/auth/unified-login/` - Unified login
- `POST /api/auth/unified-register/` - Unified registration
- `POST /api/auth/google/verify/` - Google OAuth verification

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthContext.jsx # Authentication context
│   ├── UnifiedLogin.jsx # Login component
│   ├── UnifiedSignup.jsx # Signup component
│   └── ...
├── BackendConn/        # API connection utilities
│   └── api.js         # API configuration and methods
├── Student/           # Student-specific components
├── Mentor/            # Mentor-specific components
└── App.jsx           # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Google OAuth Issues

1. Make sure your Google Client ID is correct
2. Verify the authorized origins and redirect URIs
3. Check that the Google+ API is enabled in your Google Cloud project

### API Connection Issues

1. Ensure the backend server is running
2. Check the `VITE_API_BASE_URL` configuration
3. Verify CORS settings on the backend

### Authentication Issues

1. Clear browser localStorage
2. Check browser console for errors
3. Verify token storage and retrieval

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
