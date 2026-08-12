import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductGroupService } from '../../../core/services/product-group.service';
import { AdminProductGroupDto, ProductDto, CreateProductGroupDto } from '../../../core/models/product-group.model';

@Component({
  selector: 'app-product-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="group-mgmt-container">

      <!-- Header Bar -->
      <div class="mgmt-header glass-card">
        <div class="header-left">
          <div class="icon-box"><i class="fa-solid fa-layer-group"></i></div>
          <div>
            <h2>Ürün Grupları Yönetimi</h2>
            <p class="sub-text">Ana sayfada ve sol menüde gösterilecek dinamik ürün gruplarını oluşturun ve yönetin</p>
          </div>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="fa-solid fa-plus"></i> Yeni Ürün Grubu Oluştur
        </button>
      </div>

      <!-- Groups List Table -->
      <div class="glass-card groups-table-card">
        <div *ngIf="loading()" class="skel-loader">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Gruplar yükleniyor...
        </div>

        <div *ngIf="!loading() && groups().length === 0" class="empty-box">
          <i class="fa-solid fa-folder-open empty-ico"></i>
          <h3>Henüz Ürün Grubu Oluşturulmadı</h3>
          <p>Müşterilerinize öne çıkan ürünleri Amazon tarzı kutucuklarla sunmak için yeni grup ekleyin.</p>
          <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
            <i class="fa-solid fa-plus"></i> Grup Oluştur
          </button>
        </div>

        <div class="table-responsive" *ngIf="!loading() && groups().length > 0">
          <table class="mgmt-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>İkon & Grup Adı</th>
                <th>URL Bağlantısı (Slug)</th>
                <th>Ekli Ürün Sayısı</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let g of groups()" [class.inactive-row]="!g.isActive">
                <td class="order-td">
                  <span class="order-badge">#{{ g.displayOrder }}</span>
                </td>
                <td>
                  <div class="group-name-cell">
                    <div class="g-icon"><i [class]="g.icon"></i></div>
                    <div>
                      <strong class="g-title">{{ g.name }}</strong>
                      <span class="g-desc" *ngIf="g.description">{{ g.description }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <a [routerLink]="['/group', g.slug]" target="_blank" class="slug-link" title="Sayfayı Önizle">
                    /group/{{ g.slug }} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                </td>
                <td>
                  <span class="prod-count-pill">
                    <i class="fa-solid fa-boxes-stacked"></i> {{ g.productCount }} Ürün
                  </span>
                </td>
                <td>
                  <span class="status-pill" [class.active-pill]="g.isActive" [class.inactive-pill]="!g.isActive">
                    <span class="dot"></span> {{ g.isActive ? 'Aktif (Yayında)' : 'Pasif' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <a [routerLink]="['/group', g.slug]" target="_blank" class="act-btn act-view" title="Sayfayı Göster">
                      <i class="fa-solid fa-eye"></i>
                    </a>
                    <button class="act-btn act-edit" (click)="openEditModal(g)" title="Düzenle">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="act-btn act-delete" (click)="deleteGroup(g)" title="Sil">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-card glass-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="m-title-wrap">
              <i class="fa-solid fa-pen-to-square m-ico"></i>
              <h3>{{ editingId() ? 'Ürün Grubunu Düzenle' : 'Yeni Ürün Grubu Oluştur' }}</h3>
            </div>
            <button class="close-x" (click)="closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body">
            <div class="form-grid">

              <!-- Group Name -->
              <div class="form-group span-2">
                <label>Grup Adı <span class="req">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Örn: Öne Çıkan Matbaa Çözümleri"
                  [(ngModel)]="formData.name"
                  (ngModelChange)="onNameChange()"
                />
              </div>

              <!-- Slug -->
              <div class="form-group">
                <label>URL Bağlantısı (Slug)</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="one-cikan-matbaa"
                  [(ngModel)]="formData.slug"
                />
              </div>

              <!-- Icon Selector -->
              <div class="form-group">
                <label>Simge (FontAwesome İkon)</label>
                <div class="icon-input-wrap">
                  <div class="icon-preview"><i [class]="formData.icon || 'fa-solid fa-layer-group'"></i></div>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="fa-solid fa-fire"
                    [(ngModel)]="formData.icon"
                  />
                </div>
              </div>

              <!-- Display Order -->
              <div class="form-group">
                <label>Görüntüleme Sırası</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.displayOrder"
                  min="1"
                />
              </div>

              <!-- Active Switch -->
              <div class="form-group align-center">
                <label>Grup Durumu</label>
                <label class="switch-lbl">
                  <input type="checkbox" [(ngModel)]="formData.isActive" />
                  <span class="slider"></span>
                  <span class="switch-txt">{{ formData.isActive ? 'Aktif (Sitede Görünsün)' : 'Pasif (Gizli)' }}</span>
                </label>
              </div>

              <!-- Description -->
              <div class="form-group span-2">
                <label>Açıklama / Alt Başlık</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Örn: En çok tercih edilen matbaa ve baskı çözümleri"
                  [(ngModel)]="formData.description"
                />
              </div>

              <!-- Product Selection Section -->
              <div class="form-group span-2 product-picker-section">
                <div class="picker-header">
                  <label><i class="fa-solid fa-boxes-stacked"></i> Gruba Dâhil Edilecek Ürünler ({{ selectedProductIds.length }} Seçildi)</label>
                  <div class="p-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Ürün ara..." [(ngModel)]="productSearch" />
                  </div>
                </div>

                <div class="products-list-box">
                  <div
                    *ngFor="let p of filteredProducts()"
                    class="prod-item"
                    [class.selected]="isProductSelected(p.id)"
                    (click)="toggleProductSelection(p.id)"
                  >
                    <div class="check-box">
                      <i class="fa-solid fa-check" *ngIf="isProductSelected(p.id)"></i>
                    </div>
                    <div class="prod-info">
                      <strong>{{ p.name }}</strong>
                      <span class="p-code">{{ p.productCode }} &bull; {{ p.category }} &bull; ₺{{ p.basePrice }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">İptal</button>
            <button class="btn btn-primary" (click)="saveGroup()" [disabled]="saving() || !formData.name">
              <i class="fa-solid fa-floppy-disk"></i> {{ saving() ? 'Kaydediliyor...' : 'Grubu Kaydet' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .group-mgmt-container { display: flex; flex-direction: column; gap: 20px; }
    
    .mgmt-header {
      padding: 24px 28px;
      display: flex; align-items: center; justify-content: space-between; gap: 20px;
      flex-wrap: wrap;
    }
    .header-left { display: flex; align-items: center; gap: 18px; }
    .icon-box {
      width: 52px; height: 52px; border-radius: var(--radius-lg);
      background: rgba(168,85,247,0.18); color: var(--accent-purple);
      display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
    }
    .header-left h2 { font-size: 1.4rem; font-weight: 800; margin: 0 0 2px 0; }
    .sub-text { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

    .groups-table-card { padding: 0; overflow: hidden; }
    .skel-loader { padding: 40px; text-align: center; color: var(--primary); }
    
    .empty-box {
      padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .empty-ico { font-size: 3rem; color: var(--text-dim); }

    .table-responsive { overflow-x: auto; }
    .mgmt-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
    .mgmt-table th {
      padding: 14px 18px; text-align: left; background: rgba(0,0,0,0.12);
      font-size: 0.74rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;
    }
    .mgmt-table td { padding: 16px 18px; border-bottom: 1px solid var(--glass-border); vertical-align: middle; }
    .mgmt-table tr:last-child td { border-bottom: none; }
    .inactive-row { opacity: 0.55; }

    .order-badge {
      font-weight: 800; color: var(--primary); background: rgba(99,102,241,0.15);
      padding: 4px 8px; border-radius: 6px; font-size: 0.8rem;
    }

    .group-name-cell { display: flex; align-items: center; gap: 12px; }
    .g-icon {
      width: 38px; height: 38px; border-radius: var(--radius-md);
      background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: var(--secondary);
    }
    .g-title { font-size: 0.92rem; display: block; }
    .g-desc { font-size: 0.75rem; color: var(--text-muted); display: block; }

    .slug-link {
      color: var(--secondary); text-decoration: none; font-family: monospace; font-size: 0.82rem;
      transition: color 0.2s;
    }
    .slug-link:hover { text-decoration: underline; color: var(--primary); }

    .prod-count-pill {
      font-size: 0.75rem; font-weight: 700; color: var(--accent-purple);
      background: rgba(168,85,247,0.12); padding: 4px 10px; border-radius: 99px;
    }

    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 99px;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; }
    .active-pill { background: rgba(16,185,129,0.15); color: var(--accent-emerald); }
    .active-pill .dot { background: var(--accent-emerald); }
    .inactive-pill { background: rgba(255,255,255,0.08); color: var(--text-dim); }
    .inactive-pill .dot { background: var(--text-dim); }

    .action-btns { display: flex; gap: 6px; }
    .act-btn {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      border: 1px solid var(--glass-border); background: var(--bg-card);
      color: var(--text-muted); display: flex; align-items: center; justify-content: center;
      cursor: pointer; text-decoration: none; font-size: 0.82rem; transition: all 0.2s;
    }
    .act-view:hover { color: var(--secondary); border-color: var(--secondary); }
    .act-edit:hover { color: var(--primary); border-color: var(--primary); }
    .act-delete:hover { color: var(--status-danger); border-color: var(--status-danger); }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,0.65); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-card {
      width: 100%; max-width: 720px; max-height: 90vh; display: flex; flex-direction: column;
      border-radius: var(--radius-xl); overflow: hidden; animation: zoomIn 0.2s ease;
    }
    @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .modal-header {
      padding: 20px 24px; border-bottom: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(168,85,247,0.06);
    }
    .m-title-wrap { display: flex; align-items: center; gap: 12px; }
    .m-ico { font-size: 1.2rem; color: var(--accent-purple); }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; }
    .close-x { background: none; border: none; color: var(--text-dim); font-size: 1.2rem; cursor: pointer; }

    .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .span-2 { grid-column: span 2; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
    .req { color: var(--status-danger); }

    .form-control {
      padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: var(--radius-md); color: var(--text-main); font-size: 0.86rem; outline: none;
    }
    .form-control:focus { border-color: var(--primary); }

    .icon-input-wrap { display: flex; align-items: center; gap: 10px; }
    .icon-preview {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      background: rgba(99,102,241,0.15); color: var(--primary);
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;
    }

    /* Switch */
    .switch-lbl { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 6px; }
    .switch-lbl input { display: none; }
    .slider {
      width: 42px; height: 22px; background: rgba(255,255,255,0.15); border-radius: 99px;
      position: relative; transition: background 0.2s;
    }
    .slider::after {
      content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
      background: #fff; border-radius: 50%; transition: transform 0.2s;
    }
    .switch-lbl input:checked + .slider { background: var(--accent-emerald); }
    .switch-lbl input:checked + .slider::after { transform: translateX(20px); }
    .switch-txt { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }

    /* Product Picker */
    .product-picker-section {
      margin-top: 8px; border: 1px solid var(--glass-border); border-radius: var(--radius-lg);
      padding: 16px; background: rgba(0,0,0,0.1);
    }
    .picker-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; }
    .p-search { position: relative; display: flex; align-items: center; }
    .p-search i { position: absolute; left: 10px; font-size: 0.75rem; color: var(--text-dim); }
    .p-search input {
      padding: 6px 10px 6px 30px; font-size: 0.78rem; background: var(--bg-card);
      border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-main); outline: none;
    }

    .products-list-box {
      max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;
      padding-right: 4px;
    }
    .prod-item {
      display: flex; align-items: center; gap: 12px; padding: 8px 12px;
      background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md);
      cursor: pointer; transition: all 0.15s;
    }
    .prod-item:hover { border-color: var(--primary); }
    .prod-item.selected { background: rgba(99,102,241,0.12); border-color: var(--primary); }

    .check-box {
      width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.7rem; flex-shrink: 0;
    }
    .prod-item.selected .check-box { background: var(--primary); border-color: var(--primary); }

    .prod-info { display: flex; flex-direction: column; gap: 2px; }
    .prod-info strong { font-size: 0.82rem; }
    .p-code { font-size: 0.72rem; color: var(--text-muted); }

    .modal-footer {
      padding: 16px 24px; border-top: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: flex-end; gap: 12px;
    }
  `]
})
export class ProductGroupManagementComponent implements OnInit {
  private groupService = inject(ProductGroupService);

  public groups = signal<AdminProductGroupDto[]>([]);
  public allProducts = signal<ProductDto[]>([]);
  public loading = signal<boolean>(true);
  public showModal = signal<boolean>(false);
  public editingId = signal<string | null>(null);
  public saving = signal<boolean>(false);

  public selectedProductIds: string[] = [];
  public productSearch = '';

  public formData = {
    name: '',
    slug: '',
    description: '',
    icon: 'fa-solid fa-fire',
    displayOrder: 1,
    isActive: true
  };

  ngOnInit() {
    this.loadData();
  }

  public loadData() {
    this.loading.set(true);
    this.groupService.getAdminGroups().subscribe({
      next: (res) => {
        this.groups.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.groupService.getAllProducts().subscribe({
      next: (prods) => this.allProducts.set(prods)
    });
  }

  public openCreateModal() {
    this.editingId.set(null);
    this.formData = {
      name: '',
      slug: '',
      description: '',
      icon: 'fa-solid fa-fire',
      displayOrder: this.groups().length + 1,
      isActive: true
    };
    this.selectedProductIds = [];
    this.showModal.set(true);
  }

  public openEditModal(g: AdminProductGroupDto) {
    this.editingId.set(g.id);
    this.formData = {
      name: g.name,
      slug: g.slug,
      description: g.description || '',
      icon: g.icon || 'fa-solid fa-fire',
      displayOrder: g.displayOrder,
      isActive: g.isActive
    };
    this.selectedProductIds = [...(g.productIds || [])];
    this.showModal.set(true);
  }

  public closeModal() {
    this.showModal.set(false);
  }

  public onNameChange() {
    if (!this.editingId()) {
      this.formData.slug = this.slugify(this.formData.name);
    }
  }

  public isProductSelected(id: string): boolean {
    return this.selectedProductIds.includes(id);
  }

  public toggleProductSelection(id: string) {
    if (this.isProductSelected(id)) {
      this.selectedProductIds = this.selectedProductIds.filter(x => x !== id);
    } else {
      this.selectedProductIds.push(id);
    }
  }

  public filteredProducts(): ProductDto[] {
    if (!this.productSearch) return this.allProducts();
    const s = this.productSearch.toLowerCase();
    return this.allProducts().filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.productCode.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  }

  public saveGroup() {
    if (!this.formData.name) return;
    this.saving.set(true);

    const payload = {
      name: this.formData.name,
      slug: this.formData.slug,
      description: this.formData.description,
      icon: this.formData.icon,
      displayOrder: this.formData.displayOrder,
      isActive: this.formData.isActive,
      productIds: this.selectedProductIds
    };

    if (this.editingId()) {
      this.groupService.updateGroup(this.editingId()!, { id: this.editingId()!, ...payload }).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadData();
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.groupService.createGroup(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadData();
        },
        error: () => this.saving.set(false)
      });
    }
  }

  public deleteGroup(g: AdminProductGroupDto) {
    if (confirm(`"${g.name}" ürün grubunu silmek istediğinizden emin misiniz?`)) {
      this.groupService.deleteGroup(g.id).subscribe({
        next: () => this.loadData()
      });
    }
  }

  private slugify(text: string): string {
    return text.toLowerCase().trim()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
}
