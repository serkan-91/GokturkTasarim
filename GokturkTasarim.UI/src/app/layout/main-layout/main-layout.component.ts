import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, CartDrawerComponent],
  template: `
    <div class="layout-wrapper">
      <app-header (toggleSidebar)="toggleSidebar()"></app-header>
      <div class="layout-body">
        <app-sidebar [collapsed]="isSidebarCollapsed"></app-sidebar>
        <main class="main-content">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      <app-footer></app-footer>
      <app-cart-drawer></app-cart-drawer>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-primary);
    }

    .layout-body {
      display: flex;
      flex: 1;
      position: relative;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .content-container {
      padding: 32px;
      flex: 1;
    }

    @media (max-width: 768px) {
      .content-container {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent {
  private router = inject(Router);
  isSidebarCollapsed = false;

  constructor() {
    // Auto-close sidebar on mobile when route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (window.innerWidth <= 768) {
        this.isSidebarCollapsed = true;
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
