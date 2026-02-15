import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, CommonModule],
  template: `
    <div class="app-preloader" [class.hidden]="!isLoading">
      <div class="loading-content">
        
        <!-- Dashboard Skeleton -->
        <div class="loading-skeleton dashboard-skeleton" *ngIf="isDashboard">
          <div class="skeleton-sidebar">
            <div class="skeleton-sidebar-item"></div>
            <div class="skeleton-sidebar-item"></div>
            <div class="skeleton-sidebar-item"></div>
            <div class="skeleton-sidebar-item"></div>
          </div>
          <div class="skeleton-main">
            <div class="skeleton-dashboard-header">
              <div class="skeleton-badge"></div>
              <div class="skeleton-avatar"></div>
            </div>
            <div class="skeleton-content">
              <div class="skeleton-text-line"></div>
              <div class="skeleton-text-line short"></div>
            </div>
            <div class="skeleton-input"></div>
          </div>
        </div>

        <!-- Landing Page Skeleton -->
        <div class="skeleton-landing" *ngIf="!isDashboard">
          <div class="skeleton-landing-header">
            <div class="skeleton-logo"></div>
            <div class="skeleton-nav">
              <div class="skeleton-nav-item"></div>
              <div class="skeleton-nav-item"></div>
              <div class="skeleton-nav-item"></div>
              <div class="skeleton-nav-item"></div>
            </div>
            <div class="skeleton-auth">
              <div class="skeleton-btn small"></div>
              <div class="skeleton-btn small primary"></div>
            </div>
          </div>
          
          <div class="skeleton-hero">
            <div class="skeleton-title-line large"></div>
            <div class="skeleton-title-line medium"></div>
            <div class="skeleton-title-line small"></div>
            
            <div class="skeleton-subtitle-wrapper">
               <div class="skeleton-subtitle-line"></div>
               <div class="skeleton-subtitle-line short"></div>
            </div>

            <div class="skeleton-btn large-glow"></div>
          </div>
        </div>

      </div>
    </div>
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
  `,
  styles: [`
    .app-preloader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #050505; /* Default dark */
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }

    .app-preloader.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .loading-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* =========================================
       DASHBOARD SKELETON STYLES
       ========================================= */
    .dashboard-skeleton {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 0;
      background-color: #050505;
    }

    .skeleton-sidebar {
      width: 280px;
      background-color: #0a0a0a;
      border-right: 1px solid #222;
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-sidebar-item {
      width: 100%;
      height: 40px;
      background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 10px;
    }
    .skeleton-sidebar-item:nth-child(2) { animation-delay: 0.1s; }
    .skeleton-sidebar-item:nth-child(3) { animation-delay: 0.2s; }
    .skeleton-sidebar-item:nth-child(4) { animation-delay: 0.3s; }

    .skeleton-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #050505;
    }

    .skeleton-dashboard-header {
      height: 80px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 40px;
      gap: 20px;
    }

    .skeleton-badge {
      width: 100px;
      height: 35px;
      background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 20px;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 50%;
    }

    .skeleton-content {
      flex: 1;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .skeleton-text-line {
      width: 300px;
      height: 30px;
      background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    .skeleton-text-line.short { width: 200px; animation-delay: 0.2s; }

    .skeleton-input {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 80px);
      max-width: 700px;
      height: 60px;
      background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 20px;
    }


    /* =========================================
       LANDING SKELETON STYLES
       ========================================= */
    .skeleton-landing {
      width: 100%;
      height: 100%;
      background-color: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .skeleton-landing-header {
      width: 100%;
      height: 80px;
      padding: 0 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }
    
    .skeleton-logo {
      width: 120px;
      height: 40px;
      background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    .skeleton-nav {
      display: flex;
      gap: 30px;
    }

    .skeleton-nav-item {
      width: 80px;
      height: 15px;
      background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-auth {
      display: flex;
      gap: 15px;
    }

    .skeleton-btn {
      background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 10px;
    }

    .skeleton-btn.small {
      width: 100px;
      height: 45px;
    }
    
    .skeleton-btn.primary {
       background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
    }

    .skeleton-hero {
      margin-top: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      width: 100%;
      max-width: 900px;
      padding: 0 20px;
    }

    .skeleton-title-line {
      height: 70px;
      background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 12px;
    }

    .skeleton-title-line.large { width: 90%; }
    .skeleton-title-line.medium { width: 60%; }
    .skeleton-title-line.small { width: 40%; }

    .skeleton-subtitle-wrapper {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 100%;
    }

    .skeleton-subtitle-line {
        height: 20px;
        width: 50%;
        background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    .skeleton-subtitle-line.short { width: 30%; }

    .skeleton-btn.large-glow {
        margin-top: 50px;
        width: 220px;
        height: 55px;
        border-radius: 30px;
        background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .skeleton-nav, .skeleton-auth { display: none; }
        .skeleton-landing-header { justify-content: space-between; padding: 0 20px; }
        .skeleton-logo { width: 100px; }
        
        /* Hamburger skeleton */
        .skeleton-landing-header::after {
            content: '';
            display: block;
            width: 30px;
            height: 20px;
            background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
            border-radius: 4px;
            animation: shimmer 1.5s infinite;
        }

        .skeleton-title-line { height: 40px; }
        .skeleton-title-line.large { width: 100%; }
        .skeleton-hero { margin-top: 60px; }
        .skeleton-btn.large-glow { margin-top: 30px; }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Maxus';
  isLoading = true;
  isDashboard = false;
  private authService = inject(AuthService);

  constructor() {
    // Определяем, какую страницу мы загружаем
    const path = window.location.pathname;
    // Считаем дашбордом все, что начинается с /dashboard или /chat
    this.isDashboard = path.startsWith('/dashboard') || path.startsWith('/chat');
  }

  ngOnInit() {
    // Ждем полной инициализации авторизации
    this.authService.authCheckComplete$.pipe(
      filter(complete => complete),
      take(1)
    ).subscribe(() => {
        // Даем немного времени для отработки гардов и анимации
        setTimeout(() => {
             this.isLoading = false;
        }, 500);
    });
  }
}
