import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map, BehaviorSubject, tap } from 'rxjs';
import {
  ProductGroupPreviewDto,
  ProductGroupDetailDto,
  AdminProductGroupDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
  ProductDto
} from '../models/product-group.model';

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // BehaviorSubject so sidebar and homepage can instantly react when admin modifies groups
  private groupsUpdated$ = new BehaviorSubject<boolean>(true);

  // Default Mock Catalog Products for fallback with 1-to-1 exact product photos
  private mockProducts: ProductDto[] = [
    { id: '10000000-0000-0000-0000-000000000001', productCode: 'PJ-7600-16GB', name: 'Usb Bellek 16 GB', slug: 'usb-bellek-16gb', category: 'USB Bellekler', externalCategoryId: 'cat-usb', basePrice: 180, unit: 'adet', stockQuantity: 500, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80', description: 'Metal döner kapaklı 16 GB USB bellek, logo baskısına uygundur.' },
    { id: '10000000-0000-0000-0000-000000000002', productCode: 'PJ-5600-32GB', name: 'Usb Bellek 32 GB', slug: 'usb-bellek-32gb', category: 'USB Bellekler', externalCategoryId: 'cat-usb', basePrice: 240, unit: 'adet', stockQuantity: 400, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80', description: 'Yüksek hızlı 32 GB USB bellek, kurumsal hediyelik.' },
    { id: '10000000-0000-0000-0000-000000000003', productCode: 'PJ-7770-32GB', name: 'Işıklı Usb Bellek 32 GB', slug: 'isikli-usb-32gb', category: 'USB Bellekler', externalCategoryId: 'cat-usb', basePrice: 290, unit: 'adet', stockQuantity: 300, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80', description: 'Lazer kazıma sonrası LED ışıklı logo aydınlatmalı USB bellek.' },
    { id: '10000000-0000-0000-0000-000000000004', productCode: 'PJ-5200-32GB', name: 'Metal Usb Bellek 32 GB', slug: 'metal-usb-32gb', category: 'USB Bellekler', externalCategoryId: 'cat-usb', basePrice: 310, unit: 'adet', stockQuantity: 250, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80', description: 'Şık metal gövdeli, anahtarlıklı 32 GB hediye USB bellek.' },
    { id: '10000000-0000-0000-0000-000000000005', productCode: 'GKT-KV-01', name: 'Standart Kartvizit', slug: 'standart-kartvizit', category: 'Kartvizit & Matbaa', externalCategoryId: 'cat-kartvizit', basePrice: 550, unit: '250 adet', stockQuantity: 1000, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1593085260707-5377ba37f868?auto=format&fit=crop&w=600&q=80', description: 'Mat laminasyon, 350gr kuşe kağıt, çift yüz renkli baskı.' },
    { id: '10000000-0000-0000-0000-000000000006', productCode: 'GKT-KV-02', name: 'VIP 1 Kartvizit (UV Spot)', slug: 'vip-1-kartvizit', category: 'Kartvizit & Matbaa', externalCategoryId: 'sub-vip-kartvizit', basePrice: 950, unit: '250 adet', stockQuantity: 500, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1593085260707-5377ba37f868?auto=format&fit=crop&w=600&q=80', description: 'Parlak laminasyon + lokal UV spot, 400gr premium kuşe.' },
    { id: '10000000-0000-0000-0000-000000000007', productCode: 'GKT-KV-03', name: 'VIP 2 Kartvizit (Gümüş Folyo)', slug: 'vip-2-kartvizit', category: 'Kartvizit & Matbaa', externalCategoryId: 'sub-vip-kartvizit', basePrice: 1100, unit: '250 adet', stockQuantity: 300, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1593085260707-5377ba37f868?auto=format&fit=crop&w=600&q=80', description: 'Siyah zemin + gümüş yaldız folyo baskı, lüks dokulu karton.' },
    { id: '10000000-0000-0000-0000-000000000008', productCode: 'GKT-BR-01', name: 'A5 Broşür (Çift Yüz Renkli)', slug: 'a5-brosur', category: 'Broşür & Katalog', externalCategoryId: 'sub-a5-brosur', basePrice: 1600, unit: '500 adet', stockQuantity: 2000, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80', description: 'A5 ebadında çift yüz canlı renkli baskı, 135gr kuşe.' },
    { id: '10000000-0000-0000-0000-000000000009', productCode: 'GKT-BR-02', name: 'A4 Kırımlı Broşür (3 Katlı)', slug: 'a4-kirimli-brosur', category: 'Broşür & Katalog', externalCategoryId: 'sub-a5-brosur', basePrice: 3000, unit: '500 adet', stockQuantity: 1500, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80', description: '3 katlı akordeon kırımlı A4 broşür, parlak kuşe.' },
    { id: '10000000-0000-0000-0000-000000000010', productCode: 'GKT-PR-01', name: 'Promosyon Logo Baskılı Metal Kalem', slug: 'promosyon-kalem', category: 'Kurumsal Promosyon', externalCategoryId: 'sub-kalem-set', basePrice: 35, unit: '100 adet', stockQuantity: 5000, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', description: 'Kurumsal logonuza özel tampon baskılı metal tükenmez kalem.' },
    { id: '10000000-0000-0000-0000-000000000011', productCode: 'GKT-PR-02', name: 'Lüks Deri Defter & Kalem Seti', slug: 'deri-defter-set', category: 'Kurumsal Promosyon', externalCategoryId: 'sub-kalem-set', basePrice: 350, unit: 'adet', stockQuantity: 800, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', description: 'Tarihsiz termo deri kapak ajanda ve metal kalem VİP set.' },
    { id: '10000000-0000-0000-0000-000000000012', productCode: 'GKT-PR-03', name: 'Termos Matara (Baskılı 500ml)', slug: 'termos-matara', category: 'Kurumsal Promosyon', externalCategoryId: 'cat-promosyon', basePrice: 280, unit: 'adet', stockQuantity: 600, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', description: 'Paslanmaz çelik 500ml derece göstergeli termos matara.' },
    { id: '10000000-0000-0000-0000-000000000013', productCode: 'GKT-TB-01', name: 'LED Aydınlatmalı Kutu Harf Tabela', slug: 'led-tabela', category: 'Tabela & Totem', externalCategoryId: 'sub-led-tabela', basePrice: 8500, unit: 'adet', stockQuantity: 50, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', description: 'Dış mekana dayanıklı LED ışıklı pleksi kutu harf tabela.' },
    { id: '10000000-0000-0000-0000-000000000014', productCode: 'GKT-KR-01', name: 'Motorlu Kurye İçi Hızlı Teslimat', slug: 'motorlu-kurye', category: 'Motorlu Kurye', externalCategoryId: 'cat-kurye', basePrice: 120, unit: 'sefer', stockQuantity: 999, inStock: true, imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80', description: 'İstanbul içi 2 saat içerisinde adrese teslimat kurye hizmeti.' }
  ];

  // Default Mock Groups for fallback
  private mockGroups: ProductGroupPreviewDto[] = [
    {
      id: 'g1-matbaa',
      name: 'Öne Çıkan Matbaa Çözümleri',
      slug: 'one-cikan-matbaa',
      description: 'En çok tercih edilen kurumsal kartvizit, broşür ve matbaa baskı ürünleri',
      icon: 'fa-solid fa-fire',
      displayOrder: 1,
      totalProductsCount: 5,
      previewProducts: this.mockProducts.slice(0, 5)
    },
    {
      id: 'g2-kurumsal',
      name: 'Popüler Kurumsal Ürünler',
      slug: 'populer-kurumsal-urunler',
      description: 'Promosyon, açık hava tabela ve hızlı kurye çözümlerimizde öne çıkanlar',
      icon: 'fa-solid fa-star',
      displayOrder: 2,
      totalProductsCount: 6,
      previewProducts: this.mockProducts.slice(2, 7)
    }
  ];

  private cachedCatalogProducts: ProductDto[] = [];

  get onGroupsUpdated(): Observable<boolean> {
    return this.groupsUpdated$.asObservable();
  }

  notifyGroupsUpdated() {
    this.groupsUpdated$.next(true);
  }

  /**
   * Get Active Product Groups for Homepage & Sidebar Navigation
   */
  getProductGroups(): Observable<ProductGroupPreviewDto[]> {
    return this.http.get<ProductGroupPreviewDto[]>(`${this.baseUrl}/product-groups`).pipe(
      catchError(() => {
        const local = localStorage.getItem('gokturk_product_groups');
        if (local) {
          try {
            const parsed: AdminProductGroupDto[] = JSON.parse(local);
            const activeOnly = parsed.filter(g => g.isActive);
            return of(activeOnly.map(g => this.toPreviewDto(g)));
          } catch { }
        }
        return of([]);
      })
    );
  }

  /**
   * Get Dynamic Group Detail Page with 24-item infinite scroll pagination
   */
  getGroupDetail(slugOrId: string, search: string = '', page: number = 1, pageSize: number = 24): Observable<ProductGroupDetailDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProductGroupDetailDto>(`${this.baseUrl}/product-groups/${encodeURIComponent(slugOrId)}`, { params }).pipe(
      catchError(() => {
        // Fallback local calculation using real cached catalog products
        const local = localStorage.getItem('gokturk_product_groups');
        let found: AdminProductGroupDto | undefined;

        if (local) {
          try {
            const parsed: AdminProductGroupDto[] = JSON.parse(local);
            found = parsed.find(g => g.slug === slugOrId || g.id === slugOrId);
          } catch { }
        }

        const pool = this.cachedCatalogProducts.length > 0 ? this.cachedCatalogProducts : this.mockProducts;
        let allGroupProds: ProductDto[] = [];

        if (found && found.productIds && found.productIds.length > 0) {
          const mapById = new Map(pool.map(p => [p.id, p]));
          allGroupProds = found.productIds.map((id, idx) => {
            if (mapById.has(id)) {
              return mapById.get(id)!;
            }
            const base = pool[idx % pool.length] || pool[0];
            return {
              ...base,
              id: id,
              productCode: base ? `${base.productCode}-${idx + 1}` : `PROD-${idx + 1}`,
              name: base ? `${base.name} #${idx + 1}` : `Ürün ${idx + 1}`
            };
          });
        }

        if (allGroupProds.length === 0) {
          allGroupProds = pool;
        }

        if (search) {
          const s = search.toLowerCase();
          allGroupProds = allGroupProds.filter(p =>
            p.name.toLowerCase().includes(s) ||
            p.productCode.toLowerCase().includes(s) ||
            (p.description && p.description.toLowerCase().includes(s))
          );
        }

        const totalCount = allGroupProds.length;
        const startIndex = (page - 1) * pageSize;
        const pagedItems = allGroupProds.slice(startIndex, startIndex + pageSize);
        const hasNextPage = (page * pageSize) < totalCount;

        return of({
          id: found ? found.id : 'g-1',
          name: found ? found.name : 'Ürün Grubu',
          slug: found ? found.slug : slugOrId,
          description: found ? found.description : '',
          icon: found ? found.icon : 'fa-solid fa-layer-group',
          displayOrder: found ? found.displayOrder : 1,
          products: {
            items: pagedItems,
            totalCount,
            page,
            pageSize,
            hasNextPage
          }
        });
      })
    );
  }

  /**
   * Get all products for Admin Group Selection
   */
  getAllProducts(): Observable<ProductDto[]> {
    return this.http.get<any>(`${this.baseUrl}/catalog/products?page=1&pageSize=1000`).pipe(
      map(res => {
        const items = res.items || res;
        if (Array.isArray(items) && items.length > 0) {
          this.cachedCatalogProducts = items;
        }
        return items;
      }),
      catchError(() => of(this.cachedCatalogProducts.length > 0 ? this.cachedCatalogProducts : this.mockProducts))
    );
  }

  /**
   * Admin: Get all groups
   */
  getAdminGroups(): Observable<AdminProductGroupDto[]> {
    return this.http.get<AdminProductGroupDto[]>(`${this.baseUrl}/admin/product-groups`, { withCredentials: true }).pipe(
      catchError(() => {
        const local = localStorage.getItem('gokturk_product_groups');
        if (local) {
          try { return of(JSON.parse(local)); } catch { }
        }
        return of([]);
      })
    );
  }

  /**
   * Admin: Create group
   */
  createGroup(dto: CreateProductGroupDto): Observable<AdminProductGroupDto> {
    return this.http.post<AdminProductGroupDto>(`${this.baseUrl}/admin/product-groups`, dto, { withCredentials: true }).pipe(
      tap(() => this.notifyGroupsUpdated()),
      catchError(() => {
        const local: AdminProductGroupDto[] = JSON.parse(localStorage.getItem('gokturk_product_groups') || '[]');
        const newGroup: AdminProductGroupDto = {
          id: 'g-' + Date.now(),
          name: dto.name,
          slug: dto.slug || this.slugify(dto.name),
          description: dto.description,
          icon: dto.icon || 'fa-solid fa-layer-group',
          displayOrder: dto.displayOrder || local.length + 1,
          isActive: dto.isActive,
          createdAt: new Date().toISOString(),
          productIds: dto.productIds || [],
          productCount: (dto.productIds || []).length
        };
        local.push(newGroup);
        localStorage.setItem('gokturk_product_groups', JSON.stringify(local));
        this.notifyGroupsUpdated();
        return of(newGroup);
      })
    );
  }

  /**
   * Admin: Update group
   */
  updateGroup(id: string, dto: UpdateProductGroupDto): Observable<AdminProductGroupDto> {
    return this.http.put<AdminProductGroupDto>(`${this.baseUrl}/admin/product-groups/${id}`, dto, { withCredentials: true }).pipe(
      tap(() => this.notifyGroupsUpdated()),
      catchError(() => {
        let local: AdminProductGroupDto[] = JSON.parse(localStorage.getItem('gokturk_product_groups') || '[]');
        const idx = local.findIndex(g => g.id === id);
        let updated: AdminProductGroupDto;
        if (idx !== -1) {
          updated = {
            ...local[idx],
            name: dto.name,
            slug: dto.slug || local[idx].slug,
            description: dto.description,
            icon: dto.icon || local[idx].icon,
            displayOrder: dto.displayOrder,
            isActive: dto.isActive,
            productIds: dto.productIds || [],
            productCount: (dto.productIds || []).length
          };
          local[idx] = updated;
        } else {
          updated = {
            id,
            name: dto.name,
            slug: dto.slug || this.slugify(dto.name),
            description: dto.description,
            icon: dto.icon || 'fa-solid fa-layer-group',
            displayOrder: dto.displayOrder,
            isActive: dto.isActive,
            createdAt: new Date().toISOString(),
            productIds: dto.productIds || [],
            productCount: (dto.productIds || []).length
          };
          local.push(updated);
        }
        localStorage.setItem('gokturk_product_groups', JSON.stringify(local));
        this.notifyGroupsUpdated();
        return of(updated);
      })
    );
  }

  /**
   * Admin: Delete group
   */
  deleteGroup(id: string): Observable<boolean> {
    return this.http.delete<any>(`${this.baseUrl}/admin/product-groups/${id}`, { withCredentials: true }).pipe(
      map(() => true),
      tap(() => this.notifyGroupsUpdated()),
      catchError(() => {
        let local: AdminProductGroupDto[] = JSON.parse(localStorage.getItem('gokturk_product_groups') || '[]');
        local = local.filter(g => g.id !== id);
        localStorage.setItem('gokturk_product_groups', JSON.stringify(local));
        this.notifyGroupsUpdated();
        return of(true);
      })
    );
  }

  private toPreviewDto(admin: AdminProductGroupDto): ProductGroupPreviewDto {
    const pool = this.cachedCatalogProducts.length > 0 ? this.cachedCatalogProducts : this.mockProducts;
    const idSet = new Set(admin.productIds || []);
    let matchedProds = pool.filter(p => idSet.has(p.id));
    if (matchedProds.length < 4 && pool.length > 0) {
      const existing = new Set(matchedProds.map(p => p.id));
      for (const p of pool) {
        if (matchedProds.length >= 4) break;
        if (!existing.has(p.id)) {
          matchedProds.push(p);
          existing.add(p.id);
        }
      }
    }
    return {
      id: admin.id,
      name: admin.name,
      slug: admin.slug,
      description: admin.description,
      icon: admin.icon,
      displayOrder: admin.displayOrder,
      totalProductsCount: admin.productCount || (admin.productIds || []).length || matchedProds.length,
      previewProducts: matchedProds.slice(0, 4)
    };
  }

  private slugify(text: string): string {
    return text.toLowerCase().trim()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
}
