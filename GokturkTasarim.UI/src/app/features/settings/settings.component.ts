import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <h2>Sistem & Konfigürasyon Ayarları</h2>
      <p class="text-muted">Göktürk Tasarım portal parametreleri ve API bağlantı profilleri.</p>

      <div class="settings-section glass-card">
        <h3><i class="fa-solid fa-link"></i> API Endpoint Yapılandırması</h3>
        <div class="form-group">
          <label>API Base URL</label>
          <input type="text" class="form-control" value="https://localhost:7198/api" readonly />
        </div>
        <div class="form-group">
          <label>Çalışma Modu</label>
          <select class="form-control">
            <option>Development (Geliştirme)</option>
            <option>Staging (Test)</option>
            <option>Production (Canlı)</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .settings-section {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .settings-section h3 {
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .form-control {
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 0.9rem;
      outline: none;
    }

    .form-control:focus {
      border-color: var(--primary);
    }
  `]
})
export class SettingsComponent {}
