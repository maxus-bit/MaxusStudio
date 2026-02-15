import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideAppCheck, initializeAppCheck, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { firebaseConfig } from './app/core/config/firebase.config';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    
    // Firebase Setup
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    
    // App Check Setup
    provideAppCheck(() => {
      const app = getApp();
      // ID (Site Key) из консоли reCAPTCHA Enterprise: 6LdX11QsAAAAALlFa3Q_QReRXAPcQNcko9iAqOUH
      const provider = new ReCaptchaEnterpriseProvider('6LdX11QsAAAAALlFa3Q_QReRXAPcQNcko9iAqOUH'); 
      return initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
    }),
    
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions())
  ]
}).catch(err => console.error(err));
