import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { CustomerDashboardComponent } from './features/customer/customer-dashboard.component';
import { ProjectsComponent } from './features/projects/projects.component';
import { SettingsComponent } from './features/settings/settings.component';
import { AboutComponent } from './features/about/about.component';
import { ContactComponent } from './features/contact/contact.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Unified Login Page for both Customer and Admin
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },

  // Main Shell Application Routes
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'dashboard', component: HomeComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },

      // Protected Customer Route
      {
        path: 'customer',
        component: CustomerDashboardComponent,
        canActivate: [authGuard]
      },

      // Dedicated Admin Route (Requires Admin Role)
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [adminGuard]
      },

      { path: '**', redirectTo: '' }
    ]
  }
];
