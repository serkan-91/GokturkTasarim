import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Unified Login Page for both Customer and Admin — lazy loaded
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },

  // Main Shell Application Routes
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'courier',
        loadComponent: () => import('./features/courier/courier.component').then(m => m.CourierComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'legal',
        loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent)
      },
      {
        path: 'odeme-basarili',
        loadComponent: () => import('./features/payment/payment-success.component').then(m => m.PaymentSuccessComponent)
      },
      {
        path: 'odeme-basarisiz',
        loadComponent: () => import('./features/payment/payment-fail.component').then(m => m.PaymentFailComponent)
      },
      {
        path: 'group/:slug',
        loadComponent: () => import('./features/product-group/product-group-detail.component').then(m => m.ProductGroupDetailComponent)
      },

      // Protected Customer Route — lazy loaded
      {
        path: 'customer',
        loadComponent: () => import('./features/customer/customer-dashboard.component').then(m => m.CustomerDashboardComponent),
        canActivate: [authGuard]
      },

      // Dedicated Admin Route (Requires Admin Role) — lazy loaded
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [adminGuard]
      },

      { path: '**', redirectTo: '' }
    ]
  }
];
