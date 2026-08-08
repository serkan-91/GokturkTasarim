import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice, InvoiceItem } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invoice-modal-backdrop animate-fadeIn" (click)="close()">
      <div class="invoice-modal-card glass-card" (click)="$event.stopPropagation()">

        <!-- ── Modal Header ── -->
        <div class="modal-top-bar no-print">
          <div class="top-title">
            <i class="fa-solid fa-file-invoice-dollar text-cyan"></i>
            <span>Resmi E-Fatura &amp; Belge Yönetimi</span>
          </div>
          <div class="top-actions">
            <button *ngIf="allowEdit && !isEditing()" class="top-btn btn-edit" (click)="enableEditMode()">
              <i class="fa-solid fa-pen-to-square"></i> Faturayı Düzenle
            </button>
            <button *ngIf="invoice() && !isEditing()" class="top-btn btn-xml" (click)="downloadXml()" title="Logo, Zirve, Luca, Mikro, Paraşüt vb. muhasebe yazılımları ile %100 Uyumlu UBL-TR XML İndir">
              <i class="fa-solid fa-file-code"></i> XML İndir (UBL-TR)
            </button>
            <button *ngIf="invoice() && !isEditing()" class="top-btn btn-view-xml" (click)="toggleXmlView()" title="XML Kodunu Görüntüle">
              <i class="fa-solid fa-code"></i> {{ showXmlView() ? 'Fatura Görünümü' : 'XML Görünümü' }}
            </button>
            <button *ngIf="!isEditing() && !showXmlView()" class="top-btn btn-print" (click)="printInvoice()">
              <i class="fa-solid fa-print"></i> Yazdır / PDF İndir
            </button>
            <button class="top-btn btn-close" (click)="close()" title="Kapat">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- ── 0. XML GÖRÜNTÜLEME PANENİ (UBL-TR) ── -->
        <div *ngIf="showXmlView() && invoice()" class="xml-preview-box">
          <div class="xml-box-header">
            <div>
              <strong>UBL-TR 2.1 E-Fatura Standardı XML Çıktısı</strong>
              <p>Logo, Zirve, Luca, Mikro, Paraşüt, BizimHesap, Netsis gibi tüm muhasebe programlarına doğrudan aktarılabilir.</p>
            </div>
            <div class="xml-box-actions">
              <button class="btn btn-secondary btn-sm" (click)="copyXmlText()">
                <i class="fa-solid" [ngClass]="xmlCopied() ? 'fa-check text-emerald' : 'fa-copy'"></i>
                {{ xmlCopied() ? 'Kopyalandı!' : 'XML Kopyala' }}
              </button>
              <button class="btn btn-primary btn-sm" (click)="downloadXml()">
                <i class="fa-solid fa-download"></i> XML Dosyasını İndir (.xml)
              </button>
            </div>
          </div>
          <pre class="xml-code-block"><code>{{ getXmlContent() }}</code></pre>
        </div>

        <!-- ── 1. FATURA GÖRÜNTÜLEME MODU (VIEW & PRINT) ── -->
        <div *ngIf="!isEditing() && !showXmlView() && invoice()" class="printable-invoice-sheet" id="printableInvoice">

          <!-- Header / Filigran -->
          <div class="inv-header">
            <div class="inv-brand">
              <div class="brand-logo">
                <i class="fa-solid fa-print"></i>
              </div>
              <div>
                <h2>GÖKTÜRK TASARIM &amp; REKLAM</h2>
                <p class="brand-sub">Matbaa, Promosyon &amp; Dijital Baskı Hizmetleri</p>
              </div>
            </div>

            <div class="inv-meta-box">
              <div class="inv-type-badge">E-FATURA</div>
              <div class="meta-row">
                <span class="lbl">Fatura No:</span>
                <span class="val font-mono"><strong>{{ invoice()!.invoiceNumber }}</strong></span>
              </div>
              <div class="meta-row">
                <span class="lbl">Sipariş No:</span>
                <span class="val font-mono">{{ invoice()!.orderCode }}</span>
              </div>
              <div class="meta-row">
                <span class="lbl">Düzenleme Tarihi:</span>
                <span class="val">{{ invoice()!.issueDate }}</span>
              </div>
              <div class="meta-row">
                <span class="lbl">Düzenleme Zamanı:</span>
                <span class="val">14:30:00</span>
              </div>
            </div>
          </div>

          <hr class="inv-divider" />

          <!-- Taraflar (Satıcı & Alıcı) -->
          <div class="inv-parties-grid">

            <!-- Satıcı Bilgileri -->
            <div class="party-card seller-card">
              <div class="party-title"><i class="fa-solid fa-building"></i> SATICI BİLGİLERİ</div>
              <div class="party-name">{{ invoice()!.sellerTitle }}</div>
              <div class="party-info">
                <span><strong>Vergi Dairesi:</strong> {{ invoice()!.sellerTaxDept }}</span>
                <span><strong>Vergi No:</strong> {{ invoice()!.sellerTaxNo }}</span>
                <span><strong>Adres:</strong> {{ invoice()!.sellerAddress }}</span>
                <span><strong>Telefon:</strong> {{ invoice()!.sellerPhone }}</span>
                <span><strong>E-Posta:</strong> {{ invoice()!.sellerEmail }}</span>
              </div>
            </div>

            <!-- Alıcı Müşteri Bilgileri -->
            <div class="party-card buyer-card">
              <div class="party-title"><i class="fa-solid fa-user-tie"></i> ALICI (MÜŞTERİ) BİLGİLERİ</div>
              <div class="party-name">{{ invoice()!.buyerCompany || invoice()!.buyerName }}</div>
              <div class="party-info">
                <span *ngIf="invoice()!.buyerName && invoice()!.buyerCompany"><strong>Yetkili:</strong> {{ invoice()!.buyerName }}</span>
                <span><strong>Vergi Dairesi:</strong> {{ invoice()!.buyerTaxDept || 'Maslak V.D.' }}</span>
                <span><strong>Vergi No / T.C.:</strong> {{ invoice()!.buyerTaxNo || '1920839412' }}</span>
                <span><strong>Teslimat / Fatura Adresi:</strong> {{ invoice()!.buyerAddress }}</span>
                <span><strong>Telefon:</strong> {{ invoice()!.buyerPhone }}</span>
                <span><strong>E-Posta:</strong> {{ invoice()!.buyerEmail }}</span>
              </div>
            </div>

          </div>

          <!-- Ürün / Hizmet Tablosu -->
          <div class="inv-table-wrap">
            <table class="inv-table">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Ürün / Hizmet Açıklaması</th>
                  <th style="width: 70px; text-align: center;">Miktar</th>
                  <th style="width: 110px; text-align: right;">Birim Fiyat</th>
                  <th style="width: 80px; text-align: center;">KDV %</th>
                  <th style="width: 100px; text-align: right;">KDV Tutarı</th>
                  <th style="width: 130px; text-align: right;">Toplam</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of invoice()!.items; let i = index">
                  <td style="text-align: center;">{{ i + 1 }}</td>
                  <td>
                    <strong>{{ item.productName }}</strong>
                  </td>
                  <td style="text-align: center;">{{ item.quantity }} Adet</td>
                  <td style="text-align: right;">₺{{ item.unitPrice | number:'1.2-2' }}</td>
                  <td style="text-align: center;">%{{ item.taxRate }}</td>
                  <td style="text-align: right;">₺{{ (item.quantity * item.unitPrice * item.taxRate / 100) | number:'1.2-2' }}</td>
                  <td style="text-align: right;"><strong>₺{{ (item.quantity * item.unitPrice) | number:'1.2-2' }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Alt Toplamlar & Banka Bilgileri -->
          <div class="inv-bottom-grid">

            <!-- Banka & Ödeme Notu -->
            <div class="inv-notes-box">
              <div class="notes-title"><i class="fa-solid fa-building-columns"></i> Banka Hesabı &amp; Ödeme Notları</div>
              <div class="bank-row">
                <span><strong>Banka:</strong> {{ invoice()!.bankName }}</span>
                <span><strong>IBAN:</strong> <strong class="font-mono text-cyan">{{ invoice()!.iban }}</strong></span>
                <span><strong>Hesap Sahibi:</strong> {{ invoice()!.sellerTitle }}</span>
              </div>
              <div class="notes-text" *ngIf="invoice()!.notes">
                <i class="fa-solid fa-circle-info"></i> {{ invoice()!.notes }}
              </div>
              <div class="efatura-qr-box no-print">
                <i class="fa-solid fa-qrcode qr-icon"></i>
                <div class="qr-info">
                  <strong>E-Fatura Doğrulama Kodu</strong>
                  <small>E-Fatura Gelir İdaresi Başkanlığı portalından sorgulanabilir.</small>
                </div>
              </div>
            </div>

            <!-- Hesap Özeti -->
            <div class="inv-summary-box">
              <div class="sum-row">
                <span>Ara Toplam (KDV Hariç):</span>
                <span>₺{{ invoice()!.subTotal | number:'1.2-2' }}</span>
              </div>
              <div class="sum-row">
                <span>Hesaplanan KDV (%20):</span>
                <span>₺{{ invoice()!.taxTotal | number:'1.2-2' }}</span>
              </div>
              <div class="sum-row" *ngIf="invoice()!.discountTotal > 0">
                <span>İskonto / İndirim:</span>
                <span class="text-danger">-₺{{ invoice()!.discountTotal | number:'1.2-2' }}</span>
              </div>
              <div class="sum-row grand-total-row">
                <span>GENEL TOPLAM:</span>
                <span class="grand-price">₺{{ invoice()!.grandTotal | number:'1.2-2' }}</span>
              </div>
              <div class="payment-badge-row">
                <span class="pay-status-pill" [ngClass]="getPaymentStatusClass(invoice()!.paymentStatus)">
                  <i class="fa-solid fa-shield-check"></i> {{ invoice()!.paymentStatus }} ({{ invoice()!.paymentMethod }})
                </span>
              </div>
            </div>

          </div>

          <!-- Resmi İmza / Kaşe Alanı -->
          <div class="inv-stamp-row">
            <div class="stamp-box">
              <span>Teslim Eden (Göktürk Tasarım)</span>
              <div class="stamp-seal"><i class="fa-solid fa-stamp"></i> GÖKTÜRK TASARIM E-IMZA</div>
            </div>
            <div class="stamp-box">
              <span>Teslim Alan (Müşteri)</span>
              <div class="stamp-sign-line">İmza / Kaşe</div>
            </div>
          </div>

        </div>

        <!-- ── 2. FATURA DÜZENLEME MODU (EDIT MODE) ── -->
        <div *ngIf="isEditing() && editForm" class="edit-invoice-form">
          <div class="edit-form-header">
            <h3><i class="fa-solid fa-pen-to-square text-cyan"></i> Fatura Bilgilerini Düzenle</h3>
            <p>Fatura numarası, müşteri bilgileri, ürün kalemleri veya tutarları ihtiyacınıza göre güncelleyin.</p>
          </div>

          <form (ngSubmit)="saveEdits()" class="edit-body">

            <!-- Fatura Başlık & Seri -->
            <div class="form-grid-3">
              <div class="form-group">
                <label>Fatura Seri / No</label>
                <input type="text" [(ngModel)]="editForm.invoiceNumber" name="invoiceNumber" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Düzenleme Tarihi</label>
                <input type="text" [(ngModel)]="editForm.issueDate" name="issueDate" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Ödeme Durumu</label>
                <select [(ngModel)]="editForm.paymentStatus" name="paymentStatus" class="form-control">
                  <option value="ÖDENDİ">ÖDENDİ</option>
                  <option value="ÖDEME BEKLİYOR">ÖDEME BEKLİYOR</option>
                  <option value="İPTAL">İPTAL</option>
                </select>
              </div>
            </div>

            <hr class="form-divider" />

            <!-- Müşteri Bilgileri -->
            <h4 class="sub-form-title"><i class="fa-solid fa-user-tie"></i> Müşteri &amp; Fatura Adresi Bilgileri</h4>
            <div class="form-grid-2">
              <div class="form-group">
                <label>Müşteri Adı / Unvanı</label>
                <input type="text" [(ngModel)]="editForm.buyerCompany" name="buyerCompany" class="form-control" placeholder="Firma Unvanı" />
              </div>
              <div class="form-group">
                <label>Yetkili Kişi</label>
                <input type="text" [(ngModel)]="editForm.buyerName" name="buyerName" class="form-control" placeholder="Ad Soyad" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>Vergi Dairesi</label>
                <input type="text" [(ngModel)]="editForm.buyerTaxDept" name="buyerTaxDept" class="form-control" />
              </div>
              <div class="form-group">
                <label>Vergi No / T.C. No</label>
                <input type="text" [(ngModel)]="editForm.buyerTaxNo" name="buyerTaxNo" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Fatura / Teslimat Adresi</label>
              <textarea [(ngModel)]="editForm.buyerAddress" name="buyerAddress" class="form-control" rows="2"></textarea>
            </div>

            <hr class="form-divider" />

            <!-- Ürün Kalemleri -->
            <div class="items-header-row">
              <h4 class="sub-form-title"><i class="fa-solid fa-list-check"></i> Fatura Kalemleri (Ürün / Hizmetler)</h4>
              <button type="button" class="btn-add-item" (click)="addItem()">
                <i class="fa-solid fa-plus"></i> Kalem Ekle
              </button>
            </div>

            <div class="edit-items-list">
              <div class="edit-item-row" *ngFor="let item of editForm.items; let idx = index">
                <div class="item-col name-col">
                  <label *ngIf="idx === 0">Ürün / Hizmet Açıklaması</label>
                  <input type="text" [(ngModel)]="item.productName" [name]="'item_name_' + idx" class="form-control" required (input)="recalculateLive()" />
                </div>
                <div class="item-col qty-col">
                  <label *ngIf="idx === 0">Miktar</label>
                  <input type="number" min="1" [(ngModel)]="item.quantity" [name]="'item_qty_' + idx" class="form-control" required (input)="recalculateLive()" />
                </div>
                <div class="item-col price-col">
                  <label *ngIf="idx === 0">Birim Fiyat (₺)</label>
                  <input type="number" step="0.01" min="0" [(ngModel)]="item.unitPrice" [name]="'item_price_' + idx" class="form-control" required (input)="recalculateLive()" />
                </div>
                <div class="item-col tax-col">
                  <label *ngIf="idx === 0">KDV %</label>
                  <select [(ngModel)]="item.taxRate" [name]="'item_tax_' + idx" class="form-control" (change)="recalculateLive()">
                    <option [value]="0">%0</option>
                    <option [value]="10">%10</option>
                    <option [value]="20">%20</option>
                  </select>
                </div>
                <div class="item-col del-col">
                  <label *ngIf="idx === 0">&nbsp;</label>
                  <button type="button" class="btn-del-item" (click)="removeItem(idx)" title="Kalemi Sil" [disabled]="editForm.items.length <= 1">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Canlı Hesaplama Özeti -->
            <div class="live-calc-box">
              <div class="calc-item">
                <span>Ara Toplam:</span>
                <strong>₺{{ editForm.subTotal | number:'1.2-2' }}</strong>
              </div>
              <div class="calc-item">
                <span>KDV Tutarı:</span>
                <strong>₺{{ editForm.taxTotal | number:'1.2-2' }}</strong>
              </div>
              <div class="calc-item grand">
                <span>Genel Toplam:</span>
                <strong class="text-cyan">₺{{ editForm.grandTotal | number:'1.2-2' }}</strong>
              </div>
            </div>

            <!-- Form Eylemleri -->
            <div class="edit-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelEdit()">İptal</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-floppy-disk"></i> Değişiklikleri Kaydet &amp; Faturayı Güncelle
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Modal Backdrop ── */
    .invoice-modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
      overflow-y: auto;
    }

    .invoice-modal-card {
      position: relative; width: 100%; max-width: 920px; max-height: 90vh;
      border-radius: var(--radius-lg); background: #0f172a;
      border: 1.5px solid var(--glass-border); box-shadow: 0 24px 48px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; overflow: hidden;
    }

    /* ── Modal Top Bar ── */
    .modal-top-bar {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 16px 24px; background: rgba(15,23,42,0.95); border-bottom: 1px solid var(--glass-border);
      flex-shrink: 0;
    }
    .top-title { display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 800; color: #fff; }
    .top-actions { display: flex; align-items: center; gap: 10px; }
    .top-btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--radius-sm);
      font-size: 0.82rem; font-weight: 700; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
    }
    .btn-edit { background: rgba(99,102,241,0.15); color: var(--primary); border-color: rgba(99,102,241,0.3); }
    .btn-edit:hover { background: rgba(99,102,241,0.25); }
    .btn-xml { background: rgba(168,85,247,0.15); color: #a855f7; border-color: rgba(168,85,247,0.3); }
    .btn-xml:hover { background: rgba(168,85,247,0.25); }
    .btn-view-xml { background: rgba(6,182,212,0.15); color: var(--cyan); border-color: rgba(6,182,212,0.3); }
    .btn-view-xml:hover { background: rgba(6,182,212,0.25); }
    .btn-print { background: linear-gradient(135deg, var(--secondary), var(--accent-emerald)); color: #fff; }
    .btn-print:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(6,182,212,0.35); }
    .btn-close { background: rgba(255,255,255,0.06); color: var(--text-muted); border-color: var(--glass-border); width: 34px; height: 34px; padding: 0; justify-content: center; border-radius: 50%; }
    .btn-close:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

    /* ── XML Preview Box ── */
    .xml-preview-box { padding: 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; color: var(--text-main); }
    .xml-box-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; background: rgba(0,0,0,0.2); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--glass-border); }
    .xml-box-header strong { font-size: 0.95rem; color: var(--cyan); }
    .xml-box-header p { font-size: 0.76rem; color: var(--text-muted); margin: 2px 0 0 0; }
    .xml-box-actions { display: flex; gap: 10px; }
    .xml-code-block {
      background: #090d16; border: 1px solid rgba(6,182,212,0.3); border-radius: var(--radius-md);
      padding: 16px; max-height: 480px; overflow: auto; font-family: monospace; font-size: 0.78rem;
      color: #38bdf8; line-height: 1.5; white-space: pre-wrap; word-break: break-all;
    }

    /* ── Printable Invoice Sheet (View Mode) ── */
    .printable-invoice-sheet {
      padding: 36px 40px; overflow-y: auto; background: #fff; color: #1e293b;
      display: flex; flex-direction: column; gap: 24px; font-family: system-ui, -apple-system, sans-serif;
    }

    .inv-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
    .inv-brand { display: flex; align-items: center; gap: 16px; }
    .brand-logo {
      width: 52px; height: 52px; border-radius: 12px;
      background: linear-gradient(135deg, #06b6d4, #10b981); color: #fff;
      display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
    }
    .inv-brand h2 { font-size: 1.25rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.01em; }
    .brand-sub { font-size: 0.78rem; color: #64748b; margin: 2px 0 0; }

    .inv-meta-box {
      display: flex; flex-direction: column; gap: 4px; padding: 12px 18px; border-radius: 8px;
      background: #f8fafc; border: 1px solid #e2e8f0; text-align: right; min-width: 220px;
    }
    .inv-type-badge { font-size: 0.72rem; font-weight: 900; letter-spacing: 0.1em; color: #0284c7; margin-bottom: 4px; }
    .meta-row { display: flex; justify-content: space-between; gap: 12px; font-size: 0.8rem; }
    .meta-row .lbl { color: #64748b; }
    .meta-row .val { color: #0f172a; font-weight: 600; }
    .font-mono { font-family: monospace; }

    .inv-divider { border: none; height: 1px; background: #e2e8f0; margin: 0; }

    .inv-parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .party-card { padding: 16px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px; }
    .party-title { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.05em; color: #475569; display: flex; align-items: center; gap: 6px; }
    .party-name { font-size: 0.95rem; font-weight: 800; color: #0f172a; }
    .party-info { display: flex; flex-direction: column; gap: 3px; font-size: 0.78rem; color: #475569; line-height: 1.4; }

    /* Table */
    .inv-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
    .inv-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left; }
    .inv-table th { background: #f1f5f9; color: #334155; font-weight: 700; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    .inv-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .inv-table tbody tr:last-child td { border-bottom: none; }

    /* Bottom Grid */
    .inv-bottom-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start; }
    .inv-notes-box { padding: 16px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem; }
    .notes-title { font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px; font-size: 0.82rem; }
    .bank-row { display: flex; flex-direction: column; gap: 2px; color: #334155; line-height: 1.4; }
    .notes-text { font-size: 0.76rem; color: #64748b; font-style: italic; background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .efatura-qr-box { display: flex; align-items: center; gap: 12px; margin-top: 4px; padding-top: 8px; border-top: 1px dashed #cbd5e1; }
    .qr-icon { font-size: 2.2rem; color: #0284c7; }
    .qr-info { display: flex; flex-direction: column; gap: 2px; }
    .qr-info strong { font-size: 0.78rem; color: #0f172a; }
    .qr-info small { font-size: 0.7rem; color: #64748b; }

    .inv-summary-box { padding: 16px; border-radius: 8px; background: #f8fafc; border: 1px solid #cbd5e1; display: flex; flex-direction: column; gap: 8px; }
    .sum-row { display: flex; justify-content: space-between; font-size: 0.84rem; color: #475569; }
    .grand-total-row { padding-top: 8px; border-top: 2px solid #0f172a; font-weight: 900; font-size: 1rem; color: #0f172a; }
    .grand-price { font-size: 1.2rem; color: #0284c7; }
    .payment-badge-row { margin-top: 4px; display: flex; justify-content: flex-end; }
    .pay-status-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 99px; background: #dcfce7; color: #166534; border: 1px solid #86efac; }

    .inv-stamp-row { display: flex; justify-content: space-between; padding-top: 16px; margin-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 0.8rem; color: #64748b; }
    .stamp-box { display: flex; flex-direction: column; gap: 14px; text-align: center; width: 200px; }
    .stamp-seal { font-size: 0.7rem; font-weight: 800; color: #0284c7; border: 2px dashed #0284c7; padding: 6px; border-radius: 6px; letter-spacing: 0.05em; }
    .stamp-sign-line { border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 0.74rem; }

    /* ── Edit Form Mode ── */
    .edit-invoice-form { padding: 28px; overflow-y: auto; color: var(--text-main); display: flex; flex-direction: column; gap: 20px; }
    .edit-form-header h3 { font-size: 1.1rem; font-weight: 800; margin: 0 0 4px; }
    .edit-form-header p { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .form-divider { border: none; height: 1px; background: var(--glass-border); margin: 8px 0; }
    .sub-form-title { font-size: 0.9rem; font-weight: 800; color: var(--secondary); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }

    .items-header-row { display: flex; align-items: center; justify-content: space-between; }
    .btn-add-item {
      padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700;
      background: rgba(6,182,212,0.15); color: var(--secondary); border: 1px solid rgba(6,182,212,0.3);
      cursor: pointer; transition: all 0.2s;
    }
    .btn-add-item:hover { background: rgba(6,182,212,0.25); }

    .edit-items-list { display: flex; flex-direction: column; gap: 10px; }
    .edit-item-row { display: flex; gap: 10px; align-items: flex-end; }
    .name-col { flex: 1; }
    .qty-col { width: 90px; }
    .price-col { width: 140px; }
    .tax-col { width: 90px; }
    .del-col { width: 40px; }

    .btn-del-item {
      width: 38px; height: 38px; border-radius: var(--radius-sm);
      background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.25);
      cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-del-item:hover:not(:disabled) { background: rgba(239,68,68,0.25); }
    .btn-del-item:disabled { opacity: 0.3; cursor: not-allowed; }

    .live-calc-box {
      display: flex; align-items: center; justify-content: space-around; gap: 16px;
      padding: 16px; border-radius: var(--radius-md); background: rgba(0,0,0,0.25);
      border: 1px solid var(--glass-border); margin-top: 10px;
    }
    .calc-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.82rem; color: var(--text-muted); }
    .calc-item strong { font-size: 1rem; color: var(--text-main); }
    .calc-item.grand strong { font-size: 1.3rem; }

    .edit-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }

    /* ── Print Media Styles ── */
    @media print {
      body * { visibility: hidden; }
      #printableInvoice, #printableInvoice * { visibility: visible; }
      #printableInvoice {
        position: fixed; left: 0; top: 0; width: 100%; height: auto;
        padding: 0; background: #fff !important; color: #000 !important;
      }
      .no-print { display: none !important; }
      .invoice-modal-backdrop { background: none !important; backdrop-filter: none !important; position: static !important; }
      .invoice-modal-card { box-shadow: none !important; border: none !important; background: #fff !important; max-width: 100% !important; max-height: none !important; overflow: visible !important; }
    }
  `]
})
export class InvoiceModalComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  @Input() orderCode!: string;
  @Input() orderTitle?: string;
  @Input() orderDate?: string;
  @Input() allowEdit: boolean = false; // Sadece Yönetici (Admin) düzenleyebilir!

  @Output() closed = new EventEmitter<void>();

  invoice = signal<Invoice | null>(null);
  isEditing = signal<boolean>(false);
  showXmlView = signal<boolean>(false);
  xmlCopied = signal<boolean>(false);
  editForm!: Invoice;

  ngOnInit() {
    if (this.orderCode) {
      let inv = this.invoiceService.getInvoiceForOrder(this.orderCode, this.orderTitle, this.orderDate);
      if (!inv && this.allowEdit) {
        inv = this.invoiceService.createInvoiceByAdmin(this.orderCode, this.orderTitle, this.orderDate);
      }
      this.invoice.set(inv);
    }
  }

  enableEditMode() {
    if (!this.allowEdit) return;
    if (this.invoice()) {
      // Deep copy invoice for editForm
      this.editForm = JSON.parse(JSON.stringify(this.invoice()!));
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  addItem() {
    this.editForm.items.push({
      id: `item-${Date.now()}`,
      productName: 'Yeni Ürün / Hizmet',
      quantity: 1,
      unitPrice: 500,
      taxRate: 20,
      totalPrice: 500
    });
    this.recalculateLive();
  }

  removeItem(idx: number) {
    if (this.editForm.items.length > 1) {
      this.editForm.items.splice(idx, 1);
      this.recalculateLive();
    }
  }

  recalculateLive() {
    this.editForm = this.invoiceService.recalculateTotals(this.editForm);
  }

  saveEdits() {
    const saved = this.invoiceService.saveInvoice(this.editForm);
    this.invoice.set(saved);
    this.isEditing.set(false);
  }

  printInvoice() {
    window.print();
  }

  downloadXml() {
    if (this.invoice()) {
      this.invoiceService.downloadXmlFile(this.invoice()!);
    }
  }

  toggleXmlView() {
    this.showXmlView.update(val => !val);
  }

  getXmlContent(): string {
    if (!this.invoice()) return '';
    return this.invoiceService.generateUblXml(this.invoice()!);
  }

  copyXmlText() {
    const xml = this.getXmlContent();
    if (!xml) return;
    navigator.clipboard.writeText(xml).then(() => {
      this.xmlCopied.set(true);
      setTimeout(() => this.xmlCopied.set(false), 2500);
    }).catch(() => {
      this.xmlCopied.set(true);
      setTimeout(() => this.xmlCopied.set(false), 2500);
    });
  }

  close() {
    this.closed.emit();
  }

  getPaymentStatusClass(status: string): string {
    if (status === 'ÖDENDİ') return 'pay-approved';
    if (status === 'ÖDEME BEKLİYOR') return 'pay-pending';
    return 'pay-cancelled';
  }
}
