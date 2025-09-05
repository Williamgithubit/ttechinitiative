# TTech Initiative Platform

A comprehensive educational platform for managing admissions, programs, and student interactions for TTech Initiative.

## 🚀 Features

### For Students/Applicants
- **Online Application System**: Streamlined admission application process
- **Application Status Tracking**: Real-time updates on application status
- **Program Browsing**: Explore available programs and courses
- **FAQ Section**: Comprehensive answers to common questions
- **Certificate Management**: View and download certificates

### For Administrators
- **Dashboard**: Overview of key metrics and recent activities
- **Admission Management**: Process and review applications
- **Program Management**: Create and manage educational programs
- **User Management**: Handle user accounts and permissions
- **Content Management**: Update website content and announcements

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS

### Backend
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Hosting**: Vercel (Frontend), Firebase Hosting (Optional)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Firebase account and project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ttechinitiative.git
   cd ttechinitiative/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   - Copy `.env.local.example` to `.env.local`
   - Update Firebase configuration with your project details
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🔒 Authentication

- **User Roles**:
  - Admin: Full access to all features
  - Staff: Limited access based on permissions
  - Student: Access to personal dashboard and applications
  - Guest: Access to public pages and application submission

## 📂 Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── app/             # Next.js 13+ app directory
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   ├── ui/          # Generic UI components
│   │   └── ...
│   ├── services/        # API and service integrations
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── .env.local          # Environment variables
└── ...
```

## 🌐 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fttechinitiative)

### Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Deploy:
   ```bash
   firebase login
   firebase init
   firebase deploy
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material-UI Documentation](https://mui.com/)

---

<div align="center">
  Made with ❤️ by TTech Initiative Team
</div>