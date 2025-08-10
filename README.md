# LocalEventConnect

A comprehensive event management and social networking platform built with modern web technologies and mobile support.

## 🚀 Features

- **Event Management**: Create, browse, and manage local events
- **Social Networking**: Connect with other users and share experiences
- **Mobile App**: Cross-platform mobile application using Expo
- **Real-time Chat**: Built-in chat system for event participants
- **User Profiles**: Customizable user profiles with anime-style avatars
- **Responsive Design**: Modern UI components built with shadcn/ui

## 🏗️ Architecture

### Frontend (Client)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** components for consistent design
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching

### Backend (Server)
- **Node.js** with TypeScript
- **Express.js** framework
- **Drizzle ORM** for database management
- **JWT** authentication
- **File upload** support for images

### Mobile App
- **Expo** framework
- **React Native** with TypeScript
- **Cross-platform** support (iOS & Android)
- **Native navigation** and components

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM
- **Mobile**: Expo, React Native, TypeScript
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT tokens
- **Build Tools**: Vite, Capacitor, Expo CLI

## 📱 Mobile Features

- **Expo Development**: Hot reload and easy testing
- **QR Code Scanning**: Quick access to development builds
- **Responsive Design**: Optimized for all screen sizes
- **Native Performance**: Smooth animations and interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (for mobile development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd LocalEventConnect
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   
   # Install mobile dependencies
   cd ../mobile && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   ```

4. **Start Development**
   ```bash
   # Start the backend server
   cd server && npm run dev
   
   # Start the frontend client
   cd ../client && npm run dev
   
   # Start mobile development
   cd ../mobile && npm start
   ```

## 📱 Mobile Development

### Expo Development
```bash
cd mobile
npm start
```

This will open the Expo development server with a QR code that you can scan with the Expo Go app on your mobile device.

### Building for Production
```bash
# Build for Android
cd mobile && npm run build:android

# Build for iOS
cd mobile && npm run build:ios
```

## 🌐 Web Development

### Client Development
```bash
cd client
npm run dev
```

The web client will be available at `http://localhost:5173`

### Server Development
```bash
cd server
npm run dev
```

The API server will be available at `http://localhost:3000`

## 📁 Project Structure

```
LocalEventConnect/
├── client/                 # React web application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/                # Node.js backend API
│   ├── routes/           # API route handlers
│   ├── db.ts            # Database configuration
│   └── index.ts         # Server entry point
├── mobile/               # Expo mobile application
│   ├── src/
│   │   ├── components/  # Mobile components
│   │   ├── screens/     # Screen components
│   │   └── config/      # Mobile configuration
├── shared/               # Shared utilities and types
└── android/              # Android native code (Capacitor)
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in the root and server directories:

```env
# Root .env
VITE_API_URL=http://localhost:3000

# Server .env
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

## 📊 Database

The project uses Drizzle ORM with support for:
- **SQLite** (development)
- **PostgreSQL** (production)
- **Automatic migrations**
- **Type-safe queries**

## 🚀 Deployment

### Web Application
- Build the client: `cd client && npm run build`
- Deploy the `dist` folder to your hosting service

### Backend API
- Build the server: `cd server && npm run build`
- Deploy to your preferred hosting service (Heroku, Vercel, etc.)

### Mobile App
- Use Expo Application Services (EAS) for builds
- Submit to App Store and Google Play Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Expo](https://expo.dev/) for mobile development framework
- [Drizzle ORM](https://orm.drizzle.team/) for database management
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the API documentation in `server/api-documentation.md`

---

**LocalEventConnect** - Connecting people through local events! 🎉
