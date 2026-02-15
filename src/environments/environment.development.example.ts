// ⚠️ ШАБЛОН ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
// Скопируй этот файл в environment.development.ts и заполни свои ключи
// НЕ коммитьте файл environment.development.ts с реальными ключами!

export const environment = {
    production: false,
    firebase: {
        apiKey: "YOUR_DEVELOPMENT_API_KEY",           // Получи на https://console.firebase.google.com
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    geminiApiKey: "YOUR_GEMINI_API_KEY"               // Получи на https://makersuite.google.com/app/apikey
};

