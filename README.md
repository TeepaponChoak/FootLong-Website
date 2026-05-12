# FootLong Website

A full-stack blog/announcement platform built with React, TypeScript, Node.js, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)

## Features

- 📝 **Blog/Post Management** - Create, read, update, and delete blog posts
- 📢 **Announcements** - Admin can post announcements that appear prominently on the homepage
- 🔐 **Authentication** - User registration, login, and password reset via email
- 👤 **User Profiles** - Personalized user profile pages
- 📧 **Email Notifications** - Password reset emails via Resend
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile Friendly** - Fully responsive across all devices
- 🔍 **Search & Navigation** - Easy content discovery

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful SVG icons
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Resend** - Email API for password resets

## Project Structure

```
footlong-website/
├── public/              # Static assets
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── App.tsx          # Main application component
│   ├── AuthContext.tsx  # Authentication context
│   ├── api.ts           # API service layer
│   ├── types.ts         # TypeScript type definitions
│   └── index.css        # Global styles
├── server/              # Backend server
│   ├── index.js         # Express server entry point
│   ├── seedAdmin.js     # Admin user seeding script
│   └── .env.example     # Environment variables template
├── index.html           # HTML entry point
├── package.json         # Frontend dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── DEPLOYMENT.md        # Detailed deployment guide
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TeepaponChoak/FootLong-Website.git
   cd FootLong-Website
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Update the following variables in `server/.env`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/footlong-blog
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:5173
   RESEND_API_KEY=your-resend-api-key  # Optional, for email
   RESEND_FROM='FootLong Website <onboarding@resend.dev>'
   ```

5. **Seed the admin user**
   ```bash
   cd server
   npm run seed:admin
   cd ..
   ```
   
   Default admin credentials:
   - **Username**: FootLong
   - **Password**: footlong.29

### Running the Application

1. **Start the backend server** (in one terminal)
   ```bash
   cd server
   npm start
   ```
   The API will be available at `http://localhost:3000`

2. **Start the frontend development server** (in another terminal)
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm start` - Start the server
- `npm run dev` - Start with auto-reload on file changes
- `npm run seed:admin` - Create admin user

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update profile (authenticated)
- `GET /api/users` - Get all users (admin only)

## Admin Features

Admin users have special privileges:
- Create and manage announcements
- Access admin-only features

The admin account is created using the `seed:admin` script with credentials:
- **Username**: FootLong
- **Password**: footlong.29

**Important**: Change the default admin password after deployment!

## Email Configuration

The password reset feature uses [Resend](https://resend.com) to send emails.

### Setting up Resend

1. Create a free account at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add it to `server/.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM='FootLong Website <onboarding@resend.dev>'
   ```

### Free Tier Limits
- 3,000 emails per month (100/day average)
- No credit card required

### Domain Verification (Production)

For production use, verify your domain in Resend to send emails from your own domain:
1. Go to https://resend.com/domains
2. Add your domain and follow DNS verification steps
3. Update `RESEND_FROM` to use your verified domain

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy Options

**Frontend**: Deploy to Vercel, Netlify, or Render Static Sites
**Backend**: Deploy to Render, Railway, or any Node.js hosting

### Environment Variables for Production

**Backend**:
```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/footlong
JWT_SECRET=your-secure-256-bit-secret
CLIENT_URL=https://your-frontend.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM='FootLong Website <noreply@yourdomain.com>'
```

**Frontend**:
```env
VITE_API_URL=https://your-backend.onrender.com
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment troubleshooting
- Review the documentation for each service:
  - [React Documentation](https://react.dev)
  - [Express Documentation](https://expressjs.com)
  - [MongoDB Documentation](https://www.mongodb.com/docs)
  - [Vite Documentation](https://vitejs.dev)
  - [Resend Documentation](https://resend.com/docs)

## Acknowledgments

- [Lucide Icons](https://lucide.dev) for beautiful SVG icons
- [Resend](https://resend.com) for email services
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free database hosting