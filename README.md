# Maxus Studio - AI Image Generation

> A modern Angular application for generating, managing, and sharing AI-generated images powered by Gemini API

[![Angular](https://img.shields.io/badge/Angular-18+-dd0031?style=flat-square&logo=angular)](https://angular.io)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-FFA000?style=flat-square&logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

## ✨ Features

- **AI Image Generation**: Generate images using Gemini API
- **User Authentication**: Secure authentication with Firebase
- **Subscription Management**: Stripe integration for subscription handling
- **Image Gallery**: Browse and manage generated images
- **Cloud Storage**: Store images in Firebase Storage
- **Real-time Updates**: Firestore for real-time data synchronization
- **Responsive Design**: Mobile-first UI with SCSS styling
- **Toast Notifications**: User-friendly feedback system
- **Dark Theme**: Modern dark UI design

## 🛠 Tech Stack

### Frontend
- **Framework**: [Angular 18+](https://angular.io)
- **Language**: [TypeScript 5.4+](https://www.typescriptlang.org)
- **Styling**: [SCSS](https://sass-lang.com) with CSS Grid & Flexbox
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router with Guards
- **State Management**: RxJS Observables

### Backend & Services
- **Firebase**:
  - Authentication (Email/Password, OAuth)
  - Firestore (Real-time Database)
  - Storage (Image Hosting)
  - Cloud Functions (Node.js 20)
  - App Check (reCAPTCHA Enterprise)
  
- **APIs**:
  - [Google Gemini API](https://ai.google.dev) - AI Image Generation
  - [Stripe API](https://stripe.com) - Payment Processing
  - [Google Vertex AI](https://cloud.google.com/vertex-ai) - Advanced AI features

### Infrastructure
- **Deployment**: Firebase Hosting
- **Database**: Firestore
- **File Storage**: Firebase Storage Rules

## 📁 Project Structure

```
angular/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config/          # Configuration files
│   │   │   ├── guards/          # Route guards (auth, etc)
│   │   │   ├── models/          # Interfaces and types
│   │   │   ├── services/        # Core services
│   │   │   └── state/           # Application state (RxJS)
│   │   │
│   │   ├── features/
│   │   │   ├── auth/            # Authentication feature
│   │   │   ├── dashboard/       # Main dashboard feature
│   │   │   ├── landing/         # Landing page
│   │   │   └── privacy-policy/  # Legal pages
│   │   │
│   │   ├── shared/
│   │   │   ├── components/      # Reusable components
│   │   │   └── services/        # Shared services
│   │   │
│   │   ├── app.component.ts     # Root component with preloader
│   │   ├── app.routes.ts        # Route configuration
│   │   └── app.config.ts        # Application providers
│   │
│   ├── environments/            # Environment configurations
│   ├── assets/                  # Static assets
│   ├── styles/                  # Global styles
│   ├── main.ts                  # Application entry point
│   └── index.html               # HTML template
│
├── functions/                   # Firebase Cloud Functions
│   ├── index.js                 # Functions handlers
│   └── package.json
│
├── angular.json                 # Angular CLI config
├── firebase.json                # Firebase Hosting config
├── tsconfig.json                # TypeScript config
├── package.json                 # Project dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org))
- **npm** 10+ (comes with Node.js)
- **Angular CLI** 18+ (`npm install -g @angular/cli`)
- **Firebase Account** ([Create one](https://firebase.google.com))
- **Google Gemini API Key** ([Get it here](https://ai.google.dev))
- **Stripe Account** (Optional, for payments)


## 💻 Development

### Start Development Server

```bash
npm start
```

Opens the app at `http://localhost:4200` with hot reload.

### Build for Development

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

Rebuilds on file changes.

### Run Tests

```bash
npm test
```

### Lint Code

```bash
ng lint
```

### Firebase Functions Development

```bash
cd functions
npm run serve
```

## 🏗 Architecture

### Application Flow

```
App Initializes
    ↓
App Check (reCAPTCHA) Verification
    ↓
Auth Service - Check User Session
    ↓
Route Guards - Determine Access
    ↓
Features Load (Lazy Loading)
    ↓
Preloader Hides → App Ready
```

### Data Flow

```
Frontend (Angular)
    ↓ HTTP Calls
Cloud Functions (Node.js)
    ↓
Firestore + Storage + APIs
    ↓
Third-party Services
    - Gemini API (Image Gen)
    - Vertex AI (Advanced AI)
    - Stripe (Payments)
```

### Authentication Flow

1. User signs up/logs in
2. Firebase Auth issues JWT token
3. Token stored in browser
4. Auth Guard validates on route access
5. Firestore rules restrict data access

### Key Services

| Service | Purpose |
|---------|---------|
| `AuthService` | User authentication & session |
| `FirestoreService` | Database CRUD operations |
| `GeminiApiService` | AI image generation |
| `StorageService` | Image upload/download |
| `SubscriptionService` | Subscription management |
| `ToastService` | User notifications |
| `TranslationService` | i18n support |

## 📦 Dependencies

### Main Dependencies
- `@angular/core@18.0.0` - Angular framework
- `@angular/fire@18.0.0` - Firebase integration
- `firebase@12.7.0` - Firebase SDK
- `@google/generative-ai@0.24.1` - Gemini API
- `rxjs@7.8.0` - Reactive programming

### Functions Dependencies
- `firebase-functions@4.3.1` - Cloud Functions
- `firebase-admin@11.8.0` - Firebase Admin SDK
- `stripe@20.2.0` - Payment processing
- `@google-cloud/vertexai@1.10.0` - Vertex AI

See [package.json](package.json) for complete list.

## 🔒 Security

### Best Practices Implemented

✅ **Authentication**
- Firebase Authentication with email verification
- Auth Guards on protected routes
- Password reset flow

✅ **Authorization**
- Firestore Security Rules
- Storage Rules for file access
- App Check with reCAPTCHA

✅ **HTTPS**
- All Firebase services use SSL/TLS
- Strict security headers


## 📞 Support


- 📧 Email: noreply.maxus@gmail.com

---

**Made with ❤️ by the Max**

Last Updated: February 2026

