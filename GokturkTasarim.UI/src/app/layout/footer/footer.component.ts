import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <span>© 2026 Göktürk Tasarım. Tüm Hakları Saklıdır.</span>
        <div class="footer-links">
          <span class="badge badge-success">.NET 9 + Angular 19</span>
          <a href="#" class="footer-link"><i class="fa-solid fa-code"></i> Dokümantasyon</a>
          <a href="#" class="footer-link"><i class="fa-solid fa-circle-question"></i> Destek</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      height: 50px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .footer-content {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .footer-link {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color var(--transition-fast);
    }

    .footer-link:hover {
      color: var(--secondary);
    }
  `]
})
export class FooterComponent {}
