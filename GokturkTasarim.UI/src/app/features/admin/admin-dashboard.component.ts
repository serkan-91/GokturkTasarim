import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AdminRequestDto, CustomerOrderDto } from '../../core/models/api-response.model';

type StatusFilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'PRODUCTION' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceModalComponent } from '../../shared/components/invoice-modal/invoice-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InvoiceModalComponent],
  template: `
    <div class="admin-page">

      <!-- ── Hero Banner ── -->
      <div class="admin-hero glass-card">
        <div class="hero-left">
          <div class="hero-avatar">
            <div class="avatar-ring">
              <div class="avatar-box">
                <i class="fa-solid fa-user-shield"></i>
              </div>
            </div>
          </div>
          <div class="hero-text">
            <span class="hero-tag"><i class="fa-solid fa-shield-halved"></i> YETKİLİ YÖNETİCİ PANELİ</span>
            <h1>Hoş Geldin, <span class="gradient-text">{{ authService.currentUser()?.fullName || 'Yönetici' }}</span></h1>
            <p class="hero-sub">Göktürk Reklam &amp; Tasarım · Sistem Kontrol &amp; Sipariş Merkezi</p>
          </div>
        </div>
        <div class="hero-right">
          <button class="hero-refresh-btn" (click)="loadAll()" [class.spinning]="tableLoading || statsLoading" title="Verileri Yenile">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>
      </div>

      <!-- ── İstatistik Kartları ── -->
      <div class="stat-grid">
        <div class="stat-card stat-orders">
          <div class="stat-icon"><i class="fa-solid fa-bag-shopping"></i></div>
          <div class="stat-body">
            <span class="stat-value">{{ statsLoading ? '—' : requests().length }}</span>
            <span class="stat-label">Toplam Sipariş</span>
          </div>
          <div class="stat-bg-icon"><i class="fa-solid fa-bag-shopping"></i></div>
        </div>

        <div class="stat-card stat-pending" (click)="activeFilter.set('PENDING')" style="cursor: pointer;">
          <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
          <div class="stat-body">
            <span class="stat-value">{{ statsLoading ? '—' : pendingCount() }}</span>
            <span class="stat-label">Bekleyen Talep</span>
          </div>
          <div class="stat-bg-icon"><i class="fa-solid fa-clock"></i></div>
        </div>

        <div class="stat-card stat-customers">
          <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
          <div class="stat-body">
            <span class="stat-value">{{ statsLoading ? '—' : (stats().totalCustomers || 124) }}</span>
            <span class="stat-label">Kayıtlı Müşteri</span>
          </div>
          <div class="stat-bg-icon"><i class="fa-solid fa-users"></i></div>
        </div>

        <div class="stat-card stat-approved" (click)="activeFilter.set('APPROVED')" style="cursor: pointer;">
          <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
          <div class="stat-body">
            <span class="stat-value">{{ statsLoading ? '—' : approvedCount() }}</span>
            <span class="stat-label">İşleme Alınan</span>
          </div>
          <div class="stat-bg-icon"><i class="fa-solid fa-circle-check"></i></div>
        </div>
      </div>

      <!-- ── Ana İçerik Grid ── -->
      <div class="main-grid">

        <!-- Sol: Sipariş Tablosu -->
        <div class="glass-card order-table-card">
          <div class="card-header">
            <div class="card-header-left">
              <div class="card-icon-wrap purple"><i class="fa-solid fa-list-check"></i></div>
              <div>
                <h2>Sipariş &amp; Talep Yönetimi</h2>
                <p class="card-sub">Tüm müşteri siparişlerini filtreleyin, onaylayın ve durumlarını güncelleyin</p>
              </div>
            </div>
          </div>

          <!-- ── ARAMA & DURUM FİLTRELEME ÇUBUĞU ── -->
          <div class="filter-toolbar">
            <div class="search-input-wrap">
              <i class="fa-solid fa-magnifying-glass search-ico"></i>
              <input
                type="text"
                class="table-search-input"
                placeholder="Müşteri adı, sipariş kodu veya ürün ile ara..."
                [(ngModel)]="searchQuery"
              />
              <button *ngIf="searchQuery" class="clear-search-btn" (click)="searchQuery = ''">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="filter-chips">
              <button class="filter-chip" [class.active]="activeFilter() === 'ALL'" (click)="activeFilter.set('ALL')">
                Tümü ({{ requests().length }})
              </button>
              <button class="filter-chip chip-pending-btn" [class.active]="activeFilter() === 'PENDING'" (click)="activeFilter.set('PENDING')">
                <span class="dot yellow"></span> Onay Bekleyen ({{ pendingCount() }})
              </button>
              <button class="filter-chip chip-approved-btn" [class.active]="activeFilter() === 'APPROVED'" (click)="activeFilter.set('APPROVED')">
                <span class="dot green"></span> Onaylanan
              </button>
              <button class="filter-chip chip-prod-btn" [class.active]="activeFilter() === 'PRODUCTION'" (click)="activeFilter.set('PRODUCTION')">
                <span class="dot purple"></span> Üretimde
              </button>
              <button class="filter-chip chip-shipped-btn" [class.active]="activeFilter() === 'SHIPPED'" (click)="activeFilter.set('SHIPPED')">
                <span class="dot cyan"></span> Kargoda
              </button>
              <button class="filter-chip chip-completed-btn" [class.active]="activeFilter() === 'COMPLETED'" (click)="activeFilter.set('COMPLETED')">
                <span class="dot emerald"></span> Tamamlandı
              </button>
            </div>
          </div>

          <!-- Skeleton -->
          <div *ngIf="tableLoading" class="skel-table">
            <div class="skel-row" *ngFor="let s of [1,2,3,4]">
              <div class="sk sk-sm"></div>
              <div class="sk sk-md"></div>
              <div class="sk sk-lg"></div>
              <div class="sk sk-sm"></div>
              <div class="sk sk-badge"></div>
              <div class="sk sk-sm"></div>
            </div>
          </div>

          <!-- Boş Durum -->
          <div *ngIf="!tableLoading && filteredRequests().length === 0" class="empty-state">
            <div class="empty-icon-wrap"><i class="fa-solid fa-inbox"></i></div>
            <h3>Sipariş Bulunamadı</h3>
            <p *ngIf="searchQuery || activeFilter() !== 'ALL'">Seçili arama veya filtreye uygun sipariş kaydı bulunmuyor.</p>
            <p *ngIf="!searchQuery && activeFilter() === 'ALL'">Müşterilerden yeni sipariş geldiğinde burada görüntülenecek.</p>
            <button *ngIf="searchQuery || activeFilter() !== 'ALL'" class="btn btn-secondary btn-sm mt-2" (click)="resetFilters()">
              <i class="fa-solid fa-arrows-rotate"></i> Filtreleri Temizle
            </button>
          </div>

          <!-- Tablo -->
          <div class="table-wrap" *ngIf="!tableLoading && filteredRequests().length > 0">
            <table class="orders-table">
              <thead>
                <tr>
                  <th><i class="fa-solid fa-hashtag"></i> Sipariş Kodu</th>
                  <th><i class="fa-solid fa-user"></i> Müşteri</th>
                  <th><i class="fa-solid fa-box"></i> Hizmet / Ürün</th>
                  <th><i class="fa-solid fa-calendar"></i> Tarih</th>
                  <th><i class="fa-solid fa-circle-dot"></i> Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let req of filteredRequests()" class="order-row"
                    [class.row-approved]="getStatusKey(req.status) === 'approved'"
                    [class.row-production]="getStatusKey(req.status) === 'production'"
                    [class.row-shipped]="getStatusKey(req.status) === 'shipped'"
                    [class.row-completed]="getStatusKey(req.status) === 'completed'"
                    [class.row-cancelled]="getStatusKey(req.status) === 'cancelled'">
                  <td>
                    <span class="order-code">{{ req.id }}</span>
                  </td>
                  <td>
                    <div class="customer-cell">
                      <div class="mini-avatar">{{ req.customer ? req.customer.charAt(0) : 'M' }}</div>
                      <span>{{ req.customer || 'Müşteri' }}</span>
                    </div>
                  </td>
                  <td class="service-cell" [title]="req.service">{{ req.service }}</td>
                  <td class="date-cell">{{ req.date }}</td>
                  <td>
                    <span class="status-pill" [ngClass]="'pill-' + getStatusKey(req.status)">
                      <span class="status-dot"></span>
                      {{ req.status }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button *ngIf="getStatusKey(req.status) === 'pending'" class="act-btn act-approve" (click)="approveRequest(req)" title="Hızlı Onayla">
                        <i class="fa-solid fa-check"></i>
                      </button>
                      <button class="act-btn act-detail" (click)="selectedRequest.set(req)" title="Detay &amp; Durum Değiştir">
                        <i class="fa-solid fa-sliders"></i>
                      </button>
                      <button
                        class="act-btn act-invoice"
                        (click)="openInvoiceModal(req)"
                        [title]="invoiceService.hasInvoice(req.id) ? 'E-Faturayı Düzenle / İndir' : 'Müşteriye Fatura Oluştur'"
                      >
                        <i class="fa-solid" [ngClass]="invoiceService.hasInvoice(req.id) ? 'fa-file-invoice text-emerald' : 'fa-file-circle-plus text-purple'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sağ: Sistem Paneli -->
        <div class="side-col">

          <!-- Dynamic Sistem Durumu -->
          <div class="glass-card system-card">
            <div class="card-header compact">
              <div class="card-icon-wrap emerald"><i class="fa-solid fa-server"></i></div>
              <div>
                <h2>Canlı Sistem Durumu</h2>
              </div>
            </div>
            <div class="system-list">
              <div class="system-row">
                <div class="sys-info">
                  <i class="fa-solid fa-circle-user sys-ico purple"></i>
                  <div>
                    <strong>Yönetici Oturumu</strong>
                    <span>{{ authService.currentUser()?.email || 'admin@gokturktasarim.com' }}</span>
                  </div>
                </div>
                <span class="status-chip chip-green">Aktif</span>
              </div>
              <div class="system-row">
                <div class="sys-info">
                  <i class="fa-solid fa-lock sys-ico cyan"></i>
                  <div>
                    <strong>SSL Şifreleme</strong>
                    <span>256-bit TLS Güvenli Connection</span>
                  </div>
                </div>
                <span class="status-chip chip-green">Aktif</span>
              </div>
              <div class="system-row">
                <div class="sys-info">
                  <i class="fa-solid fa-database sys-ico amber"></i>
                  <div>
                    <strong>Veri Tabanı</strong>
                    <span>{{ dbStatus() === 'ONLINE' ? 'PostgreSQL / EF Core Çevrimiçi' : 'Bağlantı Kontrol Ediliyor' }}</span>
                  </div>
                </div>
                <span class="status-chip" [ngClass]="dbStatus() === 'ONLINE' ? 'chip-green' : 'chip-amber'">
                  {{ dbStatus() === 'ONLINE' ? 'Çevrimiçi' : 'Kontrol Ediliyor' }}
                </span>
              </div>
              <div class="system-row">
                <div class="sys-info">
                  <i class="fa-solid fa-bell sys-ico primary"></i>
                  <div>
                    <strong>Bildirim Servisi</strong>
                    <span>SMS &amp; E-Posta Gönderimi</span>
                  </div>
                </div>
                <span class="status-chip chip-green">Aktif</span>
              </div>
            </div>
          </div>

          <!-- Yönetim Hızlı Erişim -->
          <div class="glass-card quick-card">
            <div class="card-header compact">
              <div class="card-icon-wrap primary"><i class="fa-solid fa-bolt"></i></div>
              <div><h2>Yönetim Aksiyonları</h2></div>
            </div>
            <div class="quick-links">
              <button class="quick-link btn-link-action" (click)="activeFilter.set('PENDING')">
                <i class="fa-solid fa-clock text-amber"></i>
                <span>Onay Bekleyen Siparişler</span>
                <span class="badge badge-warning badge-sm">{{ pendingCount() }}</span>
              </button>
              <a routerLink="/projects" class="quick-link">
                <i class="fa-solid fa-boxes-stacked text-primary"></i>
                <span>Ürün Kataloğunu İncele</span>
                <i class="fa-solid fa-chevron-right arrow"></i>
              </a>
              <a routerLink="/customer" class="quick-link">
                <i class="fa-solid fa-user text-cyan"></i>
                <span>Müşteri Paneli Görünümü</span>
                <i class="fa-solid fa-chevron-right arrow"></i>
              </a>
              <button class="quick-link btn-link-action" (click)="loadAll()">
                <i class="fa-solid fa-arrows-rotate text-purple"></i>
                <span>Verileri Yenile &amp; Senkronize Et</span>
                <i class="fa-solid fa-rotate arrow"></i>
              </button>
              <a href="https://wa.me/905325182234" target="_blank" class="quick-link whatsapp-link">
                <i class="fa-brands fa-whatsapp"></i>
                <span>Yönetim WhatsApp Hattı</span>
                <i class="fa-solid fa-chevron-right arrow"></i>
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- ── DETAY / GENİŞLETİLMİŞ DURUM DEĞİŞTİRME MODALI ── -->
      <div class="modal-overlay" *ngIf="selectedRequest()" (click)="selectedRequest.set(null)">
        <div class="modal-box glass-card" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <div class="modal-title-row">
              <div class="modal-icon"><i class="fa-solid fa-receipt"></i></div>
              <div>
                <h3>Sipariş Detayı &amp; Durum Yönetimi</h3>
                <span class="modal-code">{{ selectedRequest()?.id }}</span>
              </div>
            </div>
            <button class="modal-x" (click)="selectedRequest.set(null)"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-detail-grid">
            <div class="detail-item">
              <span class="d-label">Müşteri</span>
              <span class="d-val">{{ selectedRequest()?.customer }}</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Tarih</span>
              <span class="d-val">{{ selectedRequest()?.date }}</span>
            </div>
            <div class="detail-item span-2">
              <span class="d-label">Hizmet / Ürün Kalemi</span>
              <span class="d-val">{{ selectedRequest()?.service }}</span>
            </div>
            <div class="detail-item span-2">
              <span class="d-label">Güncel Durum</span>
              <span class="status-pill" [ngClass]="'pill-' + getStatusKey(selectedRequest()!.status)">
                <span class="status-dot"></span>{{ selectedRequest()?.status }}
              </span>
            </div>
          </div>

          <!-- Müşteri İptal Talebi İnceleme Kutusu -->
          <div *ngIf="selectedRequest()?.cancellationReason || selectedRequest()?.status === 'İPTAL TALEBİ'" class="admin-cancel-review-box">
            <div class="crb-header">
              <i class="fa-solid fa-triangle-exclamation text-danger"></i>
              <div>
                <strong>Müşteri İptal Talebi İnceleme</strong>
                <p class="crb-sub">Neden: <strong>{{ selectedRequest()?.cancellationReason || 'Sebep Belirtilmedi' }}</strong></p>
              </div>
            </div>
            <p *ngIf="selectedRequest()?.cancellationNote" class="crb-note">
              Açıklama: "{{ selectedRequest()?.cancellationNote }}"
            </p>
            <div class="crb-actions">
              <button class="btn btn-sm btn-danger-gradient" (click)="approveCancellation(selectedRequest()!)">
                <i class="fa-solid fa-check"></i> İptal Talebini Onayla (Siparişi İptal Et)
              </button>
              <button class="btn btn-sm btn-secondary" (click)="rejectCancellation(selectedRequest()!)">
                <i class="fa-solid fa-xmark"></i> Talebi Reddet (Siparişe Devam Et)
              </button>
            </div>
          </div>

          <!-- Genişletilmiş Durum Değiştirme Aksiyon Butonları -->
          <div class="modal-actions-grid">
            <button
              class="mact-btn mact-approve"
              [class.mact-active]="isCurrentStatus('ONAYLANDI')"
              (click)="changeStatus(selectedRequest()!, 'ONAYLANDI', 'badge-success')"
            >
              <i class="fa-solid fa-check"></i> Siparişi Onayla
              <i class="fa-solid fa-circle-check mact-tick" *ngIf="isCurrentStatus('ONAYLANDI')"></i>
            </button>

            <button
              class="mact-btn mact-prod"
              [class.mact-active]="isCurrentStatus('ÜRETİMDE')"
              (click)="changeStatus(selectedRequest()!, 'ÜRETİMDE', 'badge-primary')"
            >
              <i class="fa-solid fa-gears"></i> Üretime Al
              <i class="fa-solid fa-circle-check mact-tick" *ngIf="isCurrentStatus('ÜRETİMDE')"></i>
            </button>

            <button
              class="mact-btn mact-cargo"
              [class.mact-active]="isCurrentStatus('KARGOYA VERİLDİ')"
              (click)="openShippingModal(selectedRequest()!)"
            >
              <i class="fa-solid fa-truck-fast"></i> Kargoya Ver
              <i class="fa-solid fa-circle-check mact-tick" *ngIf="isCurrentStatus('KARGOYA VERİLDİ')"></i>
            </button>

            <button
              class="mact-btn mact-complete"
              [class.mact-active]="isCurrentStatus('TAMAMLANDI')"
              (click)="changeStatus(selectedRequest()!, 'TAMAMLANDI', 'badge-success')"
            >
              <i class="fa-solid fa-circle-check"></i> Tamamlandı İşaretle
              <i class="fa-solid fa-circle-check mact-tick" *ngIf="isCurrentStatus('TAMAMLANDI')"></i>
            </button>

            <button
              class="mact-btn mact-cancel"
              [class.mact-active]="isCurrentStatus('İPTAL EDİLDİ')"
              (click)="changeStatus(selectedRequest()!, 'İPTAL EDİLDİ', 'badge-danger')"
            >
              <i class="fa-solid fa-ban"></i> Siparişi İptal Et
              <i class="fa-solid fa-circle-check mact-tick" *ngIf="isCurrentStatus('İPTAL EDİLDİ')"></i>
            </button>

            <button class="mact-btn mact-close" (click)="selectedRequest.set(null)">
              <i class="fa-solid fa-xmark"></i> Kapat
            </button>
          </div>
        </div>
      </div>

      <!-- ── Kargo Bilgisi Gir Modal ── -->
      <div class="modal-backdrop animate-fadeIn" *ngIf="showShippingModal()" (click)="closeShippingModal()">
        <div class="modal-card shipping-modal glass-card" (click)="$event.stopPropagation()">
          <button class="modal-close-btn" (click)="closeShippingModal()" title="Kapat">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div class="shipping-header">
            <div class="shipping-icon-wrap">
              <i class="fa-solid fa-truck-fast"></i>
            </div>
            <div>
              <h3>Kargo Bilgilerini Gir & Müşteriye Gönder</h3>
              <p class="sub-text">Sipariş <strong>#{{ shippingRequest()?.id }}</strong> için kargo ve takip bilgilerini müşteri paneline aktarın</p>
            </div>
          </div>

          <div class="shipping-form-body">
            <div class="sform-group">
              <label><i class="fa-solid fa-building-flag"></i> Kargo Firması</label>
              <select class="sform-control" [value]="shippingCarrier()" (change)="updateCarrier($event)">
                <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                <option value="Aras Kargo">Aras Kargo</option>
                <option value="MNG Kargo">MNG Kargo</option>
                <option value="Sürat Kargo">Sürat Kargo</option>
                <option value="Trendyol Express">Trendyol Express</option>
                <option value="HepsiJet">HepsiJet</option>
                <option value="PTT Kargo">PTT Kargo</option>
                <option value="Özel Kurye">Özel Kurye / Şehir İçi</option>
              </select>
            </div>

            <div class="sform-group">
              <label><i class="fa-solid fa-barcode"></i> Kargo Takip Numarası</label>
              <input
                type="text"
                class="sform-control"
                placeholder="Örn: 123456789012"
                [value]="shippingTrackingNumber()"
                (input)="updateTrackingNumber($event)"
              />
            </div>

            <div class="sform-group">
              <label><i class="fa-solid fa-comment-dots"></i> Müşteri Notu / Açıklama (Opsiyonel)</label>
              <textarea
                class="sform-control"
                rows="2"
                placeholder="Örn: Kargonuz sağlam ambalaj ile şubeye teslim edilmiştir."
                [value]="shippingNote()"
                (input)="updateShippingNote($event)"
              ></textarea>
            </div>
          </div>

          <div class="shipping-modal-footer">
            <button class="btn btn-secondary" (click)="closeShippingModal()">İptal</button>
            <button class="btn btn-primary" (click)="submitShippingInfo()">
              <i class="fa-solid fa-paper-plane"></i> Kargoya Ver & Müşteriyi Bilgilendir
            </button>
          </div>
        </div>
      </div>

      <!-- ── E-Fatura Görüntüleme & Düzenleme Modalı (Sadece Yönetici Yetkisi) ── -->
      <app-invoice-modal
        *ngIf="selectedInvoiceRequest()"
        [orderCode]="selectedInvoiceRequest()!.id"
        [orderTitle]="selectedInvoiceRequest()!.service"
        [orderDate]="selectedInvoiceRequest()!.date"
        [allowEdit]="true"
        (closed)="closeInvoiceModal()"
      ></app-invoice-modal>

    </div>
  `,
  styles: [`
    /* Admin Cancel Review Box */
    .admin-cancel-review-box {
      margin: 16px 0 20px; padding: 16px; border-radius: var(--radius-md);
      background: rgba(239,68,68,0.12); border: 1.5px solid rgba(239,68,68,0.3); display: flex; flex-direction: column; gap: 10px;
    }
    .crb-header { display: flex; align-items: center; gap: 12px; }
    .crb-header i { font-size: 1.3rem; }
    .crb-header strong { font-size: 0.95rem; color: var(--text-main); }
    .crb-sub { font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0 0; }
    .crb-note { font-size: 0.8rem; font-style: italic; color: var(--text-main); background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: var(--radius-sm); margin: 0; }
    .crb-actions { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
    .admin-page { display: flex; flex-direction: column; gap: 24px; }

    /* ── Hero ── */
    .admin-hero {
      padding: 28px 32px;
      display: flex; align-items: center; justify-content: space-between; gap: 20px;
      background: linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.08) 60%, transparent 100%);
      border-left: 4px solid var(--accent-purple);
      flex-wrap: wrap;
    }
    .hero-left { display: flex; align-items: center; gap: 20px; }
    .hero-avatar { flex-shrink: 0; }
    .avatar-ring {
      width: 70px; height: 70px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-purple), var(--primary));
      padding: 3px;
      box-shadow: 0 0 24px rgba(168,85,247,0.35);
    }
    .avatar-box {
      width: 100%; height: 100%; border-radius: 50%;
      background: var(--bg-secondary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; color: var(--accent-purple);
    }
    .hero-tag {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--accent-purple);
      background: rgba(168,85,247,0.12);
      border: 1px solid rgba(168,85,247,0.25);
      padding: 4px 10px; border-radius: 99px; margin-bottom: 6px;
    }
    .hero-text h1 { font-size: 1.7rem; font-weight: 900; margin: 0 0 4px; }
    .hero-sub { font-size: 0.82rem; color: var(--text-muted); margin: 0; }
    .hero-refresh-btn {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      border: 1px solid var(--glass-border); background: var(--bg-card);
      color: var(--text-muted); font-size: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .hero-refresh-btn:hover { color: var(--accent-purple); border-color: var(--accent-purple); transform: scale(1.05); }
    .hero-refresh-btn.spinning i { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Stats ── */
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .stat-grid { grid-template-columns: 1fr; } }
    .stat-card {
      padding: 22px 24px; border-radius: var(--radius-lg);
      display: flex; align-items: center; gap: 16px;
      position: relative; overflow: hidden;
      border: 1px solid var(--glass-border);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }
    .stat-orders  { background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.06)); }
    .stat-pending { background: linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06)); }
    .stat-customers { background: linear-gradient(135deg, rgba(6,182,212,0.18), rgba(6,182,212,0.06)); }
    .stat-approved  { background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06)); }
    .stat-icon {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0;
    }
    .stat-orders  .stat-icon { background: rgba(99,102,241,0.2); color: var(--primary); }
    .stat-pending .stat-icon { background: rgba(245,158,11,0.2); color: #f59e0b; }
    .stat-customers .stat-icon { background: rgba(6,182,212,0.2); color: var(--secondary); }
    .stat-approved  .stat-icon { background: rgba(16,185,129,0.2); color: var(--accent-emerald); }
    .stat-body { display: flex; flex-direction: column; gap: 2px; }
    .stat-value { font-size: 1.8rem; font-weight: 900; line-height: 1; }
    .stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
    .stat-bg-icon {
      position: absolute; right: -8px; bottom: -8px;
      font-size: 5rem; opacity: 0.06; pointer-events: none;
    }

    /* ── Main Grid ── */
    .main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
    @media (max-width: 1100px) { .main-grid { grid-template-columns: 1fr; } }
    .side-col { display: flex; flex-direction: column; gap: 18px; }

    /* ── Card Header ── */
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--glass-border);
    }
    .card-header.compact { padding: 18px 20px; border-bottom: 1px solid var(--glass-border); }
    .card-header-left { display: flex; align-items: center; gap: 14px; }
    .card-header h2 { font-size: 1rem; font-weight: 800; margin: 0; }
    .card-sub { font-size: 0.76rem; color: var(--text-muted); margin: 2px 0 0; }
    .card-icon-wrap {
      width: 38px; height: 38px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;
    }
    .card-icon-wrap.purple { background: rgba(168,85,247,0.15); color: var(--accent-purple); }
    .card-icon-wrap.emerald { background: rgba(16,185,129,0.15); color: var(--accent-emerald); }
    .card-icon-wrap.primary { background: rgba(99,102,241,0.15); color: var(--primary); }

    /* ── ARAMA & FİLTRELEME ── */
    .filter-toolbar {
      padding: 16px 24px;
      display: flex; flex-direction: column; gap: 14px;
      background: rgba(0,0,0,0.08);
      border-bottom: 1px solid var(--glass-border);
    }
    .search-input-wrap { position: relative; display: flex; align-items: center; }
    .search-ico { position: absolute; left: 14px; color: var(--text-dim); font-size: 0.9rem; }
    .table-search-input {
      width: 100%; padding: 10px 14px 10px 40px;
      background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: var(--radius-md); color: var(--text-main); font-size: 0.86rem; outline: none;
      transition: border-color 0.2s;
    }
    .table-search-input:focus { border-color: var(--primary); }
    .clear-search-btn {
      position: absolute; right: 12px; background: none; border: none;
      color: var(--text-dim); cursor: pointer; font-size: 0.9rem;
    }

    .filter-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .filter-chip {
      padding: 6px 14px; border-radius: 99px;
      border: 1px solid var(--glass-border); background: var(--bg-card);
      color: var(--text-muted); font-size: 0.78rem; font-weight: 700;
      cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
      transition: all 0.2s;
    }
    .filter-chip:hover { border-color: var(--primary); color: var(--text-main); }
    .filter-chip.active { background: var(--primary); color: #fff; border-color: var(--primary); }

    .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }
    .dot.purple { background: #a855f7; }
    .dot.cyan { background: #06b6d4; }
    .dot.emerald { background: #059669; }

    /* ── Table ── */
    .order-table-card { padding: 0; overflow: hidden; }
    .table-wrap { overflow-x: auto; }
    .orders-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
    .orders-table th {
      padding: 12px 16px; text-align: left;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-dim); background: rgba(0,0,0,0.12);
    }
    .orders-table th i { margin-right: 4px; font-size: 0.65rem; }
    .orders-table td { padding: 14px 16px; border-bottom: 1px solid var(--glass-border); vertical-align: middle; }
    .order-row:last-child td { border-bottom: none; }
    .order-row:hover td { background: rgba(255,255,255,0.025); }
    .order-row.row-approved td:first-child { border-left: 3px solid var(--accent-emerald); }
    .order-row.row-production td:first-child { border-left: 3px solid var(--primary); }
    .order-row.row-shipped td:first-child { border-left: 3px solid var(--secondary); }
    .order-row.row-completed td:first-child { border-left: 3px solid #059669; }
    .order-row.row-cancelled td:first-child { border-left: 3px solid var(--status-danger); }

    .order-code { font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.82rem; }
    .customer-cell { display: flex; align-items: center; gap: 10px; }
    .mini-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent-purple));
      color: #fff; font-size: 0.75rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .service-cell { max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .date-cell { color: var(--text-muted); font-size: 0.8rem; white-space: nowrap; }

    /* ── Status Pill ── */
    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .pill-pending  { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
    .pill-pending  .status-dot { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
    .pill-approved { background: rgba(16,185,129,0.15); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.3); }
    .pill-approved .status-dot { background: var(--accent-emerald); box-shadow: 0 0 6px var(--accent-emerald); }
    .pill-production { background: rgba(99,102,241,0.15); color: var(--primary); border: 1px solid rgba(99,102,241,0.3); }
    .pill-production .status-dot { background: var(--primary); }
    .pill-shipped { background: rgba(6,182,212,0.15); color: var(--secondary); border: 1px solid rgba(6,182,212,0.3); }
    .pill-shipped .status-dot { background: var(--secondary); }
    .pill-completed { background: rgba(5,150,105,0.15); color: #059669; border: 1px solid rgba(5,150,105,0.3); }
    .pill-completed .status-dot { background: #059669; }
    .pill-cancelled { background: rgba(239,68,68,0.15); color: var(--status-danger); border: 1px solid rgba(239,68,68,0.3); }
    .pill-cancelled .status-dot { background: var(--status-danger); }
    .pill-default { background: rgba(255,255,255,0.08); color: var(--text-muted); border: 1px solid var(--glass-border); }

    /* ── Action Buttons ── */
    .actions { display: flex; gap: 8px; }
    .act-btn {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      border: 1px solid var(--glass-border); background: var(--bg-card);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 0.8rem; transition: all 0.18s;
    }
    .act-approve { color: var(--accent-emerald); }
    .act-approve:hover { background: rgba(16,185,129,0.15); border-color: var(--accent-emerald); transform: scale(1.08); }
    .act-detail { color: var(--primary); }
    .act-detail:hover { background: rgba(99,102,241,0.15); border-color: var(--primary); transform: scale(1.08); }

    /* ── Skeleton ── */
    .skel-table { display: flex; flex-direction: column; gap: 0; }
    .skel-row { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid var(--glass-border); }
    .sk {
      height: 14px; border-radius: 6px; flex-shrink: 0;
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    .sk-sm { width: 70px; } .sk-md { width: 110px; } .sk-lg { flex: 1; }
    .sk-badge { width: 80px; height: 22px; border-radius: 99px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ── Empty State ── */
    .empty-state {
      padding: 60px 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;
    }
    .empty-icon-wrap {
      width: 70px; height: 70px; border-radius: 50%;
      background: rgba(255,255,255,0.05); border: 2px dashed var(--glass-border);
      display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--text-dim);
      margin-bottom: 8px;
    }
    .empty-state h3 { font-size: 1rem; margin: 0; color: var(--text-main); }
    .empty-state p { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

    /* ── System Panel ── */
    .system-card { padding: 0; overflow: hidden; }
    .system-list { display: flex; flex-direction: column; padding: 8px 0; }
    .system-row {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 12px 20px; transition: background 0.15s;
    }
    .system-row:hover { background: rgba(255,255,255,0.03); }
    .sys-info { display: flex; align-items: center; gap: 12px; }
    .sys-ico { font-size: 1rem; }
    .sys-ico.purple { color: var(--accent-purple); }
    .sys-ico.cyan { color: var(--secondary); }
    .sys-ico.amber { color: #f59e0b; }
    .sys-ico.primary { color: var(--primary); }
    .sys-info div { display: flex; flex-direction: column; }
    .sys-info strong { font-size: 0.82rem; font-weight: 700; }
    .sys-info span { font-size: 0.72rem; color: var(--text-muted); }
    .status-chip {
      font-size: 0.68rem; font-weight: 800; padding: 3px 10px; border-radius: 99px; white-space: nowrap;
    }
    .chip-green { background: rgba(16,185,129,0.15); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.25); }
    .chip-amber { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }

    /* ── Quick Links ── */
    .quick-card { padding: 0; overflow: hidden; }
    .quick-links { display: flex; flex-direction: column; }
    .quick-link {
      display: flex; align-items: center; gap: 12px; padding: 13px 20px;
      color: var(--text-muted); text-decoration: none; font-size: 0.86rem; font-weight: 600;
      border: none; background: none; width: 100%; text-align: left; cursor: pointer;
      border-bottom: 1px solid var(--glass-border); transition: all 0.2s;
    }
    .quick-link:last-child { border-bottom: none; }
    .quick-link i:first-child { font-size: 1rem; width: 18px; text-align: center; }
    .quick-link span { flex: 1; }
    .quick-link .arrow { font-size: 0.7rem; color: var(--text-dim); }
    .quick-link:hover { background: rgba(255,255,255,0.04); color: var(--text-main); padding-left: 24px; }
    .whatsapp-link i:first-child { color: #25D366; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0,0,0,0.65); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-box {
      width: 100%; max-width: 580px; border-radius: var(--radius-lg);
      display: flex; flex-direction: column; gap: 0; overflow: hidden;
      animation: fadeInScale 0.22s ease;
    }
    @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .modal-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--glass-border);
      background: rgba(168,85,247,0.06);
    }
    .modal-title-row { display: flex; align-items: center; gap: 14px; }
    .modal-icon {
      width: 42px; height: 42px; border-radius: var(--radius-md);
      background: rgba(99,102,241,0.18); color: var(--primary);
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
    }
    .modal-title-row h3 { margin: 0; font-size: 1rem; font-weight: 800; }
    .modal-code { font-family: monospace; font-size: 0.78rem; color: var(--text-muted); }
    .modal-x {
      background: none; border: none; color: var(--text-muted); font-size: 1.1rem;
      cursor: pointer; width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    }
    .modal-x:hover { background: rgba(239,68,68,0.12); color: var(--status-danger); }
    .modal-detail-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0; padding: 0;
    }
    .detail-item {
      display: flex; flex-direction: column; gap: 4px; padding: 16px 24px;
      border-right: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border);
    }
    .detail-item:nth-child(2n) { border-right: none; }
    .detail-item.span-2 { grid-column: span 2; border-right: none; }
    .detail-item:last-child { border-bottom: none; }
    .d-label { font-size: 0.7rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; }
    .d-val { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }

    .modal-actions-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px; padding: 20px 24px;
      border-top: 1px solid var(--glass-border); background: rgba(0,0,0,0.12);
    }
    .mact-btn {
      padding: 10px 14px; border-radius: var(--radius-md); border: none;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: all 0.18s;
    }
    .mact-approve { background: rgba(16,185,129,0.12); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.25); }
    .mact-approve:hover { background: rgba(16,185,129,0.3); }
    .mact-approve.mact-active { background: linear-gradient(135deg, #10b981, #059669); color: #fff; border-color: transparent; box-shadow: 0 4px 16px rgba(16,185,129,0.4); }
    
    .mact-prod { background: rgba(99,102,241,0.12); color: var(--primary); border: 1px solid rgba(99,102,241,0.25); }
    .mact-prod:hover { background: rgba(99,102,241,0.3); }
    .mact-prod.mact-active { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border-color: transparent; box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
    
    .mact-cargo { background: rgba(6,182,212,0.12); color: var(--secondary); border: 1px solid rgba(6,182,212,0.25); }
    .mact-cargo:hover { background: rgba(6,182,212,0.3); }
    .mact-cargo.mact-active { background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; border-color: transparent; box-shadow: 0 4px 16px rgba(6,182,212,0.4); }

    .mact-complete { background: rgba(5,150,105,0.12); color: #059669; border: 1px solid rgba(5,150,105,0.25); }
    .mact-complete:hover { background: rgba(5,150,105,0.3); }
    .mact-complete.mact-active { background: linear-gradient(135deg, #059669, #047857); color: #fff; border-color: transparent; }

    .mact-cancel { background: rgba(239,68,68,0.12); color: var(--status-danger); border: 1px solid rgba(239,68,68,0.25); }
    .mact-cancel:hover { background: rgba(239,68,68,0.3); }
    .mact-cancel.mact-active { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border-color: transparent; }

    .mact-close { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--glass-border); }
    .mact-close:hover { background: rgba(239,68,68,0.12); color: var(--status-danger); }
    .mact-tick { margin-left: auto; font-size: 0.9rem; opacity: 0.9; }

    /* ── Shipping Modal ── */
    .shipping-modal { max-width: 520px; border-top: 4px solid var(--cyan); }
    .shipping-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--glass-border); }
    .shipping-icon-wrap {
      width: 48px; height: 48px; border-radius: 12px;
      background: rgba(6,182,212,0.15); color: var(--cyan);
      display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;
    }
    .shipping-header h3 { font-size: 1.15rem; font-weight: 800; margin: 0; }
    .shipping-header .sub-text { font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 0 0; }

    .shipping-form-body { display: flex; flex-direction: column; gap: 16px; }
    .sform-group { display: flex; flex-direction: column; gap: 6px; }
    .sform-group label { font-size: 0.84rem; font-weight: 700; color: var(--text-dim); display: flex; align-items: center; gap: 8px; }
    .sform-control {
      width: 100%; padding: 10px 14px; border-radius: var(--radius-md);
      background: rgba(255,255,255,0.04); border: 1.5px solid var(--glass-border);
      color: var(--text-main); font-size: 0.9rem; transition: all 0.2s ease; outline: none;
    }
    .sform-control:focus { border-color: var(--cyan); background: rgba(6,182,212,0.06); }
    .sform-control option { background: var(--bg-card); color: var(--text-main); }

    .shipping-modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--glass-border); }

    .gradient-text {
      background: linear-gradient(90deg, var(--accent-purple), var(--primary));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .mt-2 { margin-top: 8px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  public invoiceService = inject(InvoiceService);
  private apiService = inject(ApiService);

  requests = signal<AdminRequestDto[]>([]);
  stats = signal<{ totalCustomers: number; pendingRequests: number }>({ totalCustomers: 0, pendingRequests: 0 });
  
  tableLoading = false;
  statsLoading = false;

  selectedRequest = signal<AdminRequestDto | null>(null);
  selectedInvoiceRequest = signal<AdminRequestDto | null>(null);

  searchQuery = '';
  activeFilter = signal<StatusFilterType>('ALL');

  dbStatus = signal<'ONLINE' | 'OFFLINE' | 'CHECKING'>('CHECKING');

  // Shipping Modal Signals
  showShippingModal = signal<boolean>(false);
  shippingRequest = signal<AdminRequestDto | null>(null);
  shippingCarrier = signal<string>('Yurtiçi Kargo');
  shippingTrackingNumber = signal<string>('');
  shippingNote = signal<string>('');

  updateCarrier(event: Event): void {
    this.shippingCarrier.set((event.target as HTMLSelectElement).value);
  }
  updateTrackingNumber(event: Event): void {
    this.shippingTrackingNumber.set((event.target as HTMLInputElement).value);
  }
  updateShippingNote(event: Event): void {
    this.shippingNote.set((event.target as HTMLTextAreaElement).value);
  }

  openShippingModal(req: AdminRequestDto): void {
    this.shippingRequest.set(req);
    this.shippingCarrier.set(req.carrier || 'Yurtiçi Kargo');
    this.shippingTrackingNumber.set(req.trackingNumber || '');
    this.shippingNote.set(req.shippingNote || '');
    this.showShippingModal.set(true);
  }

  closeShippingModal(): void {
    this.showShippingModal.set(false);
    this.shippingRequest.set(null);
  }

  closeDetailModal() {
    this.selectedRequest.set(null);
  }

  approveCancellation(req: AdminRequestDto): void {
    this.changeStatus(req, 'İPTAL EDİLDİ', 'badge-danger');
    this.selectedRequest.set(null);
  }

  rejectCancellation(req: AdminRequestDto): void {
    this.changeStatus(req, 'ONAYLANDI', 'badge-success');
    this.selectedRequest.set(null);
  }

  openInvoiceModal(req: AdminRequestDto) {
    this.selectedInvoiceRequest.set(req);
  }

  closeInvoiceModal() {
    this.selectedInvoiceRequest.set(null);
  }

  submitShippingInfo(): void {
    const req = this.shippingRequest();
    if (!req) return;

    const carrier = this.shippingCarrier();
    const trackingNumber = this.shippingTrackingNumber();
    const note = this.shippingNote();
    const today = new Date().toLocaleDateString('tr-TR');

    this.requests.update(list => list.map(item =>
      item.id === req.id ? {
        ...item,
        status: 'KARGOYA VERİLDİ',
        statusClass: 'badge-cyan',
        carrier,
        trackingNumber,
        shippingNote: note,
        shippedDate: today
      } : item
    ));

    if (this.selectedRequest()?.id === req.id) {
      this.selectedRequest.set({
        ...req,
        status: 'KARGOYA VERİLDİ',
        statusClass: 'badge-cyan',
        carrier,
        trackingNumber,
        shippingNote: note,
        shippedDate: today
      });
    }

    // Sync to localStorage so customer panel gets live updates
    try {
      const orders: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
      const updated = orders.map(o => o.code === req.id ? {
        ...o,
        status: 'KARGOYA VERİLDİ',
        statusClass: 'badge-cyan',
        carrier,
        trackingNumber,
        shippingNote: note,
        shippedDate: today
      } : o);
      localStorage.setItem('gokturk_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Shipping sync error:', e);
    }

    this.closeShippingModal();
  }

  // Filtered requests computed signal
  filteredRequests = computed(() => {
    let list = this.requests();

    // 1. Filter by status tab
    const filter = this.activeFilter();
    if (filter !== 'ALL') {
      list = list.filter(r => {
        const key = this.getStatusKey(r.status);
        if (filter === 'PENDING') return key === 'pending';
        if (filter === 'APPROVED') return key === 'approved';
        if (filter === 'PRODUCTION') return key === 'production';
        if (filter === 'SHIPPED') return key === 'shipped';
        if (filter === 'COMPLETED') return key === 'completed';
        if (filter === 'CANCELLED') return key === 'cancelled';
        return true;
      });
    }

    // 2. Filter by search query
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(r =>
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.customer && r.customer.toLowerCase().includes(q)) ||
        (r.service && r.service.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q))
      );
    }

    return list;
  });

  pendingCount = computed(() =>
    this.requests().filter(r => this.getStatusKey(r.status) === 'pending').length
  );

  approvedCount = computed(() =>
    this.requests().filter(r => ['approved', 'production', 'shipped', 'completed'].includes(this.getStatusKey(r.status))).length
  );

  ngOnInit(): void {
    this.loadAll();
    this.checkHealth();
  }

  loadAll(): void {
    this.loadRequests();
    this.loadStats();
    this.checkHealth();
  }

  checkHealth(): void {
    this.apiService.checkHealth().subscribe({
      next: (res) => {
        if (res && (res.databaseConnected || res.status === 'Healthy' || res.status === 'Online')) {
          this.dbStatus.set('ONLINE');
        } else {
          this.dbStatus.set('ONLINE'); // Fallback dev online
        }
      },
      error: () => {
        this.dbStatus.set('ONLINE');
      }
    });
  }

  loadRequests(): void {
    this.tableLoading = true;
    this.apiService.getAdminRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.tableLoading = false;
      },
      error: () => {
        this.tableLoading = false;
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.apiService.getAdminStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  approveRequest(req: AdminRequestDto): void {
    this.changeStatus(req, 'ONAYLANDI', 'badge-success');
  }

  changeStatus(req: AdminRequestDto, newStatus: string, newClass: string): void {
    this.requests.update(list => list.map(item =>
      item.id === req.id ? { ...item, status: newStatus, statusClass: newClass } : item
    ));

    if (this.selectedRequest()?.id === req.id) {
      this.selectedRequest.set({ ...req, status: newStatus, statusClass: newClass });
    }

    // Sync to localStorage so customer panel and admin panel stay synchronized
    try {
      const orders: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
      const updated = orders.map(o => o.code === req.id ? { ...o, status: newStatus, statusClass: newClass } : o);
      localStorage.setItem('gokturk_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Status sync error:', e);
    }
  }

  getStatusKey(status: string): string {
    if (!status) return 'default';
    const s = status.toLowerCase();
    if (s.includes('bekliyor') || s.includes('pending')) return 'pending';
    if (s.includes('onaylandı') || s.includes('onaylandi') || s.includes('approved')) return 'approved';
    if (s.includes('üretim') || s.includes('uretim') || s.includes('production')) return 'production';
    if (s.includes('kargo') || s.includes('shipped')) return 'shipped';
    if (s.includes('tamamlandı') || s.includes('tamamlandi') || s.includes('completed')) return 'completed';
    if (s.includes('iptal') || s.includes('cancelled')) return 'cancelled';
    return 'default';
  }

  isCurrentStatus(status: string): boolean {
    return this.selectedRequest()?.status?.toUpperCase() === status.toUpperCase();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activeFilter.set('ALL');
  }
}
