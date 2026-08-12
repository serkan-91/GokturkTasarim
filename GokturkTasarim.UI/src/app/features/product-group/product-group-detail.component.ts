import { Component, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductGroupService } from '../../core/services/product-group.service';
import { ProductGroupDetailDto, ProductDto } from '../../core/models/product-group.model';

@Component({
  selector: 'app-product-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="group-detail-page">

      <!-- Breadcrumbs -->
      <nav class="breadcrumb-nav">
        <a routerLink="/" class="b-item"><i class="fa-solid fa-house"></i> Ana Sayfa</a>
        <i class="fa-solid fa-chevron-right b-sep"></i>
        <span class="b-item">Ürün Grupları</span>
        <i class="fa-solid fa-chevron-right b-sep"></i>
        <span class="b-item active" *ngIf="groupDetail()">{{ groupDetail()?.name }}</span>
      </nav>

      <!-- Skeleton Header -->
      <div *ngIf="loading() && !groupDetail()" class="group-hero-skeleton glass-card">
        <div class="sk-line sk-title"></div>
        <div class="sk-line sk-sub"></div>
      </div>

      <!-- Group Hero Banner -->
      <div *ngIf="groupDetail()" class="group-hero glass-card">
        <div class="hero-content">
          <div class="group-icon-wrap">
            <i [class]="groupDetail()?.icon || 'fa-solid fa-layer-group'"></i>
          </div>
          <div class="hero-text">
            <div class="hero-badge">
              <i class="fa-solid fa-boxes-stacked"></i> ÖZEL KOLEKSİYON
            </div>
            <h1>{{ groupDetail()?.name }}</h1>
            <p *ngIf="groupDetail()?.description" class="group-desc">{{ groupDetail()?.description }}</p>
            <div class="hero-meta">
              <span class="meta-item"><i class="fa-solid fa-tag"></i> Toplam {{ totalCount() }} Ürün</span>
              <span class="meta-item"><i class="fa-solid fa-bolt"></i> 24'lü Hızlı Yükleme (Infinite Scroll)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Catalog Controls Toolbar -->
      <div class="catalog-toolbar glass-card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Gruba ait ürün adı veya kodunda ara..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery = ''; onSearchChange()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="toolbar-info">
          <span>Gösterilen: <strong>{{ products().length }}</strong> / {{ totalCount() }} Ürün</span>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && products().length === 0" class="empty-state glass-card">
        <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
        <h3>Ürün Bulunamadı</h3>
        <p>Bu ürün grubunda henüz listelenen bir ürün bulunmuyor veya arama kriterinize uyan sonuç çıkmadı.</p>
        <button *ngIf="searchQuery" class="btn btn-secondary btn-sm" (click)="searchQuery = ''; onSearchChange()">
          <i class="fa-solid fa-rotate-left"></i> Aramayı Temizle
        </button>
      </div>

      <!-- Product Catalog Grid (Katalog Görünümü) -->
      <div class="products-grid" *ngIf="products().length > 0">
        <div class="product-card glass-card" *ngFor="let p of products(); let i = index">
          
          <!-- Image Container -->
          <div class="card-img-wrap">
            <img [src]="p.imageUrl || '/banner.png'" [alt]="p.name" class="product-img" (error)="onImgError($event)" />
            <span class="stock-badge" [class.in-stock]="p.inStock" [class.out-of-stock]="!p.inStock">
              <i class="fa-solid" [ngClass]="p.inStock ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
              {{ p.inStock ? 'Stokta Var' : 'Tükendi' }}
            </span>
            <span class="code-badge">{{ p.productCode }}</span>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <span class="cat-tag">{{ p.category }}</span>
            <h3 class="product-name" [title]="p.name">{{ p.name }}</h3>
            <p class="product-desc" [title]="p.description">{{ p.description }}</p>

            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-lbl">Başlangıç Fiyatı</span>
                <div class="price-val">
                  <span class="currency">₺</span>{{ p.basePrice | number:'1.0-2' }}
                  <span class="unit">/ {{ p.unit }}</span>
                </div>
              </div>

              <a routerLink="/projects" class="order-btn" title="Detaylı İncele / Sipariş Ver">
                <i class="fa-solid fa-cart-plus"></i> Sipariş Ver
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- Infinite Scroll Loading Indicator & Load More Button -->
      <div class="scroll-loader-wrap" *ngIf="loadingMore()">
        <div class="loader-spinner">
          <i class="fa-solid fa-circle-notch fa-spin"></i>
        </div>
        <span>Sonraki 24 ürün yükleniyor...</span>
      </div>

      <div class="load-more-btn-wrap" *ngIf="hasNextPage() && !loadingMore() && !loading()">
        <button class="btn btn-outline-cyan btn-lg" (click)="loadNextBatch()">
          <i class="fa-solid fa-arrow-down"></i> Daha Fazla Ürün Göster (+24 Ürün)
        </button>
      </div>

      <!-- End of Catalog Message -->
      <div class="end-catalog-msg" *ngIf="!hasNextPage() && products().length > 0 && !loadingMore() && !loading()">
        <i class="fa-solid fa-circle-check text-emerald"></i>
        <span>Gruba ait tüm ürünler (toplam {{ totalCount() }} ürün) görüntülendi.</span>
      </div>

    </div>
  `,
  styles: [`
    .group-detail-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-bottom: 40px;
    }

    /* Breadcrumb */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: var(--text-dim);
    }
    .b-item {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
    }
    .b-item:hover { color: var(--primary); }
    .b-item.active { color: var(--text-main); font-weight: 600; }
    .b-sep { font-size: 0.65rem; opacity: 0.5; }

    /* Group Hero Banner */
    .group-hero {
      padding: 32px 36px;
      background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(6,182,212,0.06) 100%) !important;
      border: 1px solid rgba(99,102,241,0.25) !important;
      position: relative;
      overflow: hidden;
    }
    .hero-content {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .group-icon-wrap {
      width: 72px; height: 72px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--primary), var(--accent-purple));
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      box-shadow: 0 10px 28px var(--primary-glow);
      flex-shrink: 0;
    }
    .hero-text {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em;
      color: var(--secondary); text-transform: uppercase;
    }
    .hero-text h1 {
      font-size: 1.8rem;
      font-weight: 900;
      margin: 0;
      color: var(--text-main);
    }
    .group-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }
    .hero-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 6px;
    }
    .meta-item {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent-purple);
      background: rgba(168,85,247,0.1);
      padding: 4px 12px;
      border-radius: 99px;
      border: 1px solid rgba(168,85,247,0.2);
    }

    /* Skeleton */
    .group-hero-skeleton { padding: 32px; display: flex; flex-direction: column; gap: 12px; }
    .sk-line { background: rgba(255,255,255,0.06); border-radius: 6px; }
    .sk-title { width: 40%; height: 28px; }
    .sk-sub { width: 70%; height: 16px; }

    /* Catalog Toolbar */
    .catalog-toolbar {
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 480px;
    }
    .search-icon {
      position: absolute; left: 14px; color: var(--text-dim); font-size: 0.9rem;
    }
    .search-input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.86rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--primary); }
    .clear-btn {
      position: absolute; right: 12px; background: none; border: none;
      color: var(--text-dim); cursor: pointer; font-size: 0.9rem;
    }
    .toolbar-info { font-size: 0.82rem; color: var(--text-muted); }

    /* Empty State */
    .empty-state {
      padding: 60px 30px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-icon {
      font-size: 3rem; color: var(--text-dim); opacity: 0.6;
    }

    /* Products Catalog Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    /* Product Card */
    .product-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      border: 1px solid var(--glass-border);
      position: relative;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 36px rgba(0,0,0,0.3);
      border-color: rgba(99,102,241,0.4);
    }

    .card-img-wrap {
      position: relative;
      width: 100%;
      height: 180px;
      background: var(--bg-secondary);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }
    .product-card:hover .product-img {
      transform: scale(1.06);
    }

    .stock-badge {
      position: absolute; top: 10px; left: 10px;
      font-size: 0.68rem; font-weight: 800; padding: 4px 10px; border-radius: 99px;
      backdrop-filter: blur(8px); display: flex; align-items: center; gap: 4px;
    }
    .stock-badge.in-stock { background: rgba(16,185,129,0.85); color: #fff; }
    .stock-badge.out-of-stock { background: rgba(239,68,68,0.85); color: #fff; }

    .code-badge {
      position: absolute; bottom: 10px; right: 10px;
      font-family: monospace; font-size: 0.7rem; font-weight: 700;
      background: rgba(0,0,0,0.65); color: #a78bfa; padding: 3px 8px; border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .card-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .cat-tag {
      font-size: 0.7rem; font-weight: 700; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.05em;
    }
    .product-name {
      font-size: 0.96rem; font-weight: 800; margin: 0;
      color: var(--text-main); line-height: 1.3;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .product-desc {
      font-size: 0.78rem; color: var(--text-muted); margin: 0;
      line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      height: 2.8em;
    }

    .card-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10px;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid var(--glass-border);
    }

    .price-wrap { display: flex; flex-direction: column; gap: 1px; }
    .price-lbl { font-size: 0.65rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase; }
    .price-val { font-size: 1.15rem; font-weight: 900; color: var(--primary); font-family: var(--font-heading); }
    .price-val .currency { font-size: 0.85rem; font-weight: 700; margin-right: 1px; }
    .price-val .unit { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; font-family: var(--font-main); }

    .order-btn {
      padding: 8px 14px;
      font-size: 0.78rem; font-weight: 700;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), var(--accent-purple));
      color: #fff; text-decoration: none;
      display: inline-flex; align-items: center; gap: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .order-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--primary-glow);
    }

    /* Scroll Loader & End Catalog Indicator */
    .scroll-loader-wrap {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 24px; color: var(--primary); font-size: 0.9rem; font-weight: 700;
    }
    .loader-spinner { font-size: 1.4rem; }

    .end-catalog-msg {
      padding: 20px; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-size: 0.85rem; color: var(--text-muted);
      border-top: 1px dashed var(--glass-border);
    }
  `]
})
export class ProductGroupDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private groupService = inject(ProductGroupService);
  private routeSub?: Subscription;

  public groupDetail = signal<ProductGroupDetailDto | null>(null);
  public products = signal<ProductDto[]>([]);
  public totalCount = signal<number>(0);
  public hasNextPage = signal<boolean>(false);
  public currentPage = signal<number>(1);
  public loading = signal<boolean>(true);
  public loadingMore = signal<boolean>(false);

  public searchQuery = '';
  private currentSlug = '';
  private isFetching = false;

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.currentSlug = slug;
        this.resetAndLoadGroup(slug);
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private resetAndLoadGroup(slug: string) {
    this.currentPage.set(1);
    this.products.set([]);
    this.loading.set(true);
    this.fetchBatch(slug, 1, false);
  }

  public onSearchChange() {
    this.currentPage.set(1);
    this.products.set([]);
    this.loading.set(true);
    this.fetchBatch(this.currentSlug, 1, false);
  }

  private fetchBatch(slug: string, page: number, append: boolean) {
    if (this.isFetching) return;
    this.isFetching = true;

    if (append) {
      this.loadingMore.set(true);
    }

    this.groupService.getGroupDetail(slug, this.searchQuery, page, 24).subscribe({
      next: (res) => {
        this.groupDetail.set(res);
        this.totalCount.set(res.products.totalCount);
        this.hasNextPage.set(res.products.hasNextPage);
        this.currentPage.set(res.products.page);

        if (append) {
          this.products.update(existing => [...existing, ...res.products.items]);
        } else {
          this.products.set(res.products.items);
        }

        this.loading.set(false);
        this.loadingMore.set(false);
        this.isFetching = false;
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
        this.isFetching = false;
      }
    });
  }

  public loadNextBatch() {
    if (this.hasNextPage() && !this.loadingMore() && !this.isFetching) {
      const nextPage = this.currentPage() + 1;
      this.fetchBatch(this.currentSlug, nextPage, true);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.loading() || this.loadingMore() || !this.hasNextPage() || this.isFetching) {
      return;
    }

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight - 350; // trigger 350px before bottom

    if (pos >= max) {
      this.loadNextBatch();
    }
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="14">Göktürk Baskı</text></svg>';
  }
}
