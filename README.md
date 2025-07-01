# PitchSense - AI Pitch Coach

A comprehensive AI-powered platform for startup founders to practice and perfect their investor pitches.

## 🚀 Features

- **Real-time Speech Analysis**: AI-powered feedback on clarity, tone, pacing, and structure
- **Multi-language Support**: Practice in English, Hindi, French, Spanish, and more
- **Professional Templates**: Expert-crafted pitch templates for different scenarios
- **Progress Tracking**: Detailed analytics and improvement suggestions
- **Startup Glossary**: Comprehensive terminology guide
- **AI Chatbot Coach**: 24/7 virtual coaching assistant

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd pitchsense
npm install
```

### 2. Firebase Configuration

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, go to Authentication
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Google" provider
   - Add your domain to authorized domains

3. **Enable Firestore**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" for development

4. **Get Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Copy the configuration object

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: OpenAI API for enhanced AI features
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Firebase Security Rules

For Firestore, use these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pitches/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Domain Authorization

Make sure to add your domains to Firebase Authentication:
- `localhost` (for development)
- Your production domain
- Any other domains you'll use

## 🎯 Usage

1. **Try Demo Mode**: Click "Try Demo" to experience the platform without signing up
2. **Sign In**: Use Google authentication to access full features
3. **Practice**: Start recording your pitch and get real-time feedback
4. **Templates**: Use professional templates for structured pitches
5. **Track Progress**: View your improvement over time in the dashboard
6. **Learn**: Explore the startup glossary and get help from the AI coach

## 🔍 Troubleshooting

### Authentication Issues

1. **"Firebase not configured" error**:
   - Check that all environment variables are set correctly
   - Ensure your `.env` file is in the root directory
   - Restart the development server after adding environment variables

2. **"Unauthorized domain" error**:
   - Add your domain to Firebase Authentication authorized domains
   - Include both `localhost:5173` and your production domain

3. **"Popup blocked" error**:
   - Allow popups for your domain
   - The app will automatically fall back to redirect authentication

### Speech Recognition Issues

1. **Microphone not working**:
   - Ensure microphone permissions are granted
   - Use HTTPS in production (required for microphone access)
   - Check browser compatibility (Chrome, Edge, Safari supported)

2. **Speech not recognized**:
   - Speak clearly and at moderate pace
   - Ensure good microphone quality
   - Check language selection matches your speech

## 🌐 Browser Support

- **Chrome**: Full support (recommended)
- **Edge**: Full support
- **Safari**: Full support
- **Firefox**: Limited speech recognition support

## 📱 Mobile Support

The application is fully responsive and works on mobile devices. Note that speech recognition may have different behavior on mobile browsers.

## 🔒 Privacy & Security

- All user data is encrypted and stored securely in Firebase
- Speech processing happens locally when possible
- No audio data is permanently stored
- Users can delete their data at any time

## 🚀 Deployment

### Netlify Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy from the `dist` folder

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and Firebase.