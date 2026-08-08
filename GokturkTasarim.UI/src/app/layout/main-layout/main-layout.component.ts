import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="layout-wrapper">
      <app-header (toggleSidebar)="isSidebarCollapsed = !isSidebarCollapsed"></app-header>
      <div class="layout-body">
        <app-sidebar [collapsed]="isSidebarCollapsed"></app-sidebar>
        <main class="main-content">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
          <app-footer></app-footer>
        </main>
      </div>
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
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: calc(100vh - 70px);
      overflow-y: auto;
    }

    .content-container {
      padding: 32px;
      flex: 1;
    }
  `]
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;
}
