import { Component, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProductGroupService } from '../../core/services/product-group.service';
import { ProductGroupPreviewDto } from '../../core/models/product-group.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="app-sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-nav">
        <!-- Main Section -->
        <div class="nav-section">
          <span class="section-title">GENEL MENÜ</span>
          
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="fa-solid fa-house"></i>
            <span class="link-text">Ana Sayfa & Vitrin</span>
          </a>

          <a routerLink="/projects" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-folder-open"></i>
            <span class="link-text">Hizmetlerimiz</span>
          </a>
        </div>

        <!-- Dynamic Product Groups Section (Sol Ana Menüye Dinamik Ekleme) -->
        <div class="nav-section" *ngIf="productGroups().length > 0">
          <span class="section-title">ÜRÜN GRUPLARI</span>
          <a
            *ngFor="let g of productGroups()"
            [routerLink]="['/group', g.slug]"
            routerLinkActive="active"
            class="nav-item nav-group-item"
            [title]="g.name"
          >
            <i [class]="g.icon || 'fa-solid fa-layer-group'"></i>
            <span class="link-text">{{ g.name }}</span>
          </a>
        </div>

        <!-- Role-based Dynamic Section -->
        <div class="nav-section">
          <span class="section-title">KULLANICI ALANI</span>

          <!-- Guest Nav -->
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/login" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-right-to-bracket"></i>
              <span class="link-text">Giriş Yap</span>
            </a>
          </ng-container>

          <!-- Customer Nav (sadece müşteri için, admin görmez) -->
          <ng-container *ngIf="authService.isLoggedIn() && !authService.isAdmin()">
            <a routerLink="/customer" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-user-check text-emerald"></i>
              <span class="link-text">Müşteri Panelim</span>
            </a>
          </ng-container>

          <!-- Admin Dedicated Nav -->
          <ng-container *ngIf="authService.isAdmin()">
            <a routerLink="/admin" routerLinkActive="active" class="nav-item nav-admin-item">
              <i class="fa-solid fa-user-shield text-purple"></i>
              <span class="link-text">Yetkili Admin Paneli</span>
              <span class="badge badge-primary badge-sm">ADMİN</span>
            </a>
          </ng-container>
        </div>

        <!-- Kurumsal Section -->
        <div class="nav-section">
          <span class="section-title">KURUMSAL</span>

          <a routerLink="/about" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-circle-info"></i>
            <span class="link-text">Hakkımızda</span>
          </a>

          <a routerLink="/contact" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-envelope"></i>
            <span class="link-text">İletişim</span>
          </a>

          <a routerLink="/courier" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-truck-fast text-cyan"></i>
            <span class="link-text">Kargo & Kurye Takip</span>
            <span class="badge badge-success badge-sm">CANLI</span>
          </a>
        </div>

        <!-- System / Personal Settings Section (Only for Logged-In Users) -->
        <div *ngIf="authService.isLoggedIn()" class="nav-section">
          <span class="section-title">HESAP</span>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-gear"></i>
            <span class="link-text">Hesap & Tercihler</span>
          </a>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 260px;
      height: calc(100vh - 70px);
      max-height: calc(100vh - 70px);
      background: var(--bg-secondary);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-right: 1px solid var(--glass-border);
      position: sticky;
      top: 70px;
      padding: 20px 12px;
      transition: width 0.3s ease, background-color 0.35s ease;
      overflow-y: auto;
      z-index: 90;
      flex-shrink: 0;
      align-self: flex-start;
    }

    .app-sidebar.collapsed {
      width: 70px;
    }

    .app-sidebar.collapsed .link-text,
    .app-sidebar.collapsed .section-title,
    .app-sidebar.collapsed .badge-sm {
      display: none;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .section-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-dim);
      padding: 0 12px 6px 12px;
      letter-spacing: 0.08em;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .nav-item i {
      font-size: 1.1rem;
      width: 22px;
      text-align: center;
    }

    .nav-item:hover {
      background: var(--bg-card);
      color: var(--text-main);
      transform: translateX(3px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .nav-group-item {
      border-left: 2px solid rgba(168, 85, 247, 0.4);
    }

    .nav-admin-item {
      border: 1px dashed var(--accent-purple);
      background: rgba(168, 85, 247, 0.08);
    }

    .badge-sm {
      font-size: 0.65rem;
      padding: 2px 6px;
      margin-left: auto;
    }

    .text-emerald { color: var(--status-success); }
    .text-purple { color: var(--accent-purple); }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  public authService = inject(AuthService);
  private groupService = inject(ProductGroupService);

  public productGroups = signal<ProductGroupPreviewDto[]>([]);
  private updateSub?: Subscription;

  ngOnInit() {
    this.loadGroups();
    this.updateSub = this.groupService.onGroupsUpdated.subscribe(() => {
      this.loadGroups();
    });
  }

  ngOnDestroy() {
    this.updateSub?.unsubscribe();
  }

  private loadGroups() {
    this.groupService.getProductGroups().subscribe({
      next: (groups) => this.productGroups.set(groups),
      error: () => this.productGroups.set([])
    });
  }
}
